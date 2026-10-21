---
title: "Writing Move after Solidity"
description: "What changes when assets are objects you own instead of rows in a contract's mapping, and the Solidity habits I had to drop."
date: 2026-09-20
tags: [Move, Sui, Solidity]
---

Solidity trained me to think of a token as a number in a mapping. The contract owns the ledger, and `balances[alice]` is the truth. Move, at least the flavour used on Sui, starts somewhere else: an asset is a value, and whoever holds the value owns it.

Most of the adjustment comes from that one change.

## Assets are objects, not entries

In Solidity, a transfer edits two entries in a table the contract keeps.

```solidity
balances[msg.sender] -= amount;
balances[to] += amount;
```

In Sui Move, a coin is an object with its own id, and it lives in the owner's account. Sending it hands the object over.

```move
public fun send(coin: Coin<SUI>, to: address) {
    transfer::public_transfer(coin, to);
}
```

There's no table to corrupt. Nothing was subtracted, so nothing can be subtracted twice.

## Abilities replace a lot of checks

Move types carry abilities: `copy`, `drop`, `store`, `key`. A struct that has none of `copy` and `drop` can't be duplicated or silently thrown away. The compiler forces you to deal with it, by storing it, passing it on, or unpacking it.

```move
public struct Ticket has key, store {
    id: UID,
    event: u64,
}
```

In Solidity I'd write a require to stop double use. Here you can often make the bad state impossible to express, which is a better place to be.

## Habits I had to drop

- **Reaching for a global mapping.** My first Move code kept a `Table<address, u64>` out of habit. Usually the right answer was to give each user their own object.
- **Thinking in msg.sender.** Authority comes from what you hold. If a function takes an `AdminCap`, only someone with that object can call it. The capability pattern replaces most `onlyOwner` modifiers.
- **Fearing reentrancy.** The classic Solidity attack mostly doesn't apply, because there are no dynamic external calls handing control to untrusted code mid-function. The risks move to logic errors and bad capability design.
- **Assuming upgrades work like proxies.** Package upgrades have their own rules and compatibility constraints. Read them before you ship version one.

## Where it still bites

Shared objects need consensus and are slower than owned ones, so deciding what's shared is a design choice with a performance cost. Error messages are terse until you learn to read them. And the ecosystem is smaller, so you'll read source where in Solidity you'd find a library.

## Should you switch?

For asset-heavy logic like games, tickets, or anything that is really "a thing someone owns", the Move model fits well. For a pure accounting contract, Solidity's mapping is still the simpler way to say it. I'd learn Move for the ideas even if the job stays on EVM, because thinking in ownership made my Solidity cleaner too.
