---
title: "Complexity Reference — All Algorithms at a Glance"
date: 2026-05-16
category: algo
difficulty: reference
summary: "One-page cheat sheet of time and space complexity for every algorithm and data structure across all notes: sorting, searching, graphs, trees, dynamic programming, and Python built-ins."
problem: "When you need to quickly verify the complexity of an algorithm before an interview without hunting through individual notes."
---

## Sorting

| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Counting sort | O(n + k) | O(n + k) | O(n + k) | O(k) | Yes |
| Radix sort | O(n · d) | O(n · d) | O(n · d) | O(n + k) | Yes |
| **Python Timsort** | **O(n)** | **O(n log n)** | **O(n log n)** | **O(n)** | **Yes** |

*k = value range · d = number of digits*

---

## Searching

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| Linear search | O(n) | O(1) | Unsorted array |
| Binary search | **O(log n)** | O(1) iterative | Sorted array |
| Binary search recursive | O(log n) | O(log n) | Stack frames |
| Binary search on answer | O(log R · C) | O(1) | R = answer range; C = check cost |
| Interpolation search | O(log log n) avg | O(1) | Uniform distribution only |

---

## Graph algorithms

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| BFS | **O(V + E)** | O(V) | Queue |
| DFS | **O(V + E)** | O(V) | Stack / recursion |
| Grid BFS/DFS | **O(R · C)** | O(R · C) | Each cell visited once |
| Topo sort — DFS | O(V + E) | O(V) | Post-order + reverse |
| Topo sort — Kahn's | O(V + E) | O(V) | In-degree BFS |
| Cycle detection (3-state) | O(V + E) | O(V) | gray = visiting, black = done |
| Bipartite check | O(V + E) | O(V) | 2-coloring |
| Connected components | O(V + E) | O(V) | Count BFS/DFS calls |
| **Dijkstra (min-heap)** | **O((V + E) log V)** | O(V) | No negative edges |
| Bellman-Ford | O(V · E) | O(V) | Handles negative edges |
| Floyd-Warshall | O(V³) | O(V²) | All-pairs shortest path |
| Prim's MST | O((V + E) log V) | O(V) | Similar to Dijkstra |
| Kruskal's MST | O(E log E) | O(V) | Sort edges + Union-Find |

*V = vertices · E = edges · R/C = grid rows/cols*

---

## Union-Find (Disjoint Set Union)

| Operation | Time | Space | Notes |
|---|---|---|---|
| `find(x)` | **O(α(n))** ≈ O(1) | O(1) | Path compression |
| `union(x, y)` | **O(α(n))** ≈ O(1) | O(1) | Union by rank |
| Build (n nodes) | O(n) | O(n) | Initialisation only |
| n union operations | O(n · α(n)) ≈ O(n) | O(n) | — |

*α = inverse Ackermann function (≤ 4 for any real input)*

---

## Tree algorithms

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| DFS traversal | **O(n)** | O(h) | h = height |
| BFS level order | **O(n)** | O(w) | w = max level width |
| LCA | O(n) | O(h) | Post-order pass |
| Validate BST | O(n) | O(h) | Bounds top-down |
| Path sum | O(n) | O(h) | Backtrack on path list |
| Vertical order | O(n) | O(n) | BFS + column map |
| Serialize/deserialize | O(n) | O(n) | BFS, comma-joined |
| Max path sum | O(n) | O(h) | Global `self.ans` |
| **Segment tree build** | **O(n)** | O(n) | 2n array |
| **Segment tree update** | **O(log n)** | O(1) | Propagate to root |
| **Segment tree query** | **O(log n)** | O(1) | Merge partial ranges |

*n = nodes · h = height (O(log n) balanced, O(n) skewed) · w = max width*

---

## Sliding window

| Pattern | Time | Space | Notes |
|---|---|---|---|
| Fixed-size window | **O(n)** | O(1) | Add right, drop left |
| Variable two-pointer | **O(n)** | O(alphabet) | Expand right, shrink left |
| Prefix sum — count (LC 560) | **O(n)** | O(n) | Hash map of prefix counts |
| Prefix sum — max length | **O(n)** | O(n) | First-seen prefix index |
| Subarray product < k | **O(n)** | O(1) | Shrink left while condition fails |
| Monotonic deque (LC 239) | **O(n)** amortized | O(k) | Each element pushed/popped once |

*n = length · k = window size*

---

