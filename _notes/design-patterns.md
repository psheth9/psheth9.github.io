---
title: "Design Data Structures — Templates & Patterns"
date: 2026-05-17
category: algo
difficulty: medium
summary: "Design patterns for common interview data structures: MinStack, MaxStack with lazy deletion, HitCounter with circular array, LRU Cache with OrderedDict, and Insert-Delete-GetRandom O(1)."
problem: "Design problems test whether you can compose simpler structures (stack + heap, dict + list) to achieve better complexity than any single structure alone."
---

## 1. MinStack — O(1) getMin (LC 155)

```python
# Maintain a parallel min-stack. Each push records the current minimum.
# When you pop the main stack, pop the min-stack too.
# min[-1] is always the minimum of everything currently in the stack.

class MinStack:
    def __init__(self):
        self.stack = []
        self.mins  = []

    def push(self, val):
        self.stack.append(val)
        current_min = min(val, self.mins[-1]) if self.mins else val
        self.mins.append(current_min)

    def pop(self):
        self.stack.pop()
        self.mins.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.mins[-1]
```

---

## 2. MaxStack — O(log n) popMax (LC 716)

```python
# Stack + max-heap. Problem: popping from one structure doesn't remove from the other.
# Solution: lazy deletion — track deleted indices; skip them on access.

import heapq

class MaxStack:
    def __init__(self):
        self.stack   = []          # (value, index)
        self.heap    = []          # (-value, -index) — max-heap via negation
        self.deleted = set()       # indices that have been logically deleted
        self.index   = 0

    def push(self, x):
        self.stack.append((x, self.index))
        heapq.heappush(self.heap, (-x, -self.index))
        self.index += 1

    def _clean_stack(self):
        while self.stack and self.stack[-1][1] in self.deleted:
            self.stack.pop()

    def _clean_heap(self):
        while self.heap and -self.heap[0][1] in self.deleted:
            heapq.heappop(self.heap)

    def pop(self):
        self._clean_stack()
        val, idx = self.stack.pop()
        self.deleted.add(idx)
        return val

    def top(self):
        self._clean_stack()
        return self.stack[-1][0]

    def peekMax(self):
        self._clean_heap()
        return -self.heap[0][0]

    def popMax(self):
        self._clean_heap()
        val, neg_idx = heapq.heappop(self.heap)
        self.deleted.add(-neg_idx)
        return -val
```

---

## 3. Hit counter — two implementations (LC 362)

```python
# Version 1 — queue (simple, memory grows with hit rate)
from collections import deque

class HitCounter_Queue:
    def __init__(self):
        self.que = deque()

    def hit(self, timestamp):
        self.que.append(timestamp)

    def getHits(self, timestamp):
        while self.que and timestamp - self.que[0] >= 300:
            self.que.popleft()
        return len(self.que)


# Version 2 — circular array (O(300) constant space regardless of hit rate)
# Key: slot = timestamp % 300. If the stored timestamp matches, increment.
# If not, it's from a previous cycle — reset the slot.

class HitCounter_Circular:
    def __init__(self):
        self.counts = [0] * 300   # hit count per slot
        self.times  = [0] * 300   # which timestamp owns this slot

    def hit(self, timestamp):
        slot = timestamp % 300
        if self.times[slot] == timestamp:
            self.counts[slot] += 1
        else:
            self.times[slot]  = timestamp
            self.counts[slot] = 1

    def getHits(self, timestamp):
        total = 0
        for i in range(300):
            if timestamp - self.times[i] < 300:
                total += self.counts[i]
        return total
```

---

## 4. LRU Cache — OrderedDict (LC 146)

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap   = capacity
        self.cache = OrderedDict()   # insertion-order dict with O(1) move_to_end

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)  # mark as recently used
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)   # evict least recently used (front)
```

---

## 5. Insert Delete GetRandom O(1) (LC 380)

```python
# dict alone can't getRandom in O(1) — no index-based access.
# Combine: dict maps value → list index; list holds values.
# Delete trick: swap target with last element, then pop last.

import random

class RandomizedSet:
    def __init__(self):
        self.val_to_idx = {}
        self.vals       = []

    def insert(self, val):
        if val in self.val_to_idx:
            return False
        self.val_to_idx[val] = len(self.vals)
        self.vals.append(val)
        return True

    def remove(self, val):
        if val not in self.val_to_idx:
            return False
        idx  = self.val_to_idx[val]
        last = self.vals[-1]

        self.vals[idx]          = last     # overwrite target with last
        self.val_to_idx[last]   = idx      # update last's index
        self.vals.pop()
        del self.val_to_idx[val]
        return True

    def getRandom(self):
        return random.choice(self.vals)
```

---

## 6. Min / max with efficient operations — summary

```python
# MinStack  → parallel min-stack, O(1) all ops
# MaxStack  → stack + heap + lazy deletion, O(log n) popMax
# Deque max → monotonic deque for sliding window max (see sliding-window note)

# Pattern: when a heap and a stack conflict on deletions,
# use a "deleted" set for lazy cleanup — skip on next access.
```

---

## Complexity

> **Key insight:** Lazy deletion lets you compose a stack and heap without paying O(n) per delete — instead, you pay O(log n) amortized by cleaning at access time.

| Structure | push/put | pop/get | Special op | Space |
|---|---|---|---|---|
| MinStack | **O(1)** | O(1) | getMin O(1) | O(n) |
| MaxStack | **O(log n)** | O(log n) | popMax O(log n) | O(n) |
| HitCounter (queue) | O(1) | O(n) | — | O(hits in 300s) |
| HitCounter (circular) | **O(1)** | O(300)=O(1) | — | O(1) |
| LRU Cache | O(1) | O(1) | move_to_end O(1) | O(cap) |
| RandomizedSet | O(1) | O(1) | getRandom O(1) | O(n) |

---

## When this pattern shows up

- **MinStack / MaxStack** — any problem needing O(1) min/max alongside push/pop
- **HitCounter circular** — rate limiting, rolling window counts at massive scale
- **LRU** — cache eviction, any "least recently used" constraint
- **RandomizedSet** — random sampling from a dynamic set in O(1)
- **Lazy deletion** — whenever you need to delete from the middle of a heap or queue

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [155](https://leetcode.com/problems/min-stack/) | Min Stack | Medium | Parallel min-stack |
| [716](https://leetcode.com/problems/max-stack/) | Max Stack | Hard | Stack + heap + lazy deletion |
| [362](https://leetcode.com/problems/design-hit-counter/) | Design Hit Counter | Medium | Queue vs circular array |
| [146](https://leetcode.com/problems/lru-cache/) | LRU Cache | Medium | OrderedDict + move_to_end |
| [380](https://leetcode.com/problems/insert-delete-getrandom-o1/) | Insert Delete GetRandom O(1) | Medium | dict + list + swap-and-pop |
| [432](https://leetcode.com/problems/all-oone-data-structure/) | All O(1) Data Structure | Hard | Doubly linked list + dict |
| [460](https://leetcode.com/problems/lfu-cache/) | LFU Cache | Hard | Two dicts + freq list |
| [295](https://leetcode.com/problems/find-median-from-data-stream/) | Find Median from Data Stream | Hard | Two heaps (see heap-patterns note) |
