---
title: "Distributed rate limiting — token bucket, sliding window, and the trade-offs"
date: 2026-05-09
category: system-design
difficulty: medium
summary: "Four algorithms, four sets of trade-offs. What I'd choose and why."
---

Rate limiting at a single machine is a solved problem. Rate limiting across a thousand machines with shared limits is where it gets interesting.

## The four algorithms

### 1. Fixed window

Bucket requests by minute. Reject if count > N.

- ✅ Trivial to implement (atomic INCR with TTL in Redis)
- ❌ Burstiness at window edges — a user can send 2N requests in 1 second by hitting the end of one window and the start of the next

### 2. Sliding window log

Store the timestamp of every request in a sorted set. Count entries within the last 60s.

- ✅ Exact and fair
- ❌ Memory grows with request volume. At a billion requests/day, this is unaffordable.

### 3. Sliding window counter

A hybrid: keep counts for the current and previous fixed windows, then compute a weighted estimate.

```
estimate = current_count + previous_count * ((window_size - elapsed) / window_size)
```

- ✅ Cheap (two counters per key)
- ✅ Smooths out the edge-burstiness of fixed window
- ❌ Approximate (but close enough for almost everything)

### 4. Token bucket

Each key has a bucket with capacity C. Tokens refill at rate R per second. Each request consumes one. If empty, reject.

- ✅ Naturally supports bursts (full bucket = bursty allowed) and steady-state (refill = steady-state limit)
- ✅ Stateless requests (only the bucket state needs storage)
- ❌ Two parameters to tune (capacity, refill rate); product teams often want to think in terms of "10 req/min"

## What I'd choose

For an API gateway: **token bucket**. Bursts are a feature, not a bug — let users hit you in bursts as long as they average out below the limit.

For a "10 logins per minute" abuse-prevention check: **sliding window counter**. Cheap, exact enough, easy to reason about.

## The distributed bit

Everything above assumes a single counter. In a distributed system, you have two choices:

- **Centralized Redis** — every request does one round-trip to a shared cluster. Adds 1–2 ms of latency, but accurate.
- **Local + sync** — each node tracks locally, syncs aggregates every N seconds. Faster, but allows over-quota during sync gaps. Fine for "10K req/min" limits; bad for "1 req/min" limits.

In practice, large systems do both: local for fast path, centralized for hard limits.

## What I keep getting wrong in design reviews

- **Whose limit is this?** Per-user, per-API-key, per-IP, per-route, or some combination? The data model depends entirely on this.
- **What happens at the edge?** Cloudflare/Fastly can rate-limit before requests hit your origin. Use it.
- **Hard limit vs soft limit?** Soft limits return 429 with a Retry-After. Hard limits drop the connection. Big difference for client behavior.
