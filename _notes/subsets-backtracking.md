---
title: "Subsets — Backtracking with duplicates"
date: 2026-05-15
category: algo
difficulty: medium
summary: "Sort first, then skip duplicate values at the same recursion depth. The guard is index > start, not index > 0 — getting that wrong is the most common bug."
problem: "Given an integer array that may contain duplicates, return all possible subsets (no duplicate subsets)."
---

## The pattern

Sort the array so duplicates are adjacent. In the recursion, before adding `nums[index]` check if it's the same as `nums[index - 1]`. If it is, and we're at the same recursion depth (`index > start`), skip it — it would produce a duplicate subset.

## Template

```python
from typing import List

def subsetsWithDup(nums: List[int]) -> List[List[int]]:
    result = []
    nums.sort()                         # must sort first

    def recurse(start, ans):
        result.append(ans[:])           # snapshot current subset

        for index in range(start, len(nums)):
            # skip duplicate values at the same recursion level
            if index > start and nums[index] == nums[index - 1]:
                continue
            ans.append(nums[index])
            recurse(index + 1, ans)
            ans.pop()                   # backtrack

    recurse(0, [])
    return result
```

## Complexity

| | |
|---|---|
| Time | O(n · 2ⁿ) — up to 2ⁿ subsets, each copied in O(n) |
| Space | O(n) recursion stack depth |

## Key details

- **`index > start` not `index > 0`** — this is the critical guard. `index > 0` would skip duplicates even across different recursion depths, losing valid subsets. `index > start` only skips when we're revisiting the same position at the same level.
- Appending `ans[:]` (a copy) is required — `ans` is mutated as recursion unwinds.
- The same guard works for **Combination Sum II** and **Permutations II**.

## Variations

**No duplicates (Subsets I)** — same template, just remove the duplicate check.

**Combination sum with target** — add a `remaining` parameter; recurse only when `remaining >= nums[index]`; record when `remaining == 0`.

**Permutations with duplicates** — sort + skip at the same level but use a `used[]` boolean array instead of a `start` index.

## When this pattern shows up

- Subsets II (LeetCode 90)
- Combination Sum II (LeetCode 40)
- Permutations II (LeetCode 47)
- Palindrome partitioning (LeetCode 131)

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [78](https://leetcode.com/problems/subsets/) | Subsets | Medium | Collect at every node; no duplicate guard needed |
| [90](https://leetcode.com/problems/subsets-ii/) | Subsets II | Medium | Sort + `i > start` duplicate guard |
| [40](https://leetcode.com/problems/combination-sum-ii/) | Combination Sum II | Medium | Same guard; add `remaining` param |
| [47](https://leetcode.com/problems/permutations-ii/) | Permutations II | Medium | `used[]` array; same-level skip |
| [131](https://leetcode.com/problems/palindrome-partitioning/) | Palindrome Partitioning | Medium | Partition + palindrome check at each split |
| [698](https://leetcode.com/problems/partition-to-k-equal-sum-subsets/) | Partition to K Equal Sum Subsets | Medium | Assign each element to one of k buckets |
