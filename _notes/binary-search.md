---
title: "Binary Search — Templates, Variants & Problems"
date: 2026-05-16
category: algo
difficulty: medium
summary: "The four binary search templates: exact match, leftmost index, rightmost index, and predicate/answer-space search. Covers rotated array, peak element, and binary search on the answer."
problem: "Binary search isn't just about sorted arrays — it's about finding the boundary between False and True in any monotonic space."
---

## The core insight

Every binary search is really finding the **first index where a predicate flips from False → True**.

```
Array:    [F, F, F, T, T, T]
                    ↑
               return this
```

Once you see it this way, all variants collapse into the same skeleton.

---

## Template 1 — Exact match (classic)

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1

    while lo <= hi:              # note: <=
        mid = (lo + hi) >> 1

        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1

    return -1
```

---

## Template 2 — Leftmost / first index (most important)

```python
# TODO from codebase: "Most imp binary search — can be used as search index too"
# hi = len(nums)  (one past end) so the result can be len(nums) meaning "not found"
# while lo < hi   (not <=) because we set hi = mid, never hi = mid-1

def first_index(nums, target):
    lo, hi = 0, len(nums)        # hi = len, not len-1

    while lo < hi:
        mid = (lo + hi) >> 1
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid             # don't subtract 1 — mid could be the answer

    # lo == hi == first index where nums[i] >= target
    # if lo == len(nums) or nums[lo] != target → not found
    return lo

# Always test on a 2-element array where predicate is False then True: [1, 3], target=2
# Expected: returns index 1 (first place ≥ 2)
```

---

## Template 3 — Rightmost / last index

```python
def last_index(nums, target):
    lo, hi = 0, len(nums) - 1

    while lo < hi:
        mid = ((lo + hi) >> 1) + 1    # bias mid RIGHT to avoid infinite loop on 2-element
        if nums[mid] > target:
            hi = mid - 1
        else:
            lo = mid

    return lo
```

---

## Template 4 — First True in predicate array

```python
# Works on any array that looks like [F, F, F, T, T, T]
# Returns the index of the first True.

def first_true(nums):
    lo, hi = 0, len(nums) - 1

    while lo < hi:
        mid = (lo + hi) >> 1
        if not nums[mid]:        # False → discard left half
            lo = mid + 1
        else:                    # True → keep mid, discard right
            hi = mid

    return lo                    # lo is the first True index
```

---

## Python bisect module

```python
import bisect

nums = [1, 1, 1, 3, 3, 3, 6]

# bisect_left  → first index where nums[i] >= target  (leftmost insert)
# bisect_right → first index where nums[i] >  target  (rightmost insert)

bisect.bisect_left(nums, 3)    # 3  (first 3)
bisect.bisect_right(nums, 3)   # 6  (after last 3)

# Find range of target
lo = bisect.bisect_left(nums, 3)
hi = bisect.bisect_right(nums, 3) - 1
# [lo, hi] is the inclusive range of 3s

# Insert into sorted list maintaining order
bisect.insort(nums, 4)
```

---

## Find first and last position (LC 34)

```python
def searchRange(nums, target):
    def first(nums, t):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) >> 1
            if nums[mid] < t: lo = mid + 1
            else:             hi = mid
        return lo

    left  = first(nums, target)
    if left == len(nums) or nums[left] != target:
        return [-1, -1]
    right = first(nums, target + 1) - 1
    return [left, right]
```

---

## Search in rotated sorted array (LC 33)

```python
def search(nums, target):
    lo, hi = 0, len(nums) - 1

    while lo <= hi:
        mid = (lo + hi) >> 1
        if nums[mid] == target:
            return mid

        # Determine which half is sorted
        if nums[lo] <= nums[mid]:           # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                               # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1

    return -1
```

---

## Peak element in mountain array (LC 852 / 162)

```python
def peakIndexInMountainArray(nums):
    lo, hi = 0, len(nums) - 1

    while lo < hi:
        mid = (lo + hi) >> 1
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1        # slope going up → peak is to the right
        else:
            hi = mid            # slope going down → peak is here or left

    return lo
```

---

## Binary search on the answer (answer-space search)

```python
# Pattern: when the answer lies in a range [lo, hi] and you can write
# a check function is_feasible(mid) that returns True/False monotonically.
# Binary search the answer space instead of the array.

# Example: split array into k workers minimising max workload (FairWorkLoad)
def fair_workload(folders, k):
    def can_split(max_load):
        workers, current = 1, 0
        for f in folders:
            if current + f > max_load:
                workers += 1
                current = 0
            current += f
        return workers <= k

    lo, hi = max(folders), sum(folders)

    while lo < hi:
        mid = (lo + hi) >> 1
        if can_split(mid):
            hi = mid             # feasible — try smaller
        else:
            lo = mid + 1         # not feasible — need larger

    return lo

# Same pattern applies to:
# - Koko eating bananas (LC 875)
# - Capacity to ship packages (LC 1011)
# - Minimum days to make m bouquets (LC 1482)
# - Split array largest sum (LC 410)
```

---

## Complexity

| | |
|---|---|
| Time | O(log n) |
| Space | O(1) iterative, O(log n) recursive |

## Key rules to never get wrong

- Use `lo < hi` (not `<=`) when you set `hi = mid` — avoids infinite loop
- Use `lo <= hi` when you set both `lo = mid+1` and `hi = mid-1`
- Bias mid right (`((lo+hi)>>1)+1`) when finding the rightmost index
- Set `hi = len(nums)` (not `len-1`) when the answer could be "insert at end"
- Always test on a 2-element array `[x, y]` with target between them

## When this pattern shows up

- First / last occurrence of element in sorted array
- Count of target in sorted array → `bisect_right - bisect_left`
- Search in rotated sorted array
- Find peak / mountain array
- Minimum/maximum of a feasible value → binary search on answer
- Koko bananas, ship packages, split array, fair workload

## Sample problems

<!-- add LeetCode problems here as you solve them -->
