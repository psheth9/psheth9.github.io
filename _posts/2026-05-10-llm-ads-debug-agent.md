---
title: "Building an LLM agent for Ads debugging at Meta"
date: 2026-05-10
tags: [llm, ads, rag, tool-use]
excerpt: "What worked, what didn't, and where retrieval-augmented agents actually earn their keep."
---

Some of the most painful work at any Ads org is *figuring out why a specific ad didn't get delivered*. Logs are everywhere. Metrics live in five different systems. The team you need to ask is asleep in another timezone.

This is the kind of problem LLMs are obviously good at, but the path from "obviously good" to "actually useful in production" is longer than people think.

## The shape of the problem

When an advertiser complains "my ad isn't being delivered," the engineer on call has to walk a graph:

- Was the campaign budget exhausted?
- Did the targeting filter everyone out?
- Did the ranker score it too low?
- Did frequency capping kick in?
- Is there an outage in a downstream system?

Each branch has its own logs, dashboards, and ownership. Investigation can take hours.

## What we built

Sketch it as three pieces:

1. **Retrieval** over a curated index of logs, metrics, and runbooks. Cheap, narrow, and effective. We *don't* try to retrieve over all of Meta — just the relevant slice for an Ads-delivery question.
2. **Tools** — wrappers around the same internal CLIs an on-call engineer would use. The model decides which to call and chains them together.
3. **A reasoning loop** that's allowed to think across multiple tool calls before answering.

## Lessons that surprised me

- *Tool descriptions matter more than prompt engineering.* If a tool's description is fuzzy, the model picks the wrong one. Spending half a day rewriting tool descriptions did more than two weeks of prompt tweaks.
- *Letting the model say "I don't know"* dramatically improved trust. Engineers stopped second-guessing every answer.
- *Don't let it act on production.* Read-only tools only. The agent suggests, the on-call decides.

More posts to come on the retrieval index design and the eval setup.
