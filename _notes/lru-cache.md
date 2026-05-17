---
title: "LRU cache — clean implementation in 30 lines"
date: 2026-05-08
category: algo
difficulty: medium
summary: "Doubly-linked list + hash map. The classic O(1) get/put implementation."
problem: "Design a data structure that supports get(key) and put(key, value) in O(1), evicting the least-recently-used entry when full."
---

## The key insight

Two data structures, each doing what it's best at:

- **Hash map** — O(1) lookup from key to the node.
- **Doubly-linked list** — O(1) move-to-front and remove-from-tail.

The hash map gives us random access. The list gives us ordering. Combining them lets us do *both* operations in O(1).

## Implementation

```python
class Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}
        # sentinels for clean edge cases
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_to_front(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_to_front(node)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]
```

## Why sentinels

Head/tail sentinels eliminate edge cases. Without them, every insert/remove needs to handle "what if this is the first/last node." With sentinels, every real node is guaranteed to have both a `prev` and a `next` — no null checks.

## Variants worth knowing

- **LFU cache** — same idea but ordered by frequency, with ties broken by recency.
- **TTL cache** — add expiration; lazily evict on access OR run a background sweep.
- **Approximate LRU (CLOCK)** — production systems often use this because true LRU is expensive at scale.

## Where this comes up in real systems

Almost everywhere. Page caches, CDN edge nodes, query result caches, browser HTTP cache. The classic question is whether *true* LRU is worth the extra bookkeeping vs an approximation — at scale, the answer is almost always "use the approximation."

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [146](https://leetcode.com/problems/lru-cache/) | LRU Cache | Medium | DLL + hashmap; sentinel nodes |
| [460](https://leetcode.com/problems/lfu-cache/) | LFU Cache | Hard | Two dicts + freq-bucketed DLL |
| [432](https://leetcode.com/problems/all-oone-data-structure/) | All O(1) Data Structure | Hard | DLL of frequency buckets |
| [1172](https://leetcode.com/problems/dinner-plate-stacks/) | Dinner Plate Stacks | Hard | Ordered stacks with push/pop hints |
