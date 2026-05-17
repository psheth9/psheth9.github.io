---
title: "Two Pointers — Templates & Patterns"
date: 2026-05-17
category: algo
difficulty: medium
summary: "Two-pointer patterns: opposite ends (two sum sorted, container with water), same direction (remove duplicates, three sum), and fast/slow pointers (cycle detection, middle of list)."
problem: "Two pointers eliminate the need for a nested loop by using sorted order or structural properties to guarantee that moving either pointer makes forward progress."
---

## Two flavours

1. **Opposite ends** — `lo` starts at left, `hi` starts at right, they converge. Works on sorted arrays where you can decide which end to move based on the current sum vs target.
2. **Same direction (fast/slow)** — both start at left; fast advances to find candidates, slow marks the boundary of valid elements.

> **Key insight:** Two pointers are O(n) because each pointer moves in one direction only — neither ever goes backwards. Total moves ≤ 2n.

---

## 1. Two sum II — sorted array (LC 167)

```python
def twoSum(numbers, target):
    lo, hi = 0, len(numbers) - 1
    while lo < hi:
        s = numbers[lo] + numbers[hi]
        if s == target:   return [lo + 1, hi + 1]  # 1-indexed
        elif s < target:  lo += 1
        else:             hi -= 1
```

---

## 2. Three sum (LC 15)

```python
# Sort first. Fix one element, then two-pointer on the rest.
# Skip duplicates at both levels to avoid duplicate triplets.

def threeSum(nums):
    nums.sort()
    result = []

    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                       # skip duplicate fixed element

        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s == 0:
                result.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]: lo += 1
                while lo < hi and nums[hi] == nums[hi - 1]: hi -= 1
                lo += 1; hi -= 1
            elif s < 0: lo += 1
            else:       hi -= 1

    return result
```

---

## 3. Container with most water (LC 11)

```python
# Move the pointer at the shorter wall — the only way to possibly increase area.
# Moving the taller wall can only keep or decrease area (width shrinks, height can't grow).

def maxArea(height):
    lo, hi = 0, len(height) - 1
    max_water = 0

    while lo < hi:
        max_water = max(max_water, min(height[lo], height[hi]) * (hi - lo))
        if height[lo] < height[hi]:
            lo += 1
        else:
            hi -= 1

    return max_water
```

---

## 4. Trapping rain water — two-pointer O(1) space (LC 42)

```python
# At each position, water = min(max_left, max_right) - height[i].
# Two pointers: process the side with the smaller max first.

def trap(height):
    lo, hi = 0, len(height) - 1
    max_left = max_right = water = 0

    while lo <= hi:
        if max_left <= max_right:
            water    += max(0, max_left - height[lo])
            max_left  = max(max_left, height[lo])
            lo += 1
        else:
            water     += max(0, max_right - height[hi])
            max_right  = max(max_right, height[hi])
            hi -= 1

    return water
```

---

## 5. Remove duplicates from sorted array (LC 26)

```python
# slow marks the next write position; fast scans for new values.

def removeDuplicates(nums):
    slow = 1
    for fast in range(1, len(nums)):
        if nums[fast] != nums[fast - 1]:
            nums[slow] = nums[fast]
            slow += 1
    return slow
```

---

## 6. Find celebrity (LC 277)

```python
# A celebrity is known by everyone but knows no one.
# Two-pointer elimination: if A knows B, A is not celebrity; else B is not celebrity.
# After one pass, verify the candidate.

def findCelebrity(n, knows):
    candidate = 0
    for i in range(1, n):
        if knows(candidate, i):
            candidate = i   # candidate knows i → candidate ruled out

    # Verify candidate
    for i in range(n):
        if i != candidate:
            if knows(candidate, i) or not knows(i, candidate):
                return -1
    return candidate
```

---

## 7. Fast / slow pointers — linked list cycle (LC 141 / 142)

```python
# Floyd's algorithm: slow moves 1 step, fast moves 2.
# If they meet, there's a cycle.
# To find the cycle start: reset one pointer to head, advance both by 1.

def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

def detectCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            # Reset slow to head; advance both by 1 until they meet
            slow = head
            while slow is not fast:
                slow = slow.next
                fast = fast.next
            return slow
    return None
```

---

## 8. Middle of linked list (LC 876)

```python
def middleNode(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow   # when fast reaches end, slow is at middle
```

---

## Complexity

> **Key insight:** Both pointers together make at most n total moves — O(n) time, O(1) space. This beats brute force O(n²) by using sorted order or structural properties.

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| Two sum (sorted) | **O(n)** | O(1) | Sum < target → move lo; else hi |
| Three sum | **O(n²)** | O(1) | Sort + fix + two-pointer inner |
| Container with water | **O(n)** | O(1) | Move shorter wall |
| Trapping rain water | **O(n)** | O(1) | Process smaller-max side |
| Remove duplicates | **O(n)** | O(1) | slow = write, fast = read |
| Find celebrity | **O(n)** | O(1) | Elimination + verification |
| Cycle detection | **O(n)** | O(1) | Floyd's; meet then reset |
| Middle of list | **O(n)** | O(1) | fast reaches end when slow at middle |

---

## When this pattern shows up

- **Sorted array + target sum** → opposite-end two pointers
- **Triplets / quadruplets** → fix outer elements, two-pointer on rest
- **Area / water** → move the limiting (shorter) boundary
- **In-place modification** → slow/fast where slow = write pointer
- **Linked list structure** → fast/slow for cycle, middle, palindrome check
- **Elimination** → celebrity problem; each comparison rules one out

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [167](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) | Two Sum II | Easy | Opposite ends on sorted array |
| [15](https://leetcode.com/problems/3sum/) | 3Sum | Medium | Fix + two-pointer; skip duplicates |
| [11](https://leetcode.com/problems/container-with-most-water/) | Container With Most Water | Medium | Move shorter wall |
| [42](https://leetcode.com/problems/trapping-rain-water/) | Trapping Rain Water | Hard | Two-pointer O(1) space |
| [26](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) | Remove Duplicates | Easy | Slow write / fast read |
| [141](https://leetcode.com/problems/linked-list-cycle/) | Linked List Cycle | Easy | Floyd's fast/slow |
| [142](https://leetcode.com/problems/linked-list-cycle-ii/) | Linked List Cycle II | Medium | Floyd's + reset to head |
| [876](https://leetcode.com/problems/middle-of-the-linked-list/) | Middle of Linked List | Easy | Fast reaches end → slow at middle |
| [16](https://leetcode.com/problems/3sum-closest/) | 3Sum Closest | Medium | Three sum variant |
| [977](https://leetcode.com/problems/squares-of-a-sorted-array/) | Squares of Sorted Array | Easy | Opposite ends; largest square at edges |
