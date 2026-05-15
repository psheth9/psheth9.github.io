---
title: "Random Pick with Weight — prefix sum + binary search"
date: 2026-05-15
category: algo
difficulty: medium
summary: "Build a prefix-sum array from the weights. A uniform random float in [0, total) lands in exactly one bucket. Find it with bisect_left in O(log n)."
problem: "Given an array of weights, implement pickIndex() that returns index i with probability proportional to w[i]."
---

## The pattern

Each weight `w[i]` carves out a segment of length `w[i]` in the range `[0, total_sum)`. A uniform random point falls in that segment with probability `w[i] / total_sum`. Build the prefix-sum array once; use binary search for every pick.

## Template

```python
import random
import bisect
from typing import List

class Solution:
    def __init__(self, w: List[int]):
        self.prefix_sums = []
        self.total_sum   = 0
        for weight in w:
            self.total_sum += weight
            self.prefix_sums.append(self.total_sum)

    def pickIndex(self) -> int:
        target = random.random() * self.total_sum
        # bisect_left: first index where prefix_sum >= target
        return bisect.bisect_left(self.prefix_sums, target)
```

## Complexity

| | |
|---|---|
| Build | O(n) |
| Pick | O(log n) per call |
| Space | O(n) |

## Key details

- **`bisect_left` vs `bisect_right`** — use `bisect_left`. It returns the first position where `prefix_sums[i] >= target`, which maps a random float to exactly the right bucket including the left boundary.
- `random.random()` returns a float in `[0.0, 1.0)`. Multiply by `total_sum` to get `[0, total_sum)`.
- **Why prefix sums work** — `prefix_sums[i]` is the right edge of bucket `i`. The segment for index `i` is `[prefix_sums[i-1], prefix_sums[i])`. `bisect_left` on a random target finds which segment it falls into.

## Naive alternative (don't do this)

Building an expanded list (repeat index `i` exactly `w[i]` times) works but uses O(total_weight) space and O(1) pick. Prefix sum + binary search is strictly better when weights are large.

## When this pattern shows up

- LeetCode 528 · Random Pick with Weight
- Weighted reservoir sampling
- Roulette-wheel selection in genetic algorithms
- Load balancing proportional to server capacity
- A/B test traffic splitting by percentage

## Sample problems

<!-- add LeetCode problems here as you solve them -->
