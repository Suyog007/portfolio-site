---
title: "Encrypting in the browser, not on the server"
description: "What changes when a post is encrypted before it leaves the client, and why 'encrypted at rest' is a weaker claim than it sounds."
date: 2026-09-10
tags: [Cryptography, Web3]
draft: true
---

Most apps that say they encrypt your data mean two things: the connection uses TLS, and the disk is encrypted at rest. Both are good. Neither stops the company running the server from reading your data, because the server holds the keys.

End-to-end encryption means the server never sees plaintext. Building [Encrypted_X](/projects) made the difference concrete for me, so here is the shape of it.

## The basic move

Encrypt on the client, upload the ciphertext, decrypt on the client.

```ts
const ciphertext = await encrypt(plaintext, policy);
await api.createPost({ body: ciphertext });
// later, on a reader's device
const plaintext = await decrypt(post.body, credentials);
```

The server stores and serves bytes. It can't search them, can't moderate them by reading them, and can't hand them to anyone who asks. That's the point, and also the cost.

## The hard part is who gets the key

Encrypting is easy. Deciding who may decrypt is the real design problem. In a feed where an author approves followers one at a time, the list changes constantly, and you don't want to re-encrypt every old post each time it does.

The approach I used leaves key management to Seal, a threshold encryption service on Sui. As I understand it, the author encrypts against an identity, and the access rule is written in a Move contract on chain. To read, a client asks a set of independent key servers for key material. Each server checks the on-chain rule and answers only if it passes. No single server can decrypt on its own.

That moves trust from "the app's backend" to "the rule on chain plus a quorum of key servers". Whether that's an improvement depends on whether you trust that quorum more than one company, but it does remove the single place where everything can be read.

<figure>
  <img src="/posts/encrypted-feed.svg" alt="Author browser encrypts, server stores ciphertext, key servers check the on-chain rule, reader browser decrypts." width="720" height="120" />
  <figcaption>Who sees what in an encrypted feed.</figcaption>
</figure>

## What you give up

- **Search.** You can't index text you can't read. Anything server-side that needs content has to be rethought.
- **Recovery.** Lose the keys and the data is gone. There's no "forgot password" that restores old posts.
- **Revocation is fuzzy.** If someone already decrypted a post, taking away their access doesn't make them forget it. You can stop future reads, not past ones.
- **Metadata still leaks.** The server doesn't see what you wrote, but it still sees who wrote, when, and how often.

## Where I'd start

Be exact about the claim you're making. "We can't read your posts" is a strong statement and should be backed by where the keys live and what the server actually receives. If you can't point to that, say "encrypted at rest" and leave it there.
