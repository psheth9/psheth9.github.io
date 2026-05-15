---
title: "Union-Find — Disjoint Set Union (DSU)"
date: 2026-05-15
category: algo
difficulty: medium
summary: "Near O(1) per op with path compression + union by rank. The go-to structure for dynamic connectivity: are two nodes in the same component?"
problem: "Given n nodes and a list of edges, find the number of connected components."
---

## The pattern

Maintain a parent map (`uf`) and a rank map. Two operations:
- **find(x)** — follow parents to the root, compressing the path on the way.
- **union(x, y)** — merge the smaller tree under the larger one.

## Template

```python
from collections import defaultdict

uf            = {}
total_groups  = 0
ranks         = defaultdict(lambda: 1)

def find(x):
    while x != uf[x]:
        uf[x] = uf[uf[x]]   # path halving (compression)
        x     = uf[x]
    return x

def union(x, y):
    nonlocal total_groups
    rootx, rooty = find(x), find(y)

    if rootx == rooty:
        return              # already in the same component

    if ranks[y] > ranks[x]:   # always make x the bigger root
        rootx, rooty = rooty, rootx

    uf[rooty]     = rootx
    ranks[rootx] += ranks[rooty]
    total_groups  -= 1
```

**Initialization** — for each node `n`:
```python
uf[n]        = n    # each node is its own root
total_groups = len(nodes)
```

## Complexity

| | |
|---|---|
| Time | O(α(n)) per op — inverse Ackermann, effectively O(1) |
| Space | O(n) |

## Key details

- **Path halving** (`uf[x] = uf[uf[x]]`) is simpler than full path compression and just as fast in practice.
- **Union by rank** — always attach the shorter tree under the taller one. Without it, trees can degrade to linked lists.
- `total_groups` is a free bonus: track connected component count with zero extra work.
- For graphs given as edge lists, initialise all nodes first, then union each edge.

## When this pattern shows up

- Number of connected components in an undirected graph
- Redundant connection / detect cycle in undirected graph
- Accounts merge, friend circles
- Number of islands (can also do BFS/DFS — DSU is better when edges arrive online)
- Kruskal's MST algorithm

## Sample problems

<!-- add LeetCode problems here as you solve them -->
