---
title: Hello, world
description: A new home for my notes on building things, and a small robot that keeps an eye on you while you read.
date: 2026-08-11
tags: [Meta, Frontend]
---

This is my corner of the internet: a place for the things I'm building, the things I'm learning, and the occasional half-formed idea that needs writing down before it makes sense.

Most of my days go into backend systems, smart contracts and the indexers that sit between them, so expect a lot of that here.

## What lives here

- **Writing.** Notes on engineering, Web3, cryptography and whatever else I'm deep in at the time.
- **Projects.** A few things I've built, with links to the code.
- **Resume.** One PDF with the whole picture: work, projects and skills. Download it or read it in the browser.

## About the robot

You may have noticed the little pixel robot next to my name. Move your mouse and it gets up, walks over step by step, and sits down next to your pointer. It smiles when you hover a link, dozes off if you leave it alone, and walks back home when your pointer leaves the window. While it's out, its charging dock keeps its spot next to my name; click the dock to call it back. At home, click the robot and it hops.

It's inspired by [oneko](https://github.com/adryd325/oneko.js), the cat that chased cursors on old desktops, but the artwork is its own: each frame is a 20×20 grid of characters that gets turned into SVG at build time. Every tenth of a second (counted in animation frames, so it rests when the tab is hidden) it takes one step toward you and swaps to the next frame of its walk cycle.

On phones, or if your system asks for reduced motion, it stays home and just turns to face you.

> Small details are the ones people remember.

## How this site is built

It's a static site built with [Astro](https://astro.build).

More soon.
