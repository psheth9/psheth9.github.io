---
title: "Monotonic Stack — Templates & Patterns"
date: 2026-05-17
category: algo
difficulty: medium
summary: "Monotonic stack patterns: next greater element, previous smaller element, circular arrays, largest rectangle in histogram, and trapping rain water."
problem: "A monotonic stack keeps elements in sorted order by popping anything that violates the order before pushing. When you pop, you've found the answer for the popped element."
---

## The core idea

Maintain a stack that is always **increasing** or **decreasing**. When a new element violates the order, pop — and at that moment, the new element is the answer (next greater / next smaller) for everything you just popped.

> **Key insight:** The moment you pop element `x` because of incoming `y`, you know: `y` is the **next greater element** of `x`. This gives O(n) — each element is pushed and popped at most once.

---

## Template — next greater element

```python
def nextGreater(nums):
    n = len(nums)
    result = [-1] * n
    stack = []   # stores indices, values are decreasing (monotone decreasing)

    for i, val in enumerate(nums):
        # Pop everything smaller — current val is their next greater
        while stack and nums[stack[-1]] < val:
            result[stack.pop()] = val
        stack.append(i)

    # Remaining indices in stack have no greater element → result stays -1
    return result

# nextGreater([2, 1, 2, 4, 3]) → [4, 2, 4, -1, -1]
```

---

## 1. Next greater element I (LC 496)

```python
# nums1 is a subset of nums2. For each element in nums1,
# find its next greater element in nums2.

from collections import defaultdict

def nextGreaterElement(nums1, nums2):
    next_greater = defaultdict(lambda: -1)
    stack = []

    for val in nums2:
        while stack and stack[-1] < val:
            next_greater[stack.pop()] = val
        stack.append(val)

    return [next_greater[x] for x in nums1]
```

---

## 2. Next greater element II — circular array (LC 503)

```python
# Key trick: duplicate the array (nums + nums[:-1]) to handle wrap-around.
# Track by index, not value, to handle duplicates correctly.

def nextGreaterElements(nums):
    n = len(nums)
    result = [-1] * n
    stack = []   # stores indices

    for i in range(2 * n - 1):
        val = nums[i % n]
        while stack and nums[stack[-1]] < val:
            result[stack.pop()] = val
        if i < n:
            stack.append(i)

    return result

# nextGreaterElements([1,2,1]) → [2,-1,2]
```

---

## 3. Daily temperatures (LC 739)

```python
# How many days until a warmer temperature?
# Stack holds indices of days waiting for their next warmer day.

def dailyTemperatures(temps):
    n = len(temps)
    result = [0] * n
    stack = []   # indices, temps are decreasing

    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            result[j] = i - j      # days to wait
        stack.append(i)

    return result

# dailyTemperatures([73,74,75,71,69,72,76,73]) → [1,1,4,2,1,1,0,0]
```

---

## 4. Largest rectangle in histogram (LC 84)

```python
# For each bar, find the left and right boundary where it's the shortest.
# Stack keeps bars in increasing height order.
# When a shorter bar arrives, pop and calculate area using the popped bar as height.

def largestRectangleArea(heights):
    heights.append(0)      # sentinel to flush remaining stack
    stack = [-1]           # sentinel index
    max_area = 0

    for i, h in enumerate(heights):
        while stack[-1] != -1 and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            width  = i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)

    return max_area

# largestRectangleArea([2,1,5,6,2,3]) → 10  (bars 5,6 → 2×5)
```

---

## 5. Trapping rain water (LC 42)

```python
# Stack approach: when a taller bar arrives, the popped bar forms a valley.
# Water = (min(left_wall, right_wall) - valley_height) × width

def trap(height):
    stack = []
    water = 0

    for i, h in enumerate(height):
        while stack and height[stack[-1]] < h:
            bottom = stack.pop()
            if not stack:
                break
            left   = stack[-1]
            width  = i - left - 1
            depth  = min(height[left], h) - height[bottom]
            water += depth * width
        stack.append(i)

    return water

# trap([0,1,0,2,1,0,1,3,2,1,2,1]) → 6
```

---

## 6. Previous smaller element

```python
# Symmetric: use increasing stack, pop when smaller arrives.
# On pop: the current element is the PREVIOUS smaller for nothing yet —
# actually flip: maintain DECREASING to find previous greater, or
# iterate from left pushing and recording stack[-1] before appending.

def previousSmaller(nums):
    result = [-1] * len(nums)
    stack = []   # increasing stack (values)

    for i, val in enumerate(nums):
        while stack and stack[-1] >= val:
            stack.pop()
        result[i] = stack[-1] if stack else -1
        stack.append(val)

    return result

# previousSmaller([4, 5, 2, 10, 8]) → [-1, 4, -1, 2, 2]
```

---

## Complexity

> **Key insight:** Despite the nested while loop, each element is pushed and popped at most once — total work is O(n).

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| Next greater element | **O(n)** | O(n) | Each element pushed/popped once |
| Next greater — circular | **O(n)** | O(n) | Two passes via `i % n` |
| Daily temperatures | **O(n)** | O(n) | Index stack |
| Largest rectangle | **O(n)** | O(n) | Sentinel at end flushes stack |
| Trapping rain water | **O(n)** | O(n) | Stack or two-pointer (O(1) space) |
| Previous smaller | **O(n)** | O(n) | Read stack top before pushing |

---

## When this pattern shows up

- **Next greater / smaller** — any "find the first X to the right/left" query
- **Span / waiting time** — how far until temperature rises, stock span
- **Area problems** — largest rectangle uses width between stack boundaries
- **Rain water** — valley detection between two walls
- **Circular arrays** — duplicate array; iterate `2n - 1` times using `i % n`

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [496](https://leetcode.com/problems/next-greater-element-i/) | Next Greater Element I | Easy | Hash map + monotone stack |
| [503](https://leetcode.com/problems/next-greater-element-ii/) | Next Greater Element II | Medium | Circular: `i % n` |
| [739](https://leetcode.com/problems/daily-temperatures/) | Daily Temperatures | Medium | Index stack; `i - j` = wait |
| [84](https://leetcode.com/problems/largest-rectangle-in-histogram/) | Largest Rectangle in Histogram | Hard | Pop on shorter bar; width = `i - left - 1` |
| [42](https://leetcode.com/problems/trapping-rain-water/) | Trapping Rain Water | Hard | Valley between two walls |
| [901](https://leetcode.com/problems/online-stock-span/) | Online Stock Span | Medium | Accumulate span when popping |
| [1475](https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/) | Final Prices With Discount | Easy | Next smaller or equal |
| [85](https://leetcode.com/problems/maximal-rectangle/) | Maximal Rectangle | Hard | LC 84 applied to each row |
