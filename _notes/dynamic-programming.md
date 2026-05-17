---
title: "Dynamic Programming — Templates & Patterns"
date: 2026-05-17
category: algo
difficulty: hard
summary: "Core DP patterns: 1-D sequences (climb stairs, decode ways, LIS), 2-D grids (min path, triangle), strings (LCS, edit distance), knapsack/subset sum, and buy-sell stocks."
problem: "DP = recursion + memoization, or equivalently, fill a table bottom-up. The key is defining dp[i] clearly, then writing the recurrence."
---

## The DP framework

Every DP problem follows the same three steps:

1. **Define** — what does `dp[i]` (or `dp[i][j]`) represent?
2. **Recurrence** — how does `dp[i]` depend on smaller subproblems?
3. **Base case** — what are the smallest inputs you can answer directly?

> **Key insight:** Top-down (memoised recursion) and bottom-up (tabulation) are equivalent. Start top-down to find the recurrence, then rewrite bottom-up for cleaner code and O(1) space optimisation.

---

## 1. Climbing stairs / Fibonacci (LC 70)

```python
# dp[i] = number of ways to reach step i
# dp[i] = dp[i-1] + dp[i-2]

def climbStairs(n):
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b
```

---

## 2. Decode ways (LC 91)

```python
# dp[i] = number of ways to decode s[0..i-1]
# Single digit valid: s[i-1] in '1'..'9'  → dp[i] += dp[i-1]
# Two digits valid:   s[i-2..i-1] in 10..26 → dp[i] += dp[i-2]

def numDecodings(s):
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1 if s[0] != '0' else 0

    for i in range(2, n + 1):
        one  = int(s[i - 1])
        two  = int(s[i - 2:i])
        if 1 <= one <= 9:   dp[i] += dp[i - 1]
        if 10 <= two <= 26: dp[i] += dp[i - 2]

    return dp[n]

# numDecodings("226") → 3  ("2,2,6" / "22,6" / "2,26")
```

---

## 3. Longest Increasing Subsequence (LC 300)

```python
# O(n²) DP
def lengthOfLIS_n2(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)

# O(n log n) — maintain `tails`: smallest tail for each LIS length
# tails[i] = smallest ending element of any increasing subsequence of length i+1
import bisect

def lengthOfLIS(nums):
    tails = []
    for n in nums:
        pos = bisect.bisect_left(tails, n)   # first index where tails[pos] >= n
        if pos == len(tails):
            tails.append(n)        # extend longest subsequence
        else:
            tails[pos] = n         # replace to keep tail as small as possible
    return len(tails)

# lengthOfLIS([10,9,2,5,3,7,101,18]) → 4  ([2,3,7,101])
```

---

## 4. Longest Common Subsequence (LC 1143)

```python
# dp[i][j] = LCS length of s1[0..i-1] and s2[0..j-1]
# Match:    dp[i][j] = 1 + dp[i-1][j-1]
# No match: dp[i][j] = max(dp[i-1][j], dp[i][j-1])

def longestCommonSubsequence(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]
```

---

## 5. Edit distance / Levenshtein (LC 72)

```python
# dp[i][j] = min ops to convert s[0..i-1] → t[0..j-1]
# Base:  dp[i][0] = i  (delete all),  dp[0][j] = j  (insert all)
# Match: dp[i][j] = dp[i-1][j-1]
# Else:  dp[i][j] = 1 + min(replace, delete, insert)

def minDistance(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1],  # replace
                                    dp[i - 1][j],       # delete from s
                                    dp[i][j - 1])       # insert into s
    return dp[m][n]
```

---

## 6. Subset sum / 0-1 knapsack (LC 416)

```python
# dp[i][j] = can we make sum j using elements 0..i-1?
# Include: dp[i-1][j - A[i-1]]  (if j >= A[i-1])
# Exclude: dp[i-1][j]

def canPartition(nums):
    total = sum(nums)
    if total % 2: return False
    target = total // 2

    dp = [False] * (target + 1)
    dp[0] = True                   # sum 0 always reachable

    for num in nums:
        for j in range(target, num - 1, -1):   # reverse to avoid reuse
            dp[j] = dp[j] or dp[j - num]

    return dp[target]

# canPartition([1,5,11,5]) → True  ([1,5,5] and [11])
```

```python
# Full 2-D version (explicit, easier to reason about)
def subsetSum(A, target):
    n = len(A)
    dp = [[False] * (target + 1) for _ in range(n + 1)]
    for i in range(n + 1): dp[i][0] = True   # sum 0 always reachable

    for i in range(1, n + 1):
        for j in range(1, target + 1):
            dp[i][j] = dp[i - 1][j]                            # exclude
            if j >= A[i - 1]:
                dp[i][j] = dp[i][j] or dp[i - 1][j - A[i - 1]]  # include
    return dp[n][target]
```

---

## 7. Coin change — minimum coins (LC 322)

```python
# dp[i] = min coins to make amount i
# dp[0] = 0;  dp[i] = min over all coins c: dp[i-c] + 1

def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for c in coins:
            if c <= i:
                dp[i] = min(dp[i], dp[i - c] + 1)

    return dp[amount] if dp[amount] != float('inf') else -1

# coinChange([1,5,11], 15) → 3  (5+5+5 not 11+...) wait → actually 15=11+... hmm
# coinChange([1,5,11], 15) → 3  (5+5+5)
```

---

