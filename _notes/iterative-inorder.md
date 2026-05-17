---
title: "Iterative inorder traversal — no recursion"
date: 2026-05-15
category: tree
difficulty: medium
summary: "Inorder traversal without recursion using an explicit stack and a visited flag. Avoids stack overflow on skewed trees and generalises cleanly to pre/postorder."
problem: "Return the inorder traversal of a binary tree's nodes without using recursion."
---

## The pattern

Attach a `visited` boolean to each stack entry. When a node is first popped (`visited=False`), push its right child, itself (marked `visited=True`), and its left child — in that order. When popped as visited, record its value.

## Template

```python
from typing import Optional, List

def inorderTraversal(root: Optional[TreeNode]) -> List[int]:
    if not root:
        return []

    ans = []
    stk = [(root, False)]    # (node, visited)

    while stk:
        node, visited = stk.pop()

        if visited:
            ans.append(node.val)
            continue

        # Push in reverse of desired visit order
        # Inorder: left → self → right
        # So push: right, self (visited), left
        if node.right:
            stk.append((node.right, False))
        stk.append((node, True))
        if node.left:
            stk.append((node.left, False))

    return ans
```

## Complexity

| | |
|---|---|
| Time | O(n) — every node pushed and popped twice |
| Space | O(n) explicit stack |

## Key details

- **Push order is reversed** — the stack is LIFO, so to visit left first you must push right first.
- **Generalises to all orders** — just change the push sequence:
  - **Preorder** (self → left → right): push right, left, self(visited)
  - **Postorder** (left → right → self): push self(visited), right, left
- The visited flag sidesteps the classic two-phase approach (go-left loop + process loop), making the code uniform regardless of traversal order.

## When this pattern shows up

- Kth smallest element in a BST
- Validate BST — inorder should be strictly increasing
- Recover BST — find the two swapped nodes
- Binary search tree iterator (LeetCode 173)
- Any traversal where call-stack depth is a constraint

## Sample problems

<!-- add LeetCode problems here as you solve them -->
