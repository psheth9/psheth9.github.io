---
title: "Trie — Prefix tree"
date: 2026-05-15
category: algo
difficulty: medium
summary: "Insert/search/prefix-check all in O(L) where L is word length. Beats a hash set whenever you need prefix queries or shared-prefix compression."
problem: "Design a data structure that supports insert, search (exact match), and startsWith (prefix check)."
---

## The pattern

Each node holds a map of its children (one per character) and a boolean marking whether a complete word ends there. Walking the tree character by character is all three operations.

## Template

```python
from collections import defaultdict

class TrieNode:
    def __init__(self):
        self.children = defaultdict(TrieNode)
        self.isWord   = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.children[ch]   # defaultdict creates node if missing
        node.isWord = True

    def search(self, word: str) -> bool:
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.isWord             # must end on a word boundary

    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return True                    # don't need isWord here
```

## Complexity

| | |
|---|---|
| Time | O(L) per insert/search/prefix — L = word length |
| Space | O(alphabet × L × n) worst case |

## Key details

- **`search` vs `startsWith`** — the only difference is the final `return`. `search` requires `node.isWord`; `startsWith` just needs to reach the end of the prefix without a miss.
- `defaultdict(TrieNode)` auto-creates child nodes on access, making insert a single clean loop.
- For deletion, walk to the word, unset `isWord`, then prune empty leaf nodes on the way back up.
- For wildcard matching (e.g. `.` matches any char), use DFS/BFS at the `TrieNode` level.

## When this pattern shows up

- Autocomplete / type-ahead search
- Word Search II — build a trie of the word list, then DFS the board
- Replace Words — find shortest root prefix for each word
- Longest word where every prefix is also a word
- Palindrome pairs — store reversed words, query suffix

## Sample problems

<!-- add LeetCode problems here as you solve them -->
