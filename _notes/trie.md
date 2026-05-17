---
title: "Trie — Template & Patterns"
date: 2026-05-16
category: algo
difficulty: medium
summary: "Trie (prefix tree) template: insert, search with wildcards, prefix sum aggregation, and word search patterns."
problem: "A trie is a tree where each path from root to a marked node spells a word. Use it when you need fast prefix lookups or grouping by shared prefix."
---

## TrieNode definition

```python
class TrieNode:
    def __init__(self):
        self.children  = {}      # char → TrieNode
        self.is_end    = False   # marks a complete word
        self.value     = 0       # optional: aggregate value per node
```

---

## Insert and search (LC 208)

```python
class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end

    def startsWith(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True
```

---

## Search with wildcards — `.` matches any char (LC 211)

```python
def search_with_wildcard(word, node):
    for i, ch in enumerate(word):
        if ch == '.':
            return any(
                search_with_wildcard(word[i + 1:], child)
                for child in node.children.values()
            )
        if ch not in node.children:
            return False
        node = node.children[ch]
    return node.is_end
```

---

## Prefix sum aggregation

```python
# Store a numeric value at each inserted word; getSumOfPrefix returns
# the total value of all words that start with the given prefix.

def insert_with_value(word, value, root):
    for ch in word:
        if ch not in root.children:
            root.children[ch] = TrieNode()
        root = root.children[ch]
    root.is_end = True
    root.value  = value

def get_sum_of_prefix(prefix, root):
    for ch in prefix:
        if ch not in root.children:
            return 0
        root = root.children[ch]
    return _subtree_sum(root)

def _subtree_sum(node):
    total = node.value
    for child in node.children.values():
        total += _subtree_sum(child)
    return total
```

---

## Word search on board (LC 79 / 212)

```python
# Build a trie from the word list; DFS on the grid and traverse trie in parallel.
# Prune when the current path prefix doesn't exist in the trie.

def findWords(board, words):
    root = TrieNode()
    for word in words:
        node = root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    rows, cols = len(board), len(board[0])
    result = []

    def dfs(r, c, node, path):
        ch = board[r][c]
        if ch not in node.children:
            return
        next_node = node.children[ch]
        path += ch
        if next_node.is_end:
            result.append(path)
            next_node.is_end = False    # deduplicate

        board[r][c] = '#'              # mark visited
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '#':
                dfs(nr, nc, next_node, path)
        board[r][c] = ch               # restore

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root, "")

    return result
```

---

## Complexity

> **Key insight:** Insert and exact search are O(m) — proportional only to the word length, independent of how many words are stored. Wildcard search degrades to O(26^m) in the worst case when `.` matches every branch.

| Operation | Time | Space | Notes |
|---|---|---|---|
| Insert (one word) | **O(m)** | O(m) new nodes | Shares prefix nodes with existing words |
| Search (exact) | **O(m)** | O(1) | Walk trie; check `is_end` at last node |
| startsWith (prefix check) | **O(m)** | O(1) | Same walk; no `is_end` check |
| Wildcard search (LC 211) | **O(26^m)** worst | O(m) stack | `.` fans out to all children recursively |
| Prefix sum / aggregation | **O(m + S)** | O(1) | m = prefix length; S = subtree size |
| Build trie from W words | **O(W · m)** | O(W · m) | All characters stored |
| Word search on board (LC 212) | **O(R·C · 4^L)** | O(W·m) | Trie pruning makes this far better in practice |

**Variable key:** *m* = word/query length · *W* = number of words · *R/C* = board rows/cols · *L* = max word length · *S* = subtree node count

---

## When this pattern shows up

- **Autocomplete / typeahead** — `startsWith` query
- **Word search / boggle** — prune DFS branches not in trie
- **Replace words** — find shortest root word using `getRoot`
- **XOR maximum** — binary trie (insert binary representations, greedily pick opposite bits)
- **Grouping by prefix** — sum/count under a prefix subtree

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [208](https://leetcode.com/problems/implement-trie-prefix-tree/) | Implement Trie (Prefix Tree) | Medium | Core insert/search/startsWith |
| [211](https://leetcode.com/problems/design-add-and-search-words-data-structure/) | Design Add and Search Words | Medium | Wildcard `.` search |
| [212](https://leetcode.com/problems/word-search-ii/) | Word Search II | Hard | Board DFS + trie pruning |
| [648](https://leetcode.com/problems/replace-words/) | Replace Words | Medium | Find shortest root prefix |
| [421](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/) | Maximum XOR of Two Numbers | Medium | Binary trie; greedy opposite bits |
| [1268](https://leetcode.com/problems/search-suggestions-system/) | Search Suggestions System | Medium | Collect words under prefix node |
| [677](https://leetcode.com/problems/map-sum-pairs/) | Map Sum Pairs | Medium | Value aggregation under prefix |