## 8. Min path sum — grid DP (LC 64)

```python
# dp[i][j] = min cost to reach cell (i, j)
# dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])

def minPathSum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    dp[0][0] = grid[0][0]

    for j in range(1, cols): dp[0][j] = dp[0][j - 1] + grid[0][j]
    for i in range(1, rows): dp[i][0] = dp[i - 1][0] + grid[i][0]

    for i in range(1, rows):
        for j in range(1, cols):
            dp[i][j] = grid[i][j] + min(dp[i - 1][j], dp[i][j - 1])

    return dp[rows - 1][cols - 1]
```

---

## 9. Triangle — min path top to bottom (LC 120)

```python
# Bottom-up: start from second-to-last row, add the min of two children below.
# Modifies triangle in-place — use a copy if needed.

def minimumTotal(triangle):
    for i in range(len(triangle) - 2, -1, -1):
        for j in range(len(triangle[i])):
            triangle[i][j] += min(triangle[i + 1][j], triangle[i + 1][j + 1])
    return triangle[0][0]
```

---

## 10. Buy and sell stocks (LC 121 / 122 / 309)

```python
# Single transaction — track running min, update max profit
def maxProfit_once(prices):
    min_price = float('inf')
    max_profit = 0
    for p in prices:
        min_price  = min(min_price, p)
        max_profit = max(max_profit, p - min_price)
    return max_profit

# Unlimited transactions — sum all positive day-over-day gains
def maxProfit_unlimited(prices):
    return sum(max(prices[i] - prices[i - 1], 0) for i in range(1, len(prices)))

# With cooldown (LC 309) — state machine
# held[i]  = max profit on day i if holding stock
# sold[i]  = max profit on day i if just sold (must rest tomorrow)
# rest[i]  = max profit on day i if resting
def maxProfit_cooldown(prices):
    held = -float('inf')
    sold = 0
    rest = 0
    for p in prices:
        prev_sold = sold
        sold = held + p
        held = max(held, rest - p)
        rest = max(rest, prev_sold)
    return max(sold, rest)
```

---

## Complexity

> **Key insight:** Almost all DP is O(n) or O(n²) time with matching space — and space can usually be reduced by one dimension using rolling arrays.

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| Fibonacci / climb stairs | **O(n)** | O(1) rolling | Two variables sufficient |
| Decode ways | **O(n)** | O(n) → O(1) | Rolling two variables |
| LIS — O(n²) DP | **O(n²)** | O(n) | Simple but slow |
| LIS — bisect | **O(n log n)** | O(n) | `tails` array + bisect_left |
| LCS | **O(m · n)** | O(m · n) → O(n) | Rolling row optimisation |
| Edit distance | **O(m · n)** | O(m · n) → O(n) | Rolling row optimisation |
| Subset sum / 0-1 knapsack | **O(n · W)** | O(W) | Reverse iteration prevents reuse |
| Coin change | **O(n · amount)** | O(amount) | Unbounded knapsack |
| Grid min path | **O(R · C)** | O(R · C) → O(C) | Rolling row |
| Triangle | **O(n²)** | O(1) | In-place bottom-up |
| Buy-sell (once) | **O(n)** | O(1) | Running min + max profit |
| Buy-sell (cooldown) | **O(n)** | O(1) | 3-state machine |

**Variable key:** *n* = input length · *m/n* = string lengths · *W* = knapsack capacity · *R/C* = grid dimensions

---

## When this pattern shows up

- **1-D sequence** — number of ways, min cost, reach last index
- **String comparison** — LCS, edit distance, wildcard/regex match
- **Subset / knapsack** — partition equal subset, target sum, 0-1 knapsack
- **Grid** — min path, unique paths, dungeon game
- **Stocks** — any "state on each day" problem with transitions
- **Interval DP** — burst balloons, matrix chain — nest two loops `for len` then `for start`

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [70](https://leetcode.com/problems/climbing-stairs/) | Climbing Stairs | Easy | dp[i] = dp[i-1] + dp[i-2] |
| [91](https://leetcode.com/problems/decode-ways/) | Decode Ways | Medium | 1-D DP; one- and two-digit decode |
| [300](https://leetcode.com/problems/longest-increasing-subsequence/) | Longest Increasing Subsequence | Medium | O(n log n) with bisect tails |
| [1143](https://leetcode.com/problems/longest-common-subsequence/) | Longest Common Subsequence | Medium | 2-D DP; match or skip |
| [72](https://leetcode.com/problems/edit-distance/) | Edit Distance | Hard | 2-D DP; replace/delete/insert |
| [416](https://leetcode.com/problems/partition-equal-subset-sum/) | Partition Equal Subset Sum | Medium | 0-1 knapsack; reverse iteration |
| [322](https://leetcode.com/problems/coin-change/) | Coin Change | Medium | Unbounded knapsack |
| [64](https://leetcode.com/problems/minimum-path-sum/) | Minimum Path Sum | Medium | Grid DP |
| [121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) | Best Time to Buy and Sell Stock | Easy | Running min price |
| [309](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/) | Buy and Sell with Cooldown | Medium | 3-state machine |
| [1335](https://leetcode.com/problems/minimum-difficulty-of-a-job-schedule/) | Min Difficulty of Job Schedule | Hard | Interval DP |
| [312](https://leetcode.com/problems/burst-balloons/) | Burst Balloons | Hard | Interval DP — think last balloon |
