---
title: "Sliding Window — Templates & Patterns"
date: 2026-05-16
category: algo
difficulty: medium
summary: "Sliding window patterns: fixed-size window, variable-size two-pointer, prefix sum for subarray sum equals K, and monotonic deque for range maximum/minimum."
problem: "Sliding window = move right pointer always, move left pointer only when window breaks a constraint."
---

## Pattern 1 — Fixed-size window (sum / max)

```python
def max_sum_subarray_k(arr, k):
    window_sum = sum(arr[:k])
    maxi = window_sum

    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]   # slide: add right, drop left
        maxi = max(maxi, window_sum)

    return maxi

# max_sum_subarray_k([11,4,2,10,23,3,1,0,20], 4) → 39
```

---

## Pattern 2 — Variable-size window (two pointers)

```python
# Longest substring without repeating characters (LC 3)
# Key insight: only reset start when the duplicate is INSIDE the current window.
# dict[ch] >= start distinguishes in-window vs. stale entries.

def lengthOfLongestSubstring(s):
    start = maxi = 0
    last_seen = {}

    for index, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= start:  # stale check!
            start = last_seen[ch] + 1
        maxi = max(maxi, index - start + 1)
        last_seen[ch] = index

    return maxi
```

```python
# Max consecutive ones with at most k flips (LC 1004)
# Track zero positions in a deque; evict oldest zero when count exceeds k.

from collections import deque

def longestOnes(nums, k):
    start = maxi = 0
    zero_que = deque()

    for index, value in enumerate(nums):
        if value == 0:
            zero_que.append(index)
            if len(zero_que) > k:
                start = zero_que.popleft() + 1
        maxi = max(maxi, index - start + 1)

    return maxi
```

---

## Pattern 3 — Prefix sum for subarray sum equals K (LC 560)

```python
# prefix_sum - k already seen → those subarrays sum to exactly k.
# Seed dict[0] = 1 so a prefix itself equal to k is counted.

from collections import defaultdict

def subarraySum(nums, k):
    prefix_counts = defaultdict(int)
    prefix_counts[0] = 1          # empty prefix

    total = count = 0
    for num in nums:
        total += num
        count += prefix_counts[total - k]   # subarrays ending here that sum to k
        prefix_counts[total] += 1

    return count

# subarraySum([1,1,1], 2) → 2
```

```python
# Maximum length subarray summing to k (variant)
def maxSubarrayLen(nums, k):
    prefix_index = {0: -1}   # prefix_sum → earliest index seen
    total = max_len = 0

    for i, num in enumerate(nums):
        total += num
        if total - k in prefix_index:
            max_len = max(max_len, i - prefix_index[total - k])
        if total not in prefix_index:
            prefix_index[total] = i   # only store first occurrence (longest window)

    return max_len
```

```python
# Subarray product less than K (LC 713)
# Two-pointer: shrink left while product >= k; count = right - left + 1 subarrays.

def numSubarrayProductLessThanK(nums, k):
    if k <= 1:
        return 0
    prod = 1
    ans = left = 0

    for right, val in enumerate(nums):
        prod *= val
        while prod >= k:
            prod //= nums[left]
            left += 1
        ans += right - left + 1    # all subarrays ending at right with left as floor

    return ans
```

---

## Pattern 4 — Monotonic deque for sliding window maximum (LC 239)

```python
# Maintain a deque of (index, value) in decreasing order of value.
# Front is always the maximum of the current window.

from collections import deque

class MonotonicMaxQueue:
    def __init__(self):
        self.que = deque()   # stores (index, value), decreasing by value

    def push(self, index, value):
        while self.que and self.que[-1][1] < value:
            self.que.pop()                 # evict smaller elements — they can't be max
        self.que.append((index, value))

    def get_max(self):
        return self.que[0][1]

    def evict_outside_window(self, index, window_size):
        if self.que[0][0] <= index - window_size:
            self.que.popleft()

def maxSlidingWindow(arr, k):
    mq = MonotonicMaxQueue()
    ans = []

    for i, val in enumerate(arr):
        mq.push(i, val)
        if i >= k - 1:
            mq.evict_outside_window(i, k)
            ans.append(mq.get_max())

    return ans

# maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3) → [3,3,5,5,6,7]
```

```python
# Compact one-function version (LC 239)
def maxSlidingWindow_compact(nums, k):
    dq = deque()   # stores indices, front = max
    res = []

    for i, val in enumerate(nums):
        while dq and nums[dq[-1]] < val:
            dq.pop()
        dq.append(i)
        if dq[0] == i - k:          # front fell out of window
            dq.popleft()
        if i >= k - 1:
            res.append(nums[dq[0]])

    return res
```

---

## Complexity

| Pattern | Time | Space |
|---|---|---|
| Fixed window | O(n) | O(1) |
| Variable two-pointer | O(n) | O(n) |
| Prefix sum | O(n) | O(n) |
| Monotonic deque | O(n) amortized | O(k) |

---

## When each pattern shows up

- **Fixed window** — max/min/sum of exactly k elements
- **Variable two-pointer** — longest subarray/substring satisfying a constraint
- **Prefix sum + hashmap** — count/length of subarrays with exact sum k (handles negatives)
- **Monotonic deque** — range max/min queries in O(n); also used in jump game variants

## Sample problems

<!-- add LeetCode problems here as you solve them -->
