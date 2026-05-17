---
title: "Backtracking — Templates, Variants & Problems"
date: 2026-05-16
category: algo
difficulty: medium
summary: "The universal backtracking template and six problem families: subsets, combinations, permutations, parentheses, partitions, and N-Queens. Duplicate pruning is the key invariant."
problem: "Backtracking = DFS + undo. At each step: choose, recurse, unchoose."
---

## The universal template

Every backtracking problem follows the same skeleton:

```python
def backtrack(path, start, ...):
    if is_solution(path):
        result.append(path[:])   # snapshot — never append path directly
        return                   # or don't return if subsets (collect at every node)

    for i in range(start, len(candidates)):
        # pruning: skip invalid choices early
        if should_skip(i): continue

        path.append(candidates[i])          # choose
        backtrack(path, next_start, ...)    # explore
        path.pop()                          # unchoose (backtrack)

result = []
backtrack([], 0, ...)
return result
```

Three decisions per problem:
1. **When to collect** — at leaf only, or at every node?
2. **What `next_start` is** — `i` (reuse allowed), `i+1` (no reuse), `index+1` (permutation)
3. **Duplicate pruning** — sort first, then `if i > start and nums[i] == nums[i-1]: continue`

---

## 1. Subsets — all subsets, no duplicates (LC 78)

```python
def subsets(nums):
    result = []

    def backtrack(path, start):
        result.append(path[:])              # collect at EVERY node, not just leaves

        for i in range(start, len(nums)):
            backtrack(path + [nums[i]], i + 1)

    backtrack([], 0)
    return result

# subsets([1,2,3]) → [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

---

## 2. Subsets II — with duplicates (LC 90)

```python
# TODO from codebase: skip duplicate branches at the same recursion level
# Key: sort first, then skip if nums[i] == nums[i-1] AND i > start (not i > 0)

def subsetsWithDup(nums):
    nums.sort()                             # MUST sort first
    result = []

    def backtrack(path, start):
        result.append(path[:])

        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:  # skip duplicate branches
                continue
            backtrack(path + [nums[i]], i + 1)

    backtrack([], 0)
    return result
```

---

## 3. Combination Sum I — reuse allowed, unique candidates (LC 39)

```python
# next_start = i (not i+1) → same element can be chosen again

def combinationSum(candidates, target):
    result = []

    def backtrack(path, start, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        if remaining < 0:
            return

        for i in range(start, len(candidates)):
            backtrack(path + [candidates[i]], i, remaining - candidates[i])

    backtrack([], 0, target)
    return result

# combinationSum([2,3,6,7], 7) → [[2,2,3], [7]]
```

---

## 4. Combination Sum II — no reuse, duplicates in input (LC 40)

```python
# TODO from codebase: "keep only first branch, ignore all other duplicates"
# next_start = i+1, AND skip if nums[i] == nums[i-1] at same level

def combinationSum2(candidates, target):
    candidates.sort()
    result = []

    def backtrack(path, start, remaining):
        if remaining == 0:
            result.append(path[:])
            return

        for i in range(start, len(candidates)):
            if remaining - candidates[i] < 0:
                break                                     # sorted → prune rest too
            if i > start and candidates[i] == candidates[i - 1]:
                continue                                  # skip duplicate branch
            backtrack(path + [candidates[i]], i + 1, remaining - candidates[i])

    backtrack([], 0, target)
    return result

# combinationSum2([10,1,2,7,6,1,5], 8) → [[1,1,6],[1,2,5],[1,7],[2,6]]
```

---

## 5. Permutations — no duplicates (LC 46)

```python
# Swap in-place: fix position index, try every element from index onward

def permute(nums):
    result = []

    def backtrack(index):
        if index == len(nums):
            result.append(nums[:])
            return

        for j in range(index, len(nums)):
            nums[index], nums[j] = nums[j], nums[index]   # choose
            backtrack(index + 1)
            nums[index], nums[j] = nums[j], nums[index]   # unchoose

    backtrack(0)
    return result
```

---

## 6. Permutations II — with duplicates (LC 47)

```python
# Skip swap when nums[j] == nums[index] AND j != index (same value already tried)

def permuteUnique(nums):
    nums.sort()
    result = []

    def backtrack(index):
        if index == len(nums):
            result.append(nums[:])
            return

        seen = set()
        for j in range(index, len(nums)):
            if nums[j] in seen:
                continue
            seen.add(nums[j])
            nums[index], nums[j] = nums[j], nums[index]
            backtrack(index + 1)
            nums[index], nums[j] = nums[j], nums[index]

    backtrack(0)
    return result
```

---

## 7. Generate Parentheses (LC 22)

```python
# Constraint-based: add '(' if open < n, add ')' if close < open

def generateParenthesis(n):
    result = []

    def backtrack(path, open, close):
        if len(path) == 2 * n:
            result.append(path)
            return
        if open < n:
            backtrack(path + '(', open + 1, close)
        if open > close:
            backtrack(path + ')', open, close + 1)

    backtrack('', 0, 0)
    return result

# generateParenthesis(3) → ['((()))', '(()())', '(())()', '()(())', '()()()']
```

---

## 8. Palindrome Partitioning (LC 131)

```python
# TODO from codebase: "generates different splits for given array/string"
# At each index, try all substrings starting there; recurse on the remainder

def partition(s):
    result = []

    def backtrack(start, path):
        if start == len(s):
            result.append(path[:])
            return

        for end in range(start, len(s)):
            substr = s[start:end + 1]
            if substr == substr[::-1]:              # only recurse on palindromes
                backtrack(end + 1, path + [substr])

    backtrack(0, [])
    return result

# partition("aab") → [["a","a","b"], ["aa","b"]]
```

---

## 9. N-Queens (LC 51)

```python
# Place one queen per row; validate column + both diagonals

def solveNQueens(n):
    result = []
    cols    = set()
    diag1   = set()   # row - col
    diag2   = set()   # row + col

    board = [['.' ] * n for _ in range(n)]

    def backtrack(row):
        if row == n:
            result.append([''.join(r) for r in board])
            return

        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue

            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            board[row][col] = 'Q'

            backtrack(row + 1)

            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)
            board[row][col] = '.'

    backtrack(0)
    return result
