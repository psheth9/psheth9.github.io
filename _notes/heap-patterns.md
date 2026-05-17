---
title: "Heap Patterns — Templates & Problems"
date: 2026-05-17
category: algo
difficulty: medium
summary: "Heap patterns beyond the basics: K-th largest with a size-K min-heap, two-heaps for streaming median, QuickSelect for O(n) K-th element, and merge K sorted lists."
problem: "A size-K min-heap is the canonical tool for 'K largest elements' — the heap top is always the K-th largest seen so far. Two heaps split a stream into two halves to track the median."
---

## 1. K-th largest element — size-K min-heap (LC 703 / 215)

```python
import heapq

class KthLargest:
    """Maintain a min-heap of size K. The root is always the K-th largest."""

    def __init__(self, k, nums):
        self.k    = k
        self.heap = []
        for n in nums:
            self.add(n)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)     # evict smallest; keep top-K
        return self.heap[0]             # root = K-th largest

# One-shot: K-th largest in unsorted array
def findKthLargest(nums, k):
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]

# findKthLargest([3,2,1,5,6,4], 2) → 5
```

---

## 2. Two heaps — find median from data stream (LC 295)

```python
# Split stream into two halves:
#   max_heap (negated) → smaller half   → top = max of smaller half
#   min_heap           → larger half    → top = min of larger half
# Invariant: len(max_heap) == len(min_heap)  OR  len(max_heap) == len(min_heap) + 1
# Median: top of max_heap (odd) OR average of both tops (even)

import heapq

class MedianFinder:
    def __init__(self):
        self.small = []   # max-heap (negated) — smaller half
        self.large = []   # min-heap — larger half

    def addNum(self, num):
        heapq.heappush(self.small, -num)           # push to small

        # Ensure every element in small ≤ every element in large
        if self.small and self.large and (-self.small[0] > self.large[0]):
            heapq.heappush(self.large, -heapq.heappop(self.small))

        # Balance sizes: small can have at most one extra
        if len(self.small) > len(self.large) + 1:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        elif len(self.large) > len(self.small):
            heapq.heappush(self.small, -heapq.heappop(self.large))

    def findMedian(self):
        if len(self.small) > len(self.large):
            return -self.small[0]
        return (-self.small[0] + self.large[0]) / 2.0
```

---

## 3. QuickSelect — K-th smallest in O(n) average (LC 215)

```python
import random

def quickSelect(nums, k):
    """Find the K-th smallest element (1-indexed)."""

    def partition(lo, hi):
        pivot_idx = random.randint(lo, hi)
        nums[pivot_idx], nums[hi] = nums[hi], nums[pivot_idx]
        pivot = nums[hi]
        store = lo
        for i in range(lo, hi):
            if nums[i] <= pivot:
                nums[store], nums[i] = nums[i], nums[store]
                store += 1
        nums[store], nums[hi] = nums[hi], nums[store]
        return store

    lo, hi = 0, len(nums) - 1
    target = k - 1   # 0-indexed

    while lo <= hi:
        pivot = partition(lo, hi)
        if pivot == target:
            return nums[pivot]
        elif pivot < target:
            lo = pivot + 1
        else:
            hi = pivot - 1
```

---

## 4. Merge K sorted lists (LC 23)

```python
# Push the head of each list into a min-heap.
# Each pop gives the global minimum; push its successor.
# __lt__ on ListNode avoids comparison errors when values tie.

import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val  = val
        self.next = next
    def __lt__(self, other):
        return self.val < other.val

def mergeKLists(lists):
    heap = []
    for node in lists:
        if node:
            heapq.heappush(heap, node)

    dummy = ListNode(0)
    cur   = dummy
    while heap:
        node      = heapq.heappop(heap)
        cur.next  = node
        cur       = cur.next
        if node.next:
            heapq.heappush(heap, node.next)

    return dummy.next
```

---

## 5. K-th smallest in a sorted matrix (LC 378)

```python
# Min-heap seeded with the first element of each row.
# Pop K times; each pop pushes the next element in the same row.

def kthSmallest(matrix, k):
    n = len(matrix)
    heap = [(matrix[i][0], i, 0) for i in range(n)]
    heapq.heapify(heap)

    for _ in range(k - 1):
        val, r, c = heapq.heappop(heap)
        if c + 1 < n:
            heapq.heappush(heap, (matrix[r][c + 1], r, c + 1))

    return heapq.heappop(heap)[0]
```

---

## 6. Top K frequent elements (LC 347)

