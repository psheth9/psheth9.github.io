---
title: "Fenwick Tree (BIT) — Prefix Sums with Point Updates"
date: 2026-05-17
category: algo
difficulty: medium
summary: "Binary Indexed Tree: prefix sum query and point update both in O(log n). Uses the lowest set bit of an index to navigate a compact implicit tree."
problem: "A plain prefix-sum array is O(1) query but O(n) update. A Fenwick tree gives O(log n) for both — the sweet spot when you need fast queries AND frequent point updates."
---

## The core idea

Each index `i` in the BIT array is responsible for a range of length equal to its lowest set bit: `i & -i`. This maps naturally to binary tree navigation without storing pointers.

- **Update:** add the lowest set bit to climb up the tree
- **Query:** subtract the lowest set bit to walk down to the prefix

```
Index (1-based): 1  2  3  4  5  6  7  8
Lowest set bit:  1  2  1  4  1  2  1  8
Range covered:   1  2  1  4  1  2  1  8
```

---

## 1. Build, update, query — O(n) build, O(log n) ops

```python
class FenwickTree:
    def __init__(self, n):
        self.n    = n
        self.tree = [0] * (n + 1)   # 1-indexed

    def update(self, i, delta):
        """Add delta to position i (1-indexed)."""
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i             # move to parent

    def prefix_sum(self, i):
        """Sum of elements from index 1 to i (inclusive)."""
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i             # strip lowest set bit → move to predecessor
        return total

    def range_sum(self, l, r):
        """Sum of elements from l to r (1-indexed, inclusive)."""
        return self.prefix_sum(r) - self.prefix_sum(l - 1)

    @classmethod
    def from_array(cls, nums):
        """Build in O(n) — prefer over n individual updates."""
        n  = len(nums)
        ft = cls(n)
        for i, v in enumerate(nums, 1):
            ft.tree[i] += v
            parent = i + (i & -i)
            if parent <= n:
                ft.tree[parent] += ft.tree[i]
        return ft


# Usage
ft = FenwickTree.from_array([3, 2, -1, 6, 5, 4, -3, 3, 7, 2])
print(ft.prefix_sum(5))    # 3+2-1+6+5 = 15
print(ft.range_sum(2, 7))  # 2-1+6+5+4-3 = 13
ft.update(3, 4)            # add 4 at index 3 (0-indexed: 2)
print(ft.prefix_sum(5))    # now 19
```

---

## 2. Coordinate compression + BIT (count inversions)

```python
# Count inversions in O(n log n): for each element, query how many
# previously seen elements are greater (= prefix_sum(n) - prefix_sum(val)).

def count_inversions(nums):
    # Coordinate compress to [1..n]
    rank = {v: i+1 for i, v in enumerate(sorted(set(nums)))}
    n    = len(rank)
    ft   = FenwickTree(n)

    inversions = 0
    for x in nums:
        r = rank[x]
        inversions += ft.prefix_sum(n) - ft.prefix_sum(r)   # count elements > x seen so far
        ft.update(r, 1)

    return inversions

# count_inversions([3, 1, 2]) → 2  (pairs: (3,1), (3,2))
```

---

## 3. 2-D BIT — range sum on a matrix

```python
class BIT2D:
    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.tree = [[0] * (cols + 1) for _ in range(rows + 1)]

    def update(self, r, c, delta):
        i = r
        while i <= self.rows:
            j = c
            while j <= self.cols:
                self.tree[i][j] += delta
                j += j & -j
            i += i & -i

    def prefix_sum(self, r, c):
        total = 0
        i = r
        while i > 0:
            j = c
            while j > 0:
                total += self.tree[i][j]
                j -= j & -j
            i -= i & -i
        return total

    def range_sum(self, r1, c1, r2, c2):
        return (self.prefix_sum(r2, c2)
                - self.prefix_sum(r1 - 1, c2)
                - self.prefix_sum(r2, c1 - 1)
                + self.prefix_sum(r1 - 1, c1 - 1))
```

---

## BIT vs Segment Tree

| | Fenwick Tree | Segment Tree |
|---|---|---|
| Build | O(n) | O(n) |
| Point update | **O(log n)** | O(log n) |
| Prefix/range query | **O(log n)** | O(log n) |
| Range update + point query | O(log n)* | O(log n) |
| Range update + range query | ✗ (hard) | **O(log n)** |
| Space | **O(n)** | O(2n) |
| Code size | **~15 lines** | ~40 lines |

*With a "difference BIT" trick.

> **Rule of thumb:** Use BIT when you only need prefix sums with point updates. Use segment tree when you need range updates or non-invertible aggregates (min, max, GCD).

---

## Complexity

> **Key insight:** `i & -i` isolates the lowest set bit. Add it to climb toward the root (update); subtract it to strip responsibilities (query). Each op touches O(log n) nodes.

| Operation | Time | Space | Notes |
|---|---|---|---|
| Build from array | **O(n)** | O(n) | O(n log n) via n updates works too |
| Point update | **O(log n)** | O(1) | At most log₂(n) parent hops |
| Prefix sum [1..i] | **O(log n)** | O(1) | Strip lowest bit repeatedly |
| Range sum [l..r] | **O(log n)** | O(1) | Two prefix queries |
| Count inversions | **O(n log n)** | O(n) | BIT + coordinate compression |
| 2-D BIT ops | **O(log² n)** | O(nm) | Two nested BIT traversals |

**Variable key:** *n* = array length · *m* = number of updates

---

## When this pattern shows up

- **Prefix sum + point update** → use BIT over plain prefix array
- **Count inversions** → BIT + coordinate compression; query elements > x
- **Rank queries / frequency table** → BIT over value range
- **2-D range sum with updates** → 2-D BIT
- **Running kth smallest** → binary search on BIT prefix sums

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [307](https://leetcode.com/problems/range-sum-query-mutable/) | Range Sum Query — Mutable | Medium | 1-D BIT or segment tree |
| [315](https://leetcode.com/problems/count-of-smaller-numbers-after-self/) | Count of Smaller Numbers After Self | Hard | BIT + coordinate compression |
| [493](https://leetcode.com/problems/reverse-pairs/) | Reverse Pairs | Hard | Modified merge sort or BIT |
| [327](https://leetcode.com/problems/count-of-range-sum/) | Count of Range Sum | Hard | BIT on prefix sums |
| [308](https://leetcode.com/problems/range-sum-query-2d-mutable/) | Range Sum Query 2D — Mutable | Hard | 2-D BIT |
| [1395](https://leetcode.com/problems/count-number-of-teams/) | Count Number of Teams | Medium | BIT for rank counting |