```

---

## 10. Target sum — assign +/− to each element (LC 494)

```python
# At each index, choose to add or subtract. Count paths reaching target.

def findTargetSumWays(nums, target):
    def backtrack(index, current):
        if index == len(nums):
            return 1 if current == target else 0
        return (backtrack(index + 1, current + nums[index]) +
                backtrack(index + 1, current - nums[index]))

    return backtrack(0, 0)
```

---

## Duplicate pruning — the key invariant

```python
# WRONG — skips duplicates globally (misses valid paths like [1,1,6])
if i > 0 and nums[i] == nums[i - 1]: continue

# CORRECT — skips only at the SAME recursion level
if i > start and nums[i] == nums[i - 1]: continue
# i > start means: we already tried this value at this level, skip the rest.
# i > 0 would also skip valid re-use of the same value in deeper levels.
```

---

## Complexity

> **Key insight:** Backtracking explores an exponential search space. Time = number of leaves × path copy cost. Space = recursion depth = max path length.

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| Subsets (LC 78) | **O(n · 2ⁿ)** | O(n) | 2ⁿ subsets; each copied in O(n) |
| Subsets II (LC 90) | **O(n · 2ⁿ)** | O(n) | Sort + prune reduces constant factor |
| Combination Sum I (LC 39) | **O(2^(t/min))** | O(t/min) | Unbounded — reuse inflates branching |
| Combination Sum II (LC 40) | **O(2ⁿ)** | O(n) | Each element included or skipped |
| Permutations (LC 46) | **O(n · n!)** | O(n) | n! leaves; O(n) copy per leaf |
| Permutations II (LC 47) | **O(n · n!)** | O(n) | `seen` set prunes duplicate swaps |
| Generate Parentheses (LC 22) | **O(4ⁿ / √n)** | O(n) | Catalan number — only valid strings |
| Palindrome Partitioning (LC 131) | **O(n · 2ⁿ)** | O(n) | Up to 2^(n−1) ways to split |
| N-Queens (LC 51) | **O(n!)** | O(n) | col/diag sets prune heavily in practice |
| Target Sum (LC 494) | **O(2ⁿ)** | O(n) | Binary branch at each element (+/−) |

**Variable key:** *n* = input length · *t* = target value · *min* = smallest candidate

## When this pattern shows up

- **Subsets** — power set, subsequences, any include/exclude choice
- **Combination Sum** — pick elements summing to target (I = reuse, II = no reuse)
- **Permutations** — all orderings of elements
- **Partition** — split string/array into valid segments
- **Parentheses** — any "build valid structure" problem with open/close counts
- **N-Queens / Sudoku** — place pieces with validity constraints, undo on fail

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [78](https://leetcode.com/problems/subsets/) | Subsets | Medium | Collect at every node |
| [90](https://leetcode.com/problems/subsets-ii/) | Subsets II | Medium | Sort + skip duplicates at same level |
| [39](https://leetcode.com/problems/combination-sum/) | Combination Sum | Medium | `next = i` (reuse allowed) |
| [40](https://leetcode.com/problems/combination-sum-ii/) | Combination Sum II | Medium | `next = i+1` + duplicate skip |
| [46](https://leetcode.com/problems/permutations/) | Permutations | Medium | Swap in-place |
| [47](https://leetcode.com/problems/permutations-ii/) | Permutations II | Medium | `seen` set per level |
| [22](https://leetcode.com/problems/generate-parentheses/) | Generate Parentheses | Medium | open < n / close < open guards |
| [131](https://leetcode.com/problems/palindrome-partitioning/) | Palindrome Partitioning | Medium | Try all substrings from start |
| [51](https://leetcode.com/problems/n-queens/) | N-Queens | Hard | Col + diagonal set pruning |
| [494](https://leetcode.com/problems/target-sum/) | Target Sum | Medium | +/− branch at each index |
| [79](https://leetcode.com/problems/word-search/) | Word Search | Medium | DFS + backtrack on board |
| [698](https://leetcode.com/problems/partition-to-k-equal-sum-subsets/) | Partition to K Equal Sum Subsets | Medium | Subset partitioning |