## Backtracking

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| Subsets | **O(n · 2ⁿ)** | O(n) | 2ⁿ subsets × O(n) copy |
| Permutations | **O(n · n!)** | O(n) | n! leaves × O(n) copy |
| Combination Sum I (reuse) | **O(2^(t/min))** | O(t/min) | Unbounded branches |
| Combination Sum II | O(2ⁿ) | O(n) | Each element in/out |
| Generate parentheses | O(4ⁿ/√n) | O(n) | Catalan number |
| Palindrome partition | O(n · 2ⁿ) | O(n) | 2^(n−1) splits |
| N-Queens | **O(n!)** | O(n) | Col + diagonal pruning |
| Target sum | O(2ⁿ) | O(n) | +/− branch per element |

*n = input length · t = target · min = smallest candidate*

---

## Trie

| Operation | Time | Space | Notes |
|---|---|---|---|
| Insert (one word) | **O(m)** | O(m) new nodes | Shares prefix nodes |
| Search / startsWith | **O(m)** | O(1) | Walk and check `is_end` |
| Wildcard search | O(26^m) worst | O(m) stack | `.` fans all children |
| Build trie (W words) | O(W · m) | O(W · m) | Total characters stored |
| Word search on board | O(R·C · 4^L) | O(W·m) | Trie prunes dead branches |

*m = word length · W = word count · R/C = board size · L = max length*

---

## Dynamic programming (common patterns)

| Pattern | Time | Space | Notes |
|---|---|---|---|
| 1D DP (Fibonacci, climb stairs) | **O(n)** | O(1) rolling | — |
| 2D DP (grid, edit distance) | **O(m · n)** | O(m · n) | Can reduce to O(min(m,n)) |
| Knapsack 0/1 | **O(n · W)** | O(W) | Rolling array optimisation |
| Longest common subsequence | O(m · n) | O(m · n) or O(n) | — |
| Longest increasing subsequence | **O(n log n)** | O(n) | Patience sorting / bisect |
| Coin change | O(n · amount) | O(amount) | BFS or DP |
| Count bits (LC 338) | **O(n)** | O(n) | `dp[i] = dp[i>>1] + (i&1)` |
| Matrix chain multiplication | O(n³) | O(n²) | Interval DP |

*n/m = input dimensions · W = knapsack capacity*

---

## Python data structures

| Structure / Operation | Time | Space | Notes |
|---|---|---|---|
| `list.append` / `list.pop()` | **O(1)** amortized | — | `pop(i)` is O(n) |
| `list.sort()` / `sorted()` | O(n log n) | O(n) | Timsort; stable |
| `heapq.heapify` | **O(n)** | O(1) | Bottom-up; not O(n log n) |
| `heapq.heappush` / `heappop` | O(log n) | O(1) | — |
| `heapq.nlargest(k)` | O(n log k) | O(k) | Use when k ≪ n |
| `deque.append` / `popleft` | **O(1)** | — | Both ends constant time |
| `dict` / `defaultdict` get/set | **O(1)** avg | O(n) | O(n) worst on collision |
| `Counter(iterable)` | O(n) | O(k) | k = distinct elements |
| `Counter.most_common(k)` | O(n log k) | O(k) | Partial sort |
| `OrderedDict.move_to_end` | **O(1)** | — | Doubly-linked list |
| `SortedDict` insert/delete | **O(log n)** | O(n) | sortedcontainers B-tree |
| `SortedDict.bisect_left/right` | O(log n) | O(1) | Floor/ceil lookup |
| `bisect.bisect_left/right` | O(log n) | O(1) | On sorted list |
| `bisect.insort` | O(n) | O(1) | Shift cost dominates insert |
| `set` add / lookup / remove | **O(1)** avg | O(n) | Hash-based |

---

## Complexity class cheat sheet

| Complexity | Name | Grows how fast for n=1000 |
|---|---|---|
| O(1) | Constant | 1 op |
| O(log n) | Logarithmic | ~10 ops |
| O(n) | Linear | 1 000 ops |
| O(n log n) | Linearithmic | ~10 000 ops |
| O(n²) | Quadratic | 1 000 000 ops |
| O(n³) | Cubic | 10⁹ ops — borderline |
| O(2ⁿ) | Exponential | > 10³⁰⁰ — only feasible n ≤ 30 |
| O(n!) | Factorial | unfeasible past n = 12 |

> Rule of thumb: n ≤ 20 → exponential OK · n ≤ 500 → O(n²) OK · n ≤ 10⁵ → O(n log n) OK · n ≤ 10⁷ → O(n) OK
