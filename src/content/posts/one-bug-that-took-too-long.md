---
title: "The bug that took far too long"
description: "A postmortem in four parts: what I saw, what I assumed, what was actually wrong, and what I'd change about how I debug."
date: 2026-10-10
tags: [Debugging, Engineering]
draft: true
---

<!--
TODO before publishing: this one has to be your real bug. Replace each section
below with what actually happened. Specifics are what make a postmortem worth
reading: real error messages, the wrong theory you held, how long it took.
Delete this comment when done.
-->

## What I saw

Describe the symptom exactly as it first appeared. Where did it show up, how often, and what did it look like to a user? Paste the real error or log line.

## What I assumed

What was your first theory, and why did it seem reasonable? List the things you tried that didn't help. This is the section readers learn the most from, so be honest about the dead ends.

## What was actually wrong

The real cause, in plain terms, ideally with the few lines of code or config involved. Say how you finally found it: the log, the diff, the person who asked the right question.

## What I changed

Two kinds of fix: the code change, and the habit or tooling change that would have caught this sooner. A test, an alert, a better log line, a rule about how you read stack traces.

## The takeaway

One sentence you'd tell a teammate.
