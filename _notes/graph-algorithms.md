---
title: "Graph Algorithms — Templates & Patterns"
date: 2026-05-16
category: algo
difficulty: medium
summary: "BFS/DFS templates, Dijkstra, topological sort (DFS + Kahn's), Union-Find with path compression, cycle detection, bipartite check, connected components, and grid traversal patterns."
problem: "Core graph algorithm templates covering traversal, shortest paths, ordering, and connectivity."
---

## Graph construction — adjacency list

```python
from collections import defaultdict

# Undirected
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)

# Directed weighted
graph = defaultdict(list)
for u, v, w in edges:
    graph[u].append((v, w))
```

## BFS — standard template

```python
from collections import deque

def bfs(graph, start):
    visited = set([start])
    q = deque([start])

    while q:
        node = q.popleft()
        for nei in graph[node]:
            if nei not in visited:
                visited.add(nei)
                q.append(nei)

# Level-by-level (when depth matters)
def bfs_levels(graph, start):
    visited = set([start])
    q = deque([start])
    depth = 0

    while q:
        for _ in range(len(q)):          # process one level at a time
            node = q.popleft()
            for nei in graph[node]:
                if nei not in visited:
                    visited.add(nei)
                    q.append(nei)
        depth += 1
    return depth
```

## Grid BFS — boundary + visited condition

```python
# Key: always check boundary AND visited before enqueuing
from collections import deque

def grid_bfs(grid, start_r, start_c):
    rows, cols = len(grid), len(grid[0])
    dirs = [[1,0],[0,1],[-1,0],[0,-1]]

    def is_valid(r, c):
        return 0 <= r < rows and 0 <= c < cols

    visited = set([(start_r, start_c)])
    q = deque([(start_r, start_c, 0)])   # (row, col, dist)

    while q:
        r, c, dist = q.popleft()
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            # TODO pattern: boundary AND visited checked together
            if is_valid(nr, nc) and (nr, nc) not in visited and grid[nr][nc] != WALL:
                visited.add((nr, nc))
                q.append((nr, nc, dist + 1))
```

## Grid DFS — no visited needed (branch-cut via value)

```python
# Walls and Gates pattern:
# When updating a cell's value IS the visited guard (overwrite only if better),
# you don't need a separate visited set.

from typing import List

def wallsAndGates(rooms: List[List[int]]) -> None:
    rows, cols = len(rooms), len(rooms[0])
    dirs = [[1,0],[0,1],[-1,0],[0,-1]]
    is_valid = lambda r, c: 0 <= r < rows and 0 <= c < cols and rooms[r][c] > 0

    def dfs(i, j, distance):
        for dr, dc in dirs:
            nr, nc = i + dr, j + dc
            # Branch cut: only recurse if this path improves the cell
            if is_valid(nr, nc) and rooms[nr][nc] > distance + 1:
                rooms[nr][nc] = distance + 1
                dfs(nr, nc, distance + 1)

    for i in range(rows):
        for j in range(cols):
            if rooms[i][j] == 0:
                dfs(i, j, 0)
```

## DFS — recursive and iterative

```python
from collections import defaultdict

# Recursive
def dfs_recursive(graph, root, visited=None):
    if visited is None:
        visited = set()
    visited.add(root)
    for child in graph[root]:
        if child not in visited:
            dfs_recursive(graph, child, visited)
    return visited

# Iterative (explicit stack)
def dfs_iterative(graph, root):
    visited = set()
    stack = [root]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        for child in graph[node]:
            if child not in visited:
                stack.append(child)
    return visited
```

## Connected components count

```python
from collections import defaultdict

def count_components(n, edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    visited = [False] * n
    count = 0

    def dfs(node):
        visited[node] = True
        for child in graph[node]:
            if not visited[child]:
                dfs(child)

    for i in range(n):
        if not visited[i]:
            dfs(i)
            count += 1

    return count
```

## Cycle detection (directed graph — 3-state DFS)

```python
# States: 0 = unvisited, 1 = in current path, 2 = fully processed
def has_cycle(n, edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)

    visited = [0] * n

    def dfs(node):
        visited[node] = 1
        for child in graph[node]:
            if visited[child] == 1:   # back edge → cycle
                return True
            if visited[child] == 2:   # already processed, safe
                continue
            if dfs(child):
                return True
        visited[node] = 2
        return False

    return any(dfs(i) for i in range(n) if visited[i] == 0)
```

## Topological sort — DFS (post-order push)

