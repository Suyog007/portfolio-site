---
title: Real-Time Data Indexer & API Platform
summary: An event-driven indexer for on-chain data, with cached REST APIs and live WebSocket updates.
area: [Data, Web3, Full-stack]
stack: [NestJS, PostgreSQL, Redis, BullMQ, WebSockets, Docker, Nginx, GitHub Actions]
github: https://github.com/Suyog007/blockchain-indexer
featured: true
order: 3
---

On-chain events are picked up by idempotent queue workers built on BullMQ, so retries never double-count. The data lands in PostgreSQL and is served through Redis-cached REST APIs, with live updates pushed over WebSockets. It runs in Docker behind an Nginx TLS reverse proxy, with CI on GitHub Actions.
