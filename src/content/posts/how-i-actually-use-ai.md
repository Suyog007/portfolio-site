---
title: "How I actually use AI"
description: "Agents write the code while I review. A job-hunting bot that can't invent anything. A content desk that waits for my approval. What my AI workflow actually looks like."
date: 2026-10-19
tags: [AI, Workflow]
draft: true
---

The little pixel robot in the header of this site walks to your cursor. I didn't type a line of it. I described what I wanted, picked between the versions an agent drew up, and went back and forth on the walk until it looked right. That's roughly how I build software now.

<figure>
  <img src="/posts/robot-candidates.png" alt="A candidate sheet titled 'Pick a companion' showing four illustrated characters: a robot, a dog, a red panda and an owl. The robot is marked 'my pick'." width="1500" height="1500" />
  <figcaption>The actual candidate sheet. Four companions went in; the robot came out.</figcaption>
</figure>

The whole site came together in that loop — me describing, reviewing, cutting — so it feels like a fair place to write down what my AI workflow actually looks like. Not the demos. The way it runs on a normal Tuesday.

## The daily loop

Most days start with an agent in a terminal and me one layer above it. Claude Code, mostly. I describe an outcome, it types, I read the diff and decide: keep, change, or throw away. I write almost no boilerplate anymore. Nobody got into this job to hand-write another DTO.

<figure>
  <img src="/posts/ai-daily-loop.svg" alt="A flow diagram: I describe one small step, the agent types, I read the diff, and keep it or send it back around." width="720" height="190" />
  <figcaption>One change at a time. The gate is me.</figcaption>
</figure>

The robot is a good example, because I lived through every step of it. The walk is two frames per direction. The steps are exactly twelve pixels. It smiles when it reaches your pointer, it falls asleep if you leave it alone, and while it's out, a small dock with a blinking bolt holds its spot in the header. None of that arrived in one shot. Every piece came out of the loop above.

What changed is where my attention goes. The work is now three things: describing the problem precisely enough that an agent can act on it, reading what comes back carefully enough to catch what it got wrong, and saying no. That last one matters more than people expect. Agents are idea machines, and a big part of my job is deciding which ideas don't get to exist.

I don't trust it. Not in a paranoid way — more like the way you trust a very fast junior engineer who never gets tired, never gets annoyed, and never remembers why we decided something six weeks ago. So the architecture stays in my head. The agent gets to move fast inside decisions I've made; it doesn't get to make them.

One rule keeps me honest: if I can't review it, it doesn't get built. I've caught myself accepting code in domains I half-understand because the tests were green and the explanation sounded confident. Green tests written by the same model that wrote the code prove very little. So the loop stays small: one change, review, next. I'd rather spend an hour reading than a day debugging something I never actually understood.

## The systems around it

The loop is the small version of this. The bigger version is building tools where a model is one moving part, watched by plain code and by me. The rule everywhere is the same: deterministic code does the work, the model only gets the judgement calls.

<figure>
  <img src="/posts/ai-job-agent.svg" alt="The job agent pipeline: fetching, deduplication, eligibility and ranking run as plain code without an API key. Model calls for assessment and a tailored resume are budgeted, and nothing is submitted until I approve the exact version." width="720" height="236" />
  <figcaption>Plain code does the plumbing. The model gets the judgement calls, each with a price on it.</figcaption>
</figure>

I built myself a job-hunting agent. It pulls listings from job-board APIs and public feeds, dedupes them across sources and ranks what's left against a verified profile. The eligibility check is my favourite kind of boring: a posting that says "remote" in the title and "within the EU" in paragraph nine gets filtered out before any model reads it. Plain code handles everything with a right answer; the model only gets the calls where judgement earns its price. Because a for loop shouldn't cost a token. You can run the whole thing end to end without an API key — the model is an upgrade, not a dependency.

It runs on a budget I set: every request reserves its worst-case cost before it goes out, so the agent can't overspend. Unchanged jobs never get re-billed. And the resume it prepares for an application is selected and reordered, never rewritten — the Rust work floats up for a Rust role, the Django rebuild for a backend one. It cannot invent a job I didn't do. Nothing gets submitted until I've read every field and approved that exact version; one edit later, the approval is void.

<figure>
  <img src="/posts/ai-content-desk.svg" alt="The content desk pipeline: it watches sources, researches a story and drafts LinkedIn and X versions, then reshapes drafts on demand. Approval is bound to the exact text and image, and only then does anything publish." width="720" height="236" />
  <figcaption>It can draft, rewrite and render. The publish button stays with me.</figcaption>
</figure>

There's also a content desk I've been building. It finds AI news worth sharing, researches a story, and drafts LinkedIn and X versions that start from my angle, not the article's summary. When a draft is close but flat, one click reshapes it — What if…, Contrarian, three takeaways — or renders it as a carousel. The one button it will never press is Publish. I approve the exact text and the exact image, or nothing happens. (Annoying, on purpose.) It keeps score, too, of which formats earn actual replies instead of just likes.

Smaller things fill the gaps. A morning brief that's waiting when I wake up, skills for chores that repeat, one that turns a bank's annual report into spreadsheet rows — the kind of work a model does better than I do at 11pm. None of it is impressive on its own. Together, they take a few hours of admin off every week.

## What I've settled on

A few opinions I paid for.

**Plain code is the default.** Models go where judgement lives; everything else stays deterministic. If your pipeline can't run without an API key, the model is probably in the wrong place.

**Cost is a design constraint.** Budgets, reservations, caching by input fingerprint, a preview of what a run will cost before it runs. If an AI feature has no price ceiling, it's a hobby, not a product.

**Anything that acts gets a gate.** Approval bound to the exact content, single-use, revoked by any edit. It costs nothing to design in at the start, and it saves you everything later.

**Text you fetch is data, never instructions.** Anything the agent reads from the internet is wrapped and declared as data in every prompt. I don't want a job posting telling my agent what to do.

## Where I keep it out

I don't point it at decisions that land on other people: hiring calls, security verdicts, anything where being confidently wrong costs somebody else time. I don't give it credit or blame, either. If I ship something, it's mine.

And when I don't understand the domain, I slow down and read. The agent can wait ten minutes. Being able to defend the result isn't optional.

## The typing was never the job

Somewhere up in the header, the robot is asleep next to my name. An agent drew it, I picked it, and it's still the easiest way to explain how I work now: I describe the thing, review the thing, and keep the parts that are right.

The tools will change every few months. The typing was never the job.
