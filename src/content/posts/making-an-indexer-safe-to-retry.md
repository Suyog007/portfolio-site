---
title: "Making an indexer safe to retry"
description: "Queues retry. Chains reorg. Workers crash halfway through. Here is how I stop an on-chain indexer from counting the same event twice."
date: 2026-08-31
tags: [Backend, Web3]
draft: true
---

An indexer has one job: read what happened on chain and write it down. The part that bites is that "read it once" is not something you get to have. Workers crash. A queue redelivers a job because the ack got lost. A node hiccups and you re-scan a block range to be safe. Every one of those means the same event shows up again.

If handling an event twice gives you a different database than handling it once, you have a bug that only appears under load, which is the worst place for one.

## Give every event an identity

On an EVM chain, a log is uniquely identified by its transaction hash and its log index. Block number alone isn't enough, and neither is the transaction hash, because one transaction can emit many logs.

```ts
const eventId = `${log.transactionHash}:${log.logIndex}`;
```

Everything else follows from this. The same id has to mean the same event no matter how many times you see it.

## Dedupe at the queue

With BullMQ you can pass that id as the job id. Adding a job whose id already exists is a no-op, so the scanner can overlap its ranges without flooding the workers.

```ts
await queue.add('log', log, { jobId: eventId });
```

This is a convenience, not a guarantee. Once a finished job is cleaned up, the same id can be added again. Don't lean on it for correctness.

## Enforce it in the database

The real guarantee lives where the data does. Put a unique constraint on the event id and make the write idempotent.

```sql
CREATE TABLE transfers (
  tx_hash   text    NOT NULL,
  log_index integer NOT NULL,
  from_addr text    NOT NULL,
  to_addr   text    NOT NULL,
  amount    numeric NOT NULL,
  PRIMARY KEY (tx_hash, log_index)
);

INSERT INTO transfers (tx_hash, log_index, from_addr, to_addr, amount)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (tx_hash, log_index) DO NOTHING;
```

Now a retry is harmless. The second insert does nothing and the worker moves on.

<figure>
  <img src="/posts/indexer-retry.svg" alt="A flow from log to queue to Postgres to the same result, with duplicates ignored at the queue and at the database." width="720" height="120" />
  <figcaption>Duplicates get dropped twice. Only the second drop is one you can rely on.</figcaption>
</figure>

## Derived numbers are where it goes wrong

Raw rows are the easy case. Trouble starts with anything computed from them, like a balance, a running total or a leaderboard. If the handler does `balance += amount`, a replay double-counts, and the unique constraint on the raw table doesn't save you.

Two ways out:

- Do the insert and the update in one transaction, and only update the total when the insert actually inserted a row (`ON CONFLICT DO NOTHING` plus checking the affected row count).
- Don't store the total at all. Compute it from the raw rows, and cache the result in Redis if reads are heavy. Slower to write the query, much harder to corrupt.

I lean toward the second until the query is genuinely too slow.

## Reorgs

A block you indexed can stop being part of the chain. Two habits help. Don't treat a block as final until it's some number of confirmations deep, and pick that number per chain. And store the block hash next to the block number, so when the hash at a height changes you know to roll back and re-read from there.

Rolling back is only simple if your writes are keyed by event id and tied to a block. Another reason to keep the raw table honest.

## The test I'd write first

Feed the same batch of events through the worker twice, in a different order the second time, and assert the database is identical. If that test passes, most of the scary failure modes are already covered.