```python
from collections import defaultdict

def topo_dfs(n, edges):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)

    visited = [False] * n
    stack = []

    def dfs(node):
        visited[node] = True
        for child in graph[node]:
            if not visited[child]:
                dfs(child)
        stack.append(node)   # push AFTER all children processed

    # Run on all nodes (handles forests)
    for i in range(n):
        if not visited[i]:
            dfs(i)

    return stack[::-1]   # reverse = topological order
```

## Topological sort — Kahn's algorithm (BFS, detects cycles)

```python
from collections import defaultdict, deque

def kahn_topo(n, edges):
    graph = defaultdict(list)
    indegree = defaultdict(int)

    for u, v in edges:
        graph[u].append(v)
        indegree[v] += 1

    # Start with all 0-indegree nodes
    q = deque([i for i in range(n) if indegree[i] == 0])
    result = []

    while q:
        node = q.popleft()
        result.append(node)
        for child in graph[node]:
            indegree[child] -= 1
            if indegree[child] == 0:
                q.append(child)

    # If not all nodes processed → cycle exists
    return result if len(result) == n else []
```

## Dijkstra — shortest path (dist dict pattern)

```python
import heapq
from collections import defaultdict

def dijkstra(n, times, source):
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))

    pq = [(0, source)]
    dist = {}       # node → shortest dist (finalized when first popped)

    while pq:
        cost, node = heapq.heappop(pq)
        if node in dist:   # already finalized — skip
            continue
        dist[node] = cost
        for nei, weight in graph[node]:
            if nei not in dist:
                heapq.heappush(pq, (cost + weight, nei))

    # e.g. LC 743: all nodes reachable?
    return max(dist.values()) if len(dist) == n else -1
```

## BFS on grid with knight moves (boundary guard)

```python
from collections import deque
from dataclasses import dataclass

KNIGHT_MOVES = [(2,1),(2,-1),(-2,1),(-2,-1),(1,2),(1,-2),(-1,2),(-1,-2)]

def knight_shortest_path(source, dest, N=8):
    def is_valid(x, y, visited):
        return 0 <= x < N and 0 <= y < N and (x, y) not in visited

    visited = set([source])
    q = deque([(source, 0)])

    while q:
        (x, y), dist = q.popleft()
        if (x, y) == dest:
            return dist
        for dx, dy in KNIGHT_MOVES:
            nx, ny = x + dx, y + dy
            if is_valid(nx, ny, visited):
                visited.add((nx, ny))
                q.append(((nx, ny), dist + 1))
    return -1
```

## Bipartite check — BFS two-color

```python
from collections import deque

def is_bipartite(graph):
    color = [0] * len(graph)

    def bfs(start):
        q = deque([(start, 1)])
        while q:
            node, c = q.popleft()
            color[node] = c
            for child in graph[node]:
                if color[child] == 0:
                    q.append((child, -c))
                elif color[child] == c:   # same color as parent → not bipartite
                    return False
        return True

    for i in range(len(graph)):
        if color[i] == 0 and not bfs(i):
            return False
    return True

# DFS variant
def is_bipartite_dfs(graph):
    color = [0] * len(graph)

    def dfs(node, c):
        color[node] = c
        for child in graph[node]:
            if color[child] == 0:
                if not dfs(child, -c):
                    return False
            elif color[child] == c:
                return False
        return True

    return all(color[i] != 0 or dfs(i, 1) for i in range(len(graph)))
```

## Union-Find (DSU) — path compression + union by rank

```python
class UnionFind:
    def __init__(self, size):
        self.parent = list(range(size))
        self.rank   = [1] * size
        self.components = size

    def find(self, x):
        if x != self.parent[x]:
            self.parent[x] = self.find(self.parent[x])   # path compression
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False   # already connected
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        self.components -= 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)

    def count_islands(self):
        return len({self.find(i) for i in range(len(self.parent))})
```

## Complexity reference

| Algorithm | Time | Space |
|---|---|---|
| BFS / DFS | O(V + E) | O(V) |
| Dijkstra (min-heap) | O((V + E) log V) | O(V) |
| Topo sort (Kahn's) | O(V + E) | O(V) |
| Union-Find (amortized) | O(α(n)) per op | O(V) |
| Bipartite check | O(V + E) | O(V) |

## When each pattern shows up

- **Kahn's topo** — course schedule, task dependencies, detect cycle in directed graph
- **Dijkstra** — network delay, cheapest flights, path with min cost
- **Union-Find** — number of islands, earliest connected, redundant connection
- **Bipartite** — possible bipartition, is graph two-colorable
- **3-state DFS** — cycle in directed graph, valid tree check
- **Grid BFS** — walls and gates, rotting oranges, shortest path in grid
- **Knight moves BFS** — min-move problems on a board

## Sample problems

<!-- add LeetCode problems here as you solve them -->
