---
title: "Monotonic stack — the pattern that unlocks 'next greater element' problems"
date: 2026-05-12
category: algo
difficulty: medium
summary: "Notes on the monotonic-stack pattern, the family of problems it solves, and the template I use."
problem: "Given an array nums, return an array where answer[i] is the next element to the right of nums[i] that's greater than nums[i], or -1 if none."
---

## The pattern

Push indices onto a stack while their values are *strictly increasing* (or *strictly decreasing*, depending on the problem). When you see a value that breaks the invariant, pop until it doesn't.

What you pop represents an element whose "next greater" (or "next smaller") has finally been found — the current element.

## Template

```python
def next_greater(nums):
    n = len(nums)
    answer = [-1] * n
    stack = []  # holds indices, values decreasing top→bottom

    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            j = stack.pop()
            answer[j] = x
        stack.append(i)

    return answer
```

Time: O(n). Each index is pushed and popped at most once.
Space: O(n) for the stack and output.

## When this pattern shows up

- **Next greater / smaller element** — direct
- **Daily temperatures** — same problem, framed as days-to-wait
- **Largest rectangle in histogram** — pop while current bar < top of stack
- **Sum of subarray minimums** — count how many subarrays each element is the min of
- **Trapping rain water** — variant where we track *both* sides

## What I keep getting wrong

- **Strict vs non-strict** — `<` vs `<=` matters when there are duplicates. For "next *strictly* greater," use `<`. For "next greater or equal," use `<=`.
- **Storing values vs indices** — when the answer depends on distance (e.g., daily temperatures), you must store indices.
- **Direction** — sometimes scanning right-to-left is cleaner. The stack is the same, just the loop direction flips.

## Related problems I've solved with this

- LeetCode 496 · Next Greater Element I
- LeetCode 503 · Next Greater Element II (circular array — scan twice)
- LeetCode 739 · Daily Temperatures
- LeetCode 84 · Largest Rectangle in Histogram
- LeetCode 907 · Sum of Subarray Minimums
- LeetCode 42 · Trapping Rain Water
