---
title: "Tree Algorithms — Templates, Traversals & Patterns"
date: 2026-05-16
category: tree
difficulty: medium
summary: "Comprehensive tree reference: DFS/BFS traversals, iterative patterns, level-order tricks, LCA, BST validation, path sum, vertical order, and serialize/deserialize."
problem: "Most tree problems reduce to one of three patterns: DFS post-order (bottom-up), BFS level-by-level, or DFS with a passed-down value (top-down)."
---

## TreeNode definition

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val   = val
        self.left  = left
        self.right = right
```

---

## 1. DFS traversals — recursive

```python
def inorder(root):        # left → root → right  (BST: sorted order)
    if not root: return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def preorder(root):       # root → left → right
    if not root: return []
    return [root.val] + preorder(root.left) + preorder(root.right)

def postorder(root):      # left → right → root
    if not root: return []
    return postorder(root.left) + postorder(root.right) + [root.val]
```

---

## 2. Iterative traversal — visited-flag pattern

```python
# Works for inorder, preorder, postorder — change only the push order.
# Each stack entry is (node, visited). visited=True means "process now".

def inorder_iterative(root):
    stack, result = [(root, False)], []
    while stack:
        node, visited = stack.pop()
        if not node:
            continue
        if visited:
            result.append(node.val)    # process
        else:
            # Push in REVERSE of desired visit order (stack is LIFO)
            stack.append((node.right, False))
            stack.append((node, True))   # mark: process on second pop
            stack.append((node.left, False))
    return result

# For preorder:  push right → left → (node, True)
# For postorder: push (node, True) → right → left
```

---

## 3. BFS level order — `len(queue)` snapshot

```python
from collections import deque

def levelOrder(root):
    if not root: return []
    q = deque([root])
    result = []

    while q:
        level = []
        for _ in range(len(q)):       # snapshot size before processing level
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        result.append(level)

    return result

# N-ary version: replace node.left/node.right with `for child in node.children`
```

---

## 4. DFS level order — top-down (pass level index)

```python
# Top-down: pass the current level as a parameter.
# result[level] gets extended as DFS visits nodes left-to-right.

def levelOrder_dfs(root):
    result = []

    def dfs(node, level):
        if not node: return
        if level == len(result):
            result.append([])          # start a new level bucket
        result[level].append(node.val)
        dfs(node.left,  level + 1)
        dfs(node.right, level + 1)

    dfs(root, 0)
    return result
```

---

## 5. DFS level order — bottom-up (return height)

```python
# Bottom-up: return height from leaves; use it to compute depth of current node.
# Useful when you need to know the max depth before processing.

def levelOrder_bottomUp(root):
    result = []

    def dfs(node):
        if not node: return 0
        left_h  = dfs(node.left)
        right_h = dfs(node.right)
        height  = max(left_h, right_h) + 1

        level = height - 1             # distance from bottom
        if level == len(result):
            result.append([])
        result[level].append(node.val)
        return height

    dfs(root)
    result.reverse()                   # flip: leaf-level first → root-level first
    return result
```

---

## 6. Right side view (LC 199)

```python
# DFS: visit right child first; first node seen at each depth is the rightmost.

def rightSideView(root):
    result = []

    def dfs(node, depth):
        if not node: return
        if depth == len(result):
            result.append(node.val)    # first visit at this depth
        dfs(node.right, depth + 1)     # right first
        dfs(node.left,  depth + 1)

    dfs(root, 0)
    return result
```

---

## 7. Vertical order traversal (LC 987)

```python
from collections import defaultdict, deque

def verticalOrder(root):
    if not root: return []

    col_map = defaultdict(list)
    min_col = max_col = 0

    # BFS — track horizontal distance (hd) alongside each node
    q = deque([(root, 0)])

    while q:
        node, hd = q.popleft()
        col_map[hd].append(node.val)
        min_col = min(min_col, hd)
        max_col = max(max_col, hd)

        if node.left:  q.append((node.left,  hd - 1))
        if node.right: q.append((node.right, hd + 1))

    return [col_map[col] for col in range(min_col, max_col + 1)]
