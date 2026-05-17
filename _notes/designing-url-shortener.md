---
title: "Designing a URL shortener at scale"
date: 2026-05-11
category: system-design
difficulty: medium
summary: "The classic system design question. The interesting parts are the ID scheme and the read path, not the SQL schema."
---

The URL shortener is the "hello world" of system design interviews, but the version most people answer is too shallow. Here's a more honest sketch.

## Requirements

Assume:

- 100M new URLs / day → ~1,160 writes/sec average, peaks 5-10×
- 10B redirects / day → ~115,000 reads/sec average, peaks 5-10×
- p99 redirect latency < 50 ms (it's on the critical path for clicks)
- Custom aliases optional

So: **read-heavy** (~100×), low-latency, globally distributed.

## The ID scheme — pick one

This is the part people skim past, but it's where the design lives or dies.

### Option A — Hash the URL, take first N chars

Simple, but collision-prone. You'll need a "is this taken" check, which becomes a hot path. Bad.

### Option B — Counter + base62

Maintain a monotonic counter; encode in base62 (0-9, a-z, A-Z). At 1B counter, you get 6-char IDs. Perfectly compact, no collisions.

Downside: the counter is a single hot key. Solutions:

- **Range allocation** — each app server pre-reserves a block of 10k IDs from the counter, hands them out locally.
- **Sharded counters** — N counters with deterministic mixing so IDs stay short.

### Option C — Snowflake-style

64-bit ID = timestamp + machine ID + sequence. Globally unique without coordination. Encoded as base62, fits in ~11 chars.

I'd go with **B with range allocation** for shortest URLs, or **C** if I'm OK with slightly longer URLs in exchange for zero coordination.

## The read path

10B reads/day. Almost none of them need the database.

- **CDN edge cache** for the top 1% of links (which will serve ~80% of traffic — Zipf distribution).
- **In-memory cache** (Redis / Memcached) for the next 10%.
- **Database lookup** only for the long tail.

Database is partitioned by `short_id` (consistent hashing across N shards). Reads are point lookups — primary key on `short_id`. P99 should be < 5 ms from a warm shard.

## The write path

Much rarer, much simpler:

1. Allocate ID (from your pre-reserved range)
2. Write `(short_id, long_url, owner, created_at)` to the database
3. Async fan-out: warm the cache, push to analytics pipeline

Idempotent on retry — same input URL from same user can return the existing short URL instead of creating a new one (optional, configurable).

## What I'd push back on in an interview

- **"Do we need SQL?"** — No. This is a key-value workload. A wide-column store (Cassandra, ScyllaDB) handles it better at this scale.
- **"What about analytics?"** — Don't put click counts in the same table. Stream redirects to Kafka, aggregate in a separate analytics pipeline. The serving path stays read-only.
- **"What about abuse?"** — Rate limit at the edge, run periodic scans for malware/phishing patterns, integrate with a URL reputation service. This is the actual hardest part of running a real URL shortener.

## Reference systems

- Bitly — original at-scale shortener
- T.co — Twitter's internal one
- goo.gl — RIP, instructive postmortem on why Google shut it down