```python
from collections import Counter
import heapq

def topKFrequent(nums, k):
    cnt = Counter(nums)
    return heapq.nlargest(k, cnt.keys(), key=lambda x: cnt[x])

# Or with a size-K min-heap on (count, element):
def topKFrequent_heap(nums, k):
    cnt = Counter(nums)
    heap = []
    for val, freq in cnt.items():
        heapq.heappush(heap, (freq, val))
        if len(heap) > k:
            heapq.heappop(heap)
    return [val for freq, val in heap]
```

---

## 7. Tournament tree — repeated best extraction (O(log n) per delete)

```python
# A tournament tree is a complete binary tree where each internal node = max of children.
# Use when you need to extract the best element repeatedly, with O(log n) per deletion
# instead of O(n) for a sorted array or O(n log n) for re-sorting.
# Also the structure behind external merge sort (merge K sorted runs).

import heapq

class TournamentTree:
    def __init__(self, values):
        n = len(values)
        # Find next power of 2 for leaf layer size
        self.size = 1
        while self.size < n:
            self.size <<= 1
        self.tree = [float('-inf')] * (2 * self.size)
        for i, v in enumerate(values):
            self.tree[self.size + i] = v
        for i in range(self.size - 1, 0, -1):
            self.tree[i] = max(self.tree[2 * i], self.tree[2 * i + 1])

    def pop_max(self):
        """Remove and return the maximum value. O(log n)."""
        if self.tree[1] == float('-inf'):
            return None
        winner = self.tree[1]
        # Find the leaf that holds the winner
        i = 1
        while i < self.size:
            if self.tree[2 * i] == winner:
                i = 2 * i
            else:
                i = 2 * i + 1
        self.tree[i] = float('-inf')    # remove
        i >>= 1
        while i >= 1:                   # re-run tournament up to root
            self.tree[i] = max(self.tree[2 * i], self.tree[2 * i + 1])
            i >>= 1
        return winner

# tt = TournamentTree([3, 1, 4, 1, 5, 9, 2, 6])
# tt.pop_max() → 9, tt.pop_max() → 6, tt.pop_max() → 5 ...
```

---

## Complexity

> **Key insight:** A size-K heap answers "K largest seen so far" in O(n log K) total — far better than sorting at O(n log n) when K ≪ n. QuickSelect beats both at O(n) average for a one-shot query.

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| K-th largest (size-K heap) | **O(n log K)** | O(K) | `heapreplace` when heap full |
| Streaming median (two heaps) | **O(log n)** per insert | O(n) | Balance after every push |
| QuickSelect | **O(n)** avg, O(n²) worst | O(1) | Random pivot → O(n) expected |
| Merge K sorted lists | **O(n log K)** | O(K) | n = total nodes; K = list count |
| K-th smallest in matrix | **O(K log n)** | O(n) | n = matrix side length |
| Top K frequent | **O(n log K)** | O(n) | Counter + size-K heap |
| Tournament tree — build | **O(n)** | O(n) | Fill leaves; propagate up |
| Tournament tree — pop max | **O(log n)** | O(1) | Remove leaf; re-run to root |

---

## When this pattern shows up

- **K largest / smallest** → size-K heap (opposite type: K largest → min-heap)
- **Streaming median** → two heaps; balance after each insert
- **One-shot K-th** → QuickSelect (modifies array; O(n) avg)
- **Merge sorted sources** → heap with (value, source_index) tuples
- **Scheduling by priority** → heap with (priority, task) tuples; `heapreplace` for efficiency

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [703](https://leetcode.com/problems/kth-largest-element-in-a-stream/) | K-th Largest in Stream | Easy | Size-K min-heap |
| [215](https://leetcode.com/problems/kth-largest-element-in-an-array/) | K-th Largest in Array | Medium | QuickSelect or size-K heap |
| [295](https://leetcode.com/problems/find-median-from-data-stream/) | Find Median from Data Stream | Hard | Two heaps |
| [23](https://leetcode.com/problems/merge-k-sorted-lists/) | Merge K Sorted Lists | Hard | Heap + `__lt__` on ListNode |
| [347](https://leetcode.com/problems/top-k-frequent-elements/) | Top K Frequent Elements | Medium | Counter + size-K heap |
| [378](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/) | K-th Smallest in Matrix | Medium | Heap per row |
| [373](https://leetcode.com/problems/find-k-pairs-with-smallest-sums/) | K Pairs with Smallest Sums | Medium | Heap of (sum, i, j) pairs |
| [480](https://leetcode.com/problems/sliding-window-median/) | Sliding Window Median | Hard | Two heaps with lazy deletion |
| [23](https://leetcode.com/problems/merge-k-sorted-lists/) | Merge K Sorted Lists | Hard | Tournament tree / min-heap |
