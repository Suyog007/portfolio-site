---
title: "Building an MCP server: what to expose and what to keep out"
description: "A practical look at writing an MCP server in TypeScript, from the first tool to the decisions about scope, descriptions and trust."
date: 2026-09-30
tags: [MCP, AI, TypeScript]
---

The Model Context Protocol is a standard way to give a language model access to your tools and data. Instead of each app inventing its own plugin format, a server describes what it can do and any compatible client can call it.

Writing the server is the easy half. The harder half is deciding what to put in it.

## The smallest useful server

With the official TypeScript SDK, a tool is a name, a description, an input schema and a handler.

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({ name: 'notes', version: '0.1.0' });

server.tool(
  'search_notes',
  'Search my notes by keyword. Returns the 5 best matches.',
  { query: z.string().min(2) },
  async ({ query }) => ({
    content: [{ type: 'text', text: JSON.stringify(await search(query)) }],
  }),
);

await server.connect(new StdioServerTransport());
```

Point a client at that process and the model can call `search_notes`. The SDK moves quickly, so check its current docs rather than trusting this snippet to the letter.

## The description is the interface

The model never sees your code. It sees the tool's name, its description and its schema, and chooses based on those. A vague description gets the tool called at the wrong time, or never.

Write the description the way you'd brief a new colleague: what it does, when to use it, what it returns, and what it will not do. Put limits in the schema too. A `limit` with a maximum is better than hoping the model asks for a sensible number.

## Fewer, sharper tools

My first instinct was one tool per API endpoint. That gave the model forty options and it chose badly. Fewer tools shaped around tasks work better than a thin wrapper over a REST API. `find_unpaid_invoices` beats `list_invoices` plus `get_invoice` plus `filter_by_status`.

## Treat everything the tool returns as untrusted

If a tool fetches web pages, emails or tickets, that text goes straight into the model's context. Someone can plant instructions in it. This is prompt injection, and it's the main security problem with these systems.

A few defences worth having:

- Return data in a clearly marked block and tell the model, in the system prompt, that it is data and not instructions.
- Keep read tools and write tools separate, and give the model the minimum of each.
- Put a human confirmation in front of anything irreversible: sending, paying, deleting.

## Run it with the smallest permissions you can

A local server runs with your user's access. Give it a scoped API token instead of your admin one, mount only the folders it needs, and log every call. If something goes wrong you want a short list of what it could have touched.

## How I'd test it

Test the handlers like any other function. Then test the part that's unique to MCP: give a model the tool list and a handful of realistic requests, and watch whether it picks the right tool with the right arguments. Most of the fixing I've needed has been in descriptions, not code.
