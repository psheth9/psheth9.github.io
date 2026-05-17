---
title: "Python Best Practices — Competitive / Interview Cheatsheet"
date: 2026-05-16
category: algo
difficulty: reference
summary: "Comprehensive snippets covering sorted/cmp, heapq, deque, defaultdict, Counter, SortedDict, dataclass, walrus operator, division gotchas, and backtracking duplicate pruning."
problem: "One-stop reference for Python patterns that come up repeatedly in coding problems and system design implementations."
---

## sorted() with key and cmp

```python
from functools import cmp_to_key

nums = [3, 1, 2]

# key= (preferred): sort by absolute value
nums.sort(key=lambda x: abs(x))

# cmp= style (when you need pairwise comparison)
def compare(a, b):
    return (a > b) - (a < b)   # -1 / 0 / 1

nums.sort(key=cmp_to_key(compare))

# Multi-key sort: primary asc, secondary desc
pairs = [(1, 3), (1, 2), (2, 1)]
pairs.sort(key=lambda x: (x[0], -x[1]))
```

## heapq — min heap (default) and max heap

```python
import heapq

# ── Min heap ──────────────────────────────────
h = [34, 2, 1]
heapq.heapify(h)          # O(n), in-place

heapq.heappush(h, 0)
x = heapq.heappop(h)      # always returns smallest

top3_large  = heapq.nlargest(3, h)
top3_small  = heapq.nsmallest(3, h)

# ── Max heap: negate values ───────────────────
max_heap = []
heapq.heappush(max_heap, -10)
heapq.heappush(max_heap, -5)
largest = -heapq.heappop(max_heap)   # 10

# ── Heap with (priority, value) tuples ────────
# When priorities tie, Python falls back to the 2nd element
pq = []
heapq.heappush(pq, (1, "task_a"))
heapq.heappush(pq, (1, "task_b"))   # "task_a" pops first (lex)
heapq.heappush(pq, (2, "task_c"))
print(heapq.heappop(pq))            # (1, 'task_a')

# ── Top-K frequent using heap ─────────────────
from collections import Counter

def topKFrequent(nums, k):
    cnt = Counter(nums)
    return heapq.nlargest(k, cnt.keys(), key=lambda x: cnt[x])
```

## deque — stack and queue

```python
from collections import deque

dq = deque()

# Queue (FIFO)
dq.append(1)       # push right
dq.append(2)
dq.popleft()       # pop left → 1

# Stack (LIFO)
dq.append(10)
dq.pop()           # pop right → 10

# Fixed-size sliding window
window = deque(maxlen=3)
for x in [1, 2, 3, 4, 5]:
    window.append(x)   # auto-evicts oldest when full

# BFS template
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
```

## defaultdict — various value types

```python
from collections import defaultdict

# Default int (counter)
freq = defaultdict(int)
for ch in "hello":
    freq[ch] += 1

# Default list (adjacency list / grouping)
graph = defaultdict(list)
graph["a"].append("b")

# Default set
groups = defaultdict(set)
groups["even"].add(2)

# Default with fixed starting value
counter_map = defaultdict(lambda: 5)
print(counter_map["missing"])   # 5

# Nested defaultdict
nested = defaultdict(lambda: defaultdict(int))
nested["row"]["col"] += 1
```

## defaultdict with dataclass

```python
from dataclasses import dataclass, field
from collections import defaultdict
from typing import Dict
import json

@dataclass
class Person:
    id: int = 0
    name: str = ""
    friend: Dict[str, str] = field(default_factory=dict)
    connections: list = field(default_factory=list)

# Load JSON string directly into dataclass
raw = '{"id": 1, "name": "Alice", "friend": {}, "connections": ["2"]}'
person = Person(**json.loads(raw))

# defaultdict where missing keys create empty Person instances
person_map = defaultdict(lambda: Person())
p1 = person_map[1]
p1.name = "Alice"
```

## OrderedDict

```python
from collections import OrderedDict

od = OrderedDict()
od["a"] = 1
od["b"] = 2
od["c"] = 3

od.move_to_end("a")           # move to last
od.move_to_end("c", last=False)  # move to first

# LRU Cache pattern
class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)
```

## Counter — operations