```

---

## 8. Lowest Common Ancestor (LC 236)

```python
def lowestCommonAncestor(root, p, q):
    if root in (None, p, q):
        return root                    # base case: found one of the targets

    left  = lowestCommonAncestor(root.left,  p, q)
    right = lowestCommonAncestor(root.right, p, q)

    # If both sides returned a node → root is the LCA
    if left and right:
        return root
    return left or right               # only one side found something
```

---

## 9. Validate BST (LC 98)

```python
# Pass min/max bounds down — tighter at every level.
# Every node must satisfy: min_val < node.val < max_val

def isValidBST(root):
    def validate(node, min_val, max_val):
        if not node:
            return True
        if not (min_val < node.val < max_val):
            return False
        return (validate(node.left,  min_val,   node.val) and
                validate(node.right, node.val,  max_val))

    return validate(root, float('-inf'), float('inf'))
```

---

## 10. Root-to-leaf paths with backtracking (LC 257 / 113)

```python
def pathSum(root, target):
    result = []

    def dfs(node, path, remaining):
        if not node:
            return
        path.append(node.val)

        if not node.left and not node.right and remaining == node.val:
            result.append(path[:])      # snapshot — never append path directly

        dfs(node.left,  path, remaining - node.val)
        dfs(node.right, path, remaining - node.val)
        path.pop()                      # backtrack

    dfs(root, [], target)
    return result
```

---

## 11. Sum root-to-leaf numbers (LC 129)

```python
# Each level multiplies running total by 10 before adding the current digit.

def sumNumbers(root):
    def dfs(node, total):
        if not node:
            return 0
        total = total * 10 + node.val
        if not node.left and not node.right:
            return total               # leaf — return the full number
        return dfs(node.left, total) + dfs(node.right, total)

    return dfs(root, 0)
```

---

## 12. Max path sum — global state via `self.ans` (LC 124)

```python
class Solution:
    def maxPathSum(self, root):
        self.ans = float('-inf')

        def dfs(node):
            if not node:
                return 0
            left  = max(dfs(node.left),  0)   # discard negative branches
            right = max(dfs(node.right), 0)

            # Path through this node (can't be extended upward if it bends)
            self.ans = max(self.ans, node.val + left + right)

            # Return the best single-arm extension upward
            return node.val + max(left, right)

        dfs(root)
        return self.ans
```

---

## 13. Serialize / deserialize binary tree (LC 297)

```python
from collections import deque

def serialize(root):
    if not root: return ""
    result = []
    q = deque([root])

    while q:
        node = q.popleft()
        if node:
            result.append(str(node.val))
            q.append(node.left)
            q.append(node.right)
        else:
            result.append("null")

    return ",".join(result)

def deserialize(data):
    if not data: return None
    vals = data.split(",")
    root = TreeNode(int(vals[0]))
    q = deque([root])
    i = 1

    while q and i < len(vals):
        node = q.popleft()
        if vals[i] != "null":
            node.left = TreeNode(int(vals[i]))
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] != "null":
            node.right = TreeNode(int(vals[i]))
            q.append(node.right)
        i += 1

    return root
```

---

## Complexity

| Algorithm | Time | Space |
|---|---|---|
| DFS traversal | O(n) | O(h) stack |
| BFS level order | O(n) | O(w) max width |
| LCA | O(n) | O(h) |
| Validate BST | O(n) | O(h) |
| Path sum | O(n) | O(h) |
| Vertical order | O(n) | O(n) |
| Serialize | O(n) | O(n) |

h = tree height (O(log n) balanced, O(n) worst)

---

## When each pattern shows up

- **Inorder recursive** — BST sorted output, kth smallest
- **Iterative visited-flag** — any traversal, Morris-style space awareness
- **BFS level order** — level averages, zigzag traversal, connect next pointers
- **DFS level order top-down** — same as BFS but avoids a queue
- **Right side view** — any "first/last node per level" problem
- **Vertical order + `hd`** — grouping nodes by column
- **LCA** — distance between nodes, path queries
- **Validate BST with bounds** — verify BST, find invalid node
- **Path backtracking** — all root-to-leaf paths, path sum II
- **`total * 10 + val`** — sum numbers, encode paths as integers
- **`self.ans` global** — diameter, max path sum (path bends → can't propagate up)
- **Serialize BFS** — clone tree, transmit tree structure

## Sample problems

<!-- add LeetCode problems here as you solve them -->
