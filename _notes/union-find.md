---
title: "Union-Find — Disjoint Set Union (DSU)"
date: 2026-05-16
category: graph
difficulty: medium
summary: "Near O(1) per op with path compression + union by rank. Three variants: standard class, 2D grid (flat ID mapping), and earliest-all-connected detection."
problem: "Given n nodes and a list of edges, find the number of connected components."
---

## The pattern

Maintain a `parent` array and a `rank` array. Two operations:
- **find(x)** — follow parents to the root, compressing the path on the way.
- **union(x, y)** — merge the smaller tree under the larger one.

## Template — class-based (preferred)

```python
class UnionFind:
    def __init__(self, size):
        self.parent     = list(range(size))
        self.rank       = [1] * size
        self.components = size

    def find(self, x):
        if x != self.parent[x]:
            self.parent[x] = self.find(self.parent[x])   # path compression
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False                      # already connected
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        self.components -= 1
        return True                           # newly connected

    def connected(self, x, y):
        return self.find(x) == self.find(y)

    def count_components(self):
        return self.components
```

## Template — dict-based (when nodes aren't integers)

```python
from collections import defaultdict

parent = {}
rank   = defaultdict(lambda: 1)

def find(x):
    while x != parent[x]:
        parent[x] = parent[parent[x]]   # path halving
        x = parent[x]
    return x

def union(x, y):
    rx, ry = find(x), find(y)
    if rx == ry:
        return
    if rank[ry] > rank[rx]:
        rx, ry = ry, rx
    parent[ry]  = rx
    rank[rx]   += rank[ry]

# Initialise: for each node n → parent[n] = n
```

## Union-Find on 2D grid (row, col → flat ID)

```python
# Flatten a 2D grid cell (r, c) to a 1D index: id = r * cols + c
# Use when grid cells are added dynamically (e.g. Number of Islands II).

class GridUnionFind:
    def __init__(self, m, n):
        self.n      = n
        self.parent = [-1] * (m * n)   # -1 = inactive (water)
        self.size   = [0]  * (m * n)
        self.islands = 0

    def get_id(self, r, c):
        return self.n * r + c

    def activate(self, r, c):
        i = self.get_id(r, c)
        self.parent[i] = i
        self.size[i]   = 1
        self.islands  += 1

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, r1, c1, r2, c2):
        a, b = self.get_id(r1, c1), self.get_id(r2, c2)
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb]  = ra
        self.size[ra]   += self.size[rb]
        self.islands    -= 1

# LC 305 — Number of Islands II (dynamic land additions)
def numIslands2(m, n, positions):
    uf   = GridUnionFind(m, n)
    grid = [[0] * n for _ in range(m)]
    dirs = [[1,0],[-1,0],[0,1],[0,-1]]
    result = []

    for r, c in positions:
        if grid[r][c] == 1:
            result.append(uf.islands)
            continue
        grid[r][c] = 1
        uf.activate(r, c)
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                uf.union(r, c, nr, nc)
        result.append(uf.islands)
    return result
```

## Detect when all nodes become connected (earliest acquisition)

```python
# Sort events by time. Union until components == 1, return that timestamp.
# LC 1101 — The Earliest Moment When Everyone Become Friends

def earliestAcq(logs, n):
    uf = UnionFind(n)
    logs.sort(key=lambda x: x[0])
    for time, x, y in logs:
        uf.union(x, y)
        if uf.components == 1:
            return time
    return -1
```

## Complexity

> **Key insight:** With path compression + union by rank, each operation is O(α(n)) — the inverse Ackermann function, which is ≤ 4 for any realistic input. Treat it as O(1).

| Operation | Time | Space | Notes |
|---|---|---|---|
| `find(x)` | **O(α(n))** ≈ O(1) | O(1) | Path compression flattens on every call |
| `union(x, y)` | **O(α(n))** ≈ O(1) | O(1) | Rank/size prevents tall trees |
| Build (n unions) | **O(n · α(n))** ≈ O(n) | O(n) | One `parent` + `rank` array |
| `connected(x, y)` | **O(α(n))** ≈ O(1) | O(1) | Two `find` calls |
| 2D grid union-find | **O(R·C · α(R·C))** | O(R·C) | Flat ID: `id = row*cols + col` |

**Variable key:** *n* = number of nodes · *α* = inverse Ackermann (≤ 4 in practice) · *R/C* = grid rows/cols

## Key details

- **Path compression** — on every `find`, point the node directly at the root. Flattens the tree over time.
- **Union by rank** — attach the shallower tree under the deeper one. Prevents linear chains.
- `components` counter is a free bonus: decrement by 1 on every successful union.
- For grid problems, `get_id = row * cols + col` flattens 2D → 1D so a single parent array covers the whole grid.
- Always initialise all nodes before calling union (even for dict-based variant).

## When this pattern shows up

- Number of connected components in an undirected graph
- Redundant connection / detect cycle in undirected graph
- Number of islands (static DFS/BFS or dynamic DSU)
- Number of islands II — dynamic additions (use `GridUnionFind`)
- Earliest moment everyone is connected — `components == 1` check
- Friend circles, accounts merge
- Kruskal's MST algorithm

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [547](https://leetcode.com/problems/number-of-provinces/) | Number of Provinces | Medium | Count connected components |
| [684](https://leetcode.com/problems/redundant-connection/) | Redundant Connection | Medium | Detect cycle — edge that joins two connected nodes |
| [990](https://leetcode.com/problems/satisfiability-of-equality-equations/) | Satisfiability of Equality Equations | Medium | Union on `==`, validate on `!=` |
| [1202](https://leetcode.com/problems/smallest-string-with-swaps/) | Smallest String With Swaps | Medium | Group chars by component, sort each |
| [1971](https://leetcode.com/problems/find-if-path-exists-in-graph/) | Find if Path Exists in Graph | Easy | `connected(src, dst)` |
| [305](https://leetcode.com/problems/number-of-islands-ii/) | Number of Islands II | Hard | Dynamic `activate()` per query |
| [721](https://leetcode.com/problems/accounts-merge/) | Accounts Merge | Medium | Union by email, group by root |
| [1101](https://leetcode.com/problems/the-earliest-moment-when-everyone-become-friends/) | Earliest Moment All Friends | Medium | Sort by time; union until `components == 1` |