```python
from collections import Counter

c1 = Counter({"a": 3, "b": 2, "c": 1})
c2 = Counter({"b": 1, "c": 2, "d": 3})

c1 + c2   # union (sum)        → Counter({'d':3,'a':3,'b':3,'c':3})
c1 - c2   # subtract (drop ≤0) → Counter({'a':3,'b':1})
c1 & c2   # intersection (min) → Counter({'b':1,'c':1})
c1 | c2   # union (max)        → Counter({'a':3,'d':3,'c':2,'b':2})

# Most common
c = Counter("abracadabra")
print(c.most_common(2))   # [('a', 5), ('b', 2)]

# Count characters
freq = Counter("hello world")
print(freq["l"])   # 3
```

## SortedDict — Treemap equivalent

```python
from sortedcontainers import SortedDict

sd = SortedDict({1: "aa", 3: "bb", 5: "cc"})

sd.peekitem(0)    # (1, 'aa')  — minimum
sd.peekitem(-1)   # (5, 'cc')  — maximum

def floor_key(sd: SortedDict, key):
    """Largest key ≤ key, or None."""
    idx = sd.bisect_right(key) - 1
    return sd.peekitem(idx) if idx >= 0 else None

def ceil_key(sd: SortedDict, key):
    """Smallest key ≥ key, or None."""
    idx = sd.bisect_left(key)
    return sd.peekitem(idx) if idx < len(sd) else None

floor_key(sd, 2)   # (1, 'aa')
ceil_key(sd, 4)    # (5, 'cc')
```

## Division gotchas

```python
# Floor division — rounds toward -infinity
print(-6 // 4)        # -2   (not -1!)

# Truncation toward zero
import math
print(math.trunc(-6 / 4))   # -1
print(int(-6 / 4))           # -1

# Safe integer division (truncate like C/Java)
def trunc_div(a, b):
    return int(a / b)

# Ceiling division without math.ceil
def ceil_div(a, b):
    return -(-a // b)
```

## Walrus operator (:=)

```python
# Assign and test in one expression (Python 3.8+)
import re

# Without walrus
m = re.search(r"\d+", "abc123")
if m:
    print(m.group())

# With walrus
if m := re.search(r"\d+", "abc123"):
    print(m.group())

# In a while loop
import sys
while chunk := sys.stdin.read(1024):
    process(chunk)

# Return max+1 if max is nonzero, else -1
d = {"a": 3, "b": 0}
result = maxi + 1 if (maxi := max(d.values())) else -1
```

## Binary representation and bit tricks

```python
x = 5
binary = bin(x)[2:]         # '101'  — slice off '0b' prefix
set_bits = binary.count("1")  # 2

# Bit operations
x & 1          # check last bit (odd/even)
x >> 1         # right shift (floor div by 2)
x << 1         # left shift  (mul by 2)
x & (x - 1)   # clear lowest set bit
x & (-x)       # isolate lowest set bit

# Count set bits (Brian Kernighan)
def count_bits(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count
```

## Char frequency array (ord trick)

```python
s = "abc"
freq = [0] * 26
for ch in s:
    freq[ord(ch) - ord('a')] += 1

# Check anagram
def is_anagram(s, t):
    return Counter(s) == Counter(t)

# Or with array
def is_anagram_array(s, t):
    arr = [0] * 26
    for a, b in zip(s, t):
        arr[ord(a) - ord('a')] += 1
        arr[ord(b) - ord('a')] -= 1
    return all(x == 0 for x in arr)
```

## Global state in recursion (self.var pattern)

```python
class Solution:
    def maxPathSum(self, root):
        self.ans = float('-inf')   # mutable via self, survives recursion frames

        def dfs(node):
            if not node:
                return 0
            left  = max(dfs(node.left), 0)
            right = max(dfs(node.right), 0)
            self.ans = max(self.ans, node.val + left + right)
            return node.val + max(left, right)

        dfs(root)
        return self.ans
```

## Backtracking — skip duplicates

```python
def combinationSum2(nums, target):
    nums.sort()   # MUST sort first
    result = []

    def backtrack(path, start, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(nums)):
            if remaining - nums[i] < 0:
                break
            # Skip duplicates at the same recursion level
            # i > start (not i > 0) ensures we keep first branch
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            backtrack(path, i + 1, remaining - nums[i])
            path.pop()

    backtrack([], 0, target)
    return result
```

## Sample problems

<!-- add LeetCode problems here as you solve them -->
