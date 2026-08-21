---
title: "Three ways a DAO treasury goes wrong"
description: "Notes from writing a small proposal-and-vote contract: snapshot your voting power, update state before you send ETH, and decide what 'passed' means."
date: 2026-08-21
tags: [Solidity, Web3]
draft: true
---

A DAO treasury sounds small. Token holders propose a transfer, others vote, and if it passes, the ETH moves. When I wrote [DAO Treasury](/projects) I kept the scope tight, and I still ran into three places where the obvious version of the code is wrong.

## 1. Votes that can be borrowed

The first draft reads voting power straight from the token balance at the moment you vote:

```solidity
uint256 weight = token.balanceOf(msg.sender);
```

The problem: balances move. Someone can vote, send their tokens to a second address, and vote again. Or buy a pile of tokens for one block, vote, and sell.

Fix it by fixing the point in time. Take voting power at a snapshot block, the one when the proposal was created. OpenZeppelin's `ERC20Votes` gives you this with `getPastVotes`.

```solidity
uint256 weight = token.getPastVotes(msg.sender, proposal.snapshotBlock);
require(weight > 0, "no voting power");
```

Tokens acquired after the proposal exists don't count for it.

## 2. Sending ETH before updating state

Execution is where the money leaves, so it's where reentrancy lives. This order is dangerous:

```solidity
(bool ok, ) = p.to.call{value: p.amount}("");
require(ok, "transfer failed");
p.executed = true;
```

If `p.to` is a contract, its fallback can call `execute` again before `executed` flips. Do the bookkeeping first, then send.

```solidity
require(!p.executed, "already executed");
p.executed = true;
(bool ok, ) = p.to.call{value: p.amount}("");
require(ok, "transfer failed");
```

Checks, then effects, then the external call. Adding `nonReentrant` from OpenZeppelin as a second layer costs very little.

<figure>
  <img src="/posts/dao-execute-order.svg" alt="Three steps in order: check, mark executed, then send the ETH." width="720" height="120" />
  <figcaption>The order inside execute.</figcaption>
</figure>

## 3. Nobody defined "passed"

"More yes than no" sounds like a rule until you ask the follow-up questions.

- Is there a minimum turnout? Without a quorum, one holder voting alone on a quiet proposal can empty the treasury.
- Is there a voting window? Without a deadline, a proposal can sit open until the vote swings your way.
- Can the treasury actually cover it? A proposal for more ETH than the contract holds will pass and then fail at execution, which is a confusing place to find out.

I'd write these down as explicit checks in `execute`: deadline over, quorum met, yes greater than no, balance sufficient. Each is one line, and each closes a hole.

## What a test suite should include

- A voter who transfers tokens mid-vote can't vote twice.
- A malicious recipient that re-enters `execute` gets nothing extra.
- A proposal below quorum can't execute, even with unanimous support.

If those three pass, the contract is in better shape than a lot of first attempts. It still isn't audited, and for real money it should be.
