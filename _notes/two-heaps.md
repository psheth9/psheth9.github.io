---
title: "Two Heaps — sliding median and k-th largest"
date: 2026-05-15
category: algo
difficulty: hard
summary: "Keep a max-heap for the lower half and a min-heap for the upper half. The median lives at one of the two tops. O(log n) per insertion."
problem: "Design a data structure that supports adding numbers and returning the median at any point."
---

## The pattern

Split the stream into two halves:
- **`max_pq`** — lower half. Python's `heapq` is a min-heap, so negate values to simulate a max-heap.
- **`min_pq`** — upper half. Standard min-heap.

Invariant: every element in `max_pq` ≤ every element in `min_pq`. Sizes stay equal or `max_pq` has one extra.

## Template

```python
import heapq

min_pq = []   # upper half — standard min-heap
max_pq = []   # lower half — negate for max-heap

def add_to_min_pq(num):
    """Push num; if over capacity k, discard the smallest."""
    if len(min_pq) < k:
        heapq.heappush(min_pq, num)
    else:
        heapq.heappushpop(min_pq, num)   # push then pop smallest — O(log k)

def add_to_max_pq(num):
    """Push num (negated); if over capacity k, discard the largest."""
    if len(max_pq) < k:
        heapq.heappush(max_pq, -num)
    else:
        heapq.heappushpop(max_pq, -num)

def add_to_min_heap(num):
    """Insert into min_pq; if num belongs in upper half, replace the top."""
    if len(min_pq) < k:
        heapq.heappush(min_pq, num)
    elif num > min_pq[0]:
        heapq.heapreplace(min_pq, num)   # pop + push in one op, more efficient

def add_to_max_heap(num):
    """Insert into max_pq; if num is smaller than current max, replace."""
    if len(max_pq) < k:
        heapq.heappush(max_pq, -num)
        return
    top = -max_pq[0]          # recover positive value
    if top > num:
        heapq.heapreplace(max_pq, -num)

def get_median():
    if len(max_pq) == len(min_pq):
        return (-max_pq[0] + min_pq[0]) / 2
    return -max_pq[0]         # max_pq has the extra element
```

## Complexity

| | |
|---|---|
| Time | O(log n) per insertion, O(1) median query |
| Space | O(n) |

## Key details

- **`heappushpop` vs `heapreplace`** — `heappushpop` pushes first then pops (safe if heap is empty); `heapreplace` pops first then pushes (faster, but heap must be non-empty).
- **Rebalancing** — after each insert, if sizes differ by more than 1, move the top of the larger heap to the smaller one.
- **Negation** — Python has no built-in max-heap. Negate on push, negate again on pop to recover the real value.

## When this pattern shows up

- Find median from data stream (LeetCode 295)
- Sliding window median (LeetCode 480)
- IPO — maximize capital with k projects (LeetCode 502)
- Smallest range covering elements from k lists

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [295](https://leetcode.com/problems/find-median-from-data-stream/) | Find Median from Data Stream | Hard | Two heaps; balance after each insert |
| [480](https://leetcode.com/problems/sliding-window-median/) | Sliding Window Median | Hard | Two heaps + lazy deletion |
| [502](https://leetcode.com/problems/ipo/) | IPO | Hard | Max-heap for profit; min-heap for capital |
| [703](https://leetcode.com/problems/kth-largest-element-in-a-stream/) | K-th Largest in a Stream | Easy | Size-K min-heap |
| [378](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/) | K-th Smallest in Sorted Matrix | Medium | Min-heap of row heads |
