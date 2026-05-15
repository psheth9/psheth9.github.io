---
title: "BFS — Level-order traversal"
date: 2026-05-15
category: algo
difficulty: easy
summary: "Process a binary tree level by level using a deque. Snapshot len(queue) at the start of each level so you only consume nodes that were already there."
problem: "Given a binary tree, return the average value of nodes at each level."
---

## The pattern

Use a deque. At the start of each level, snapshot `len(queue)` — this tells you exactly how many nodes belong to the current level. Process only that many, appending children as you go. Children land in the next level automatically.

## Template

```python
from collections import deque
from typing import Optional, List

def averageOfLevels(root: Optional[TreeNode]) -> List[float]:
    queue    = deque([root])
    ans      = []

    while queue:
        level    = len(queue)   # snapshot: nodes at this level only
        levelavg = 0

        for _ in range(level):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
            levelavg += node.val

        ans.append(levelavg / level)

    return ans
```

## Complexity

| | |
|---|---|
| Time | O(n) — every node visited once |
| Space | O(w) — w is the max width of the tree |

## Key details

- **`len(queue)` snapshot** — the single most important line. Without it you'd mix nodes from different levels.
- Works on any graph with a clear start node, not just trees. For graphs, add a `visited` set.
- For right-side view: just take `queue[-1]` (or last node processed) at each level instead of averaging.

## When this pattern shows up

- Level averages, level-by-level output, zigzag traversal
- Binary tree right-side view
- Minimum depth of binary tree
- Connect next right pointers (populate next pointers)
- Word ladder — treat words as graph nodes, BFS finds shortest path

## Sample problems

<!-- add LeetCode problems here as you solve them -->
