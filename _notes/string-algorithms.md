---
title: "String Algorithms — Templates & Patterns"
date: 2026-05-17
category: algo
difficulty: medium
summary: "String algorithm patterns: Rabin-Karp rolling hash for pattern matching, KMP failure function, anagram detection with frequency arrays, and palindrome techniques."
problem: "Most string search problems are O(n·m) brute force. Rolling hash (Rabin-Karp) and the KMP failure function both reduce this to O(n+m) by reusing work from previous comparisons."
---

## 1. Rabin-Karp — rolling hash pattern matching

```python
# Hash the pattern once: O(m).
# Slide a window of size m across the text, maintaining the hash in O(1) per step.
# On hash match, verify character-by-character (collision guard).

def rabinKarp(text, pattern):
    n, m = len(text), len(pattern)
    if m > n:
        return []

    BASE  = 26
    MOD   = 10**9 + 7
    power = pow(BASE, m - 1, MOD)   # BASE^(m-1) mod MOD

    def char_val(c): return ord(c) - ord('a')

    # Compute initial hashes
    pat_hash = text_hash = 0
    for i in range(m):
        pat_hash  = (pat_hash  * BASE + char_val(pattern[i])) % MOD
        text_hash = (text_hash * BASE + char_val(text[i]))    % MOD

    matches = []
    for i in range(n - m + 1):
        if text_hash == pat_hash and text[i:i + m] == pattern:
            matches.append(i)

        if i < n - m:
            # Roll: remove leftmost char, add next char
            text_hash = (text_hash - char_val(text[i]) * power) % MOD
            text_hash = (text_hash * BASE + char_val(text[i + m])) % MOD

    return matches

# rabinKarp("abcabcabc", "abc") → [0, 3, 6]
```

---

## 2. KMP — failure function (prefix table)

```python
# Build the failure function: lps[i] = length of longest proper prefix of
# pattern[0..i] that is also a suffix. This is how far to "fall back"
# when a mismatch occurs, without re-scanning the text.

def kmpSearch(text, pattern):
    def buildLPS(p):
        lps = [0] * len(p)
        length = 0   # length of previous longest prefix-suffix
        i = 1
        while i < len(p):
            if p[i] == p[length]:
                length += 1
                lps[i] = length
                i += 1
            elif length:
                length = lps[length - 1]   # fall back, don't advance i
            else:
                lps[i] = 0
                i += 1
        return lps

    lps = buildLPS(pattern)
    matches = []
    j = 0   # index into pattern

    for i, c in enumerate(text):
        while j > 0 and c != pattern[j]:
            j = lps[j - 1]           # fall back using failure function
        if c == pattern[j]:
            j += 1
        if j == len(pattern):
            matches.append(i - j + 1)
            j = lps[j - 1]

    return matches

# kmpSearch("ababcabcabababd", "ababd") → [10]
```

---

## 3. Anagram detection — frequency array (LC 242 / 438)

```python
# Two strings are anagrams if their character frequencies match.
# Use a fixed-size array (26 for lowercase) — O(1) space vs O(n) for dict.

def isAnagram(s, t):
    if len(s) != len(t): return False
    freq = [0] * 26
    for a, b in zip(s, t):
        freq[ord(a) - ord('a')] += 1
        freq[ord(b) - ord('a')] -= 1
    return all(x == 0 for x in freq)


# Find all anagram start positions in s (LC 438)
def findAnagrams(s, p):
    need = [0] * 26
    for c in p: need[ord(c) - ord('a')] += 1

    window = [0] * 26
    result = []
    m = len(p)

    for i, c in enumerate(s):
        window[ord(c) - ord('a')] += 1
        if i >= m:
            window[ord(s[i - m]) - ord('a')] -= 1
        if i >= m - 1 and window == need:
            result.append(i - m + 1)

    return result
```

---

## 4. Longest palindromic substring — expand around centre (LC 5)

```python
# For each centre (n centres for odd, n-1 for even), expand outward.
# O(n²) time, O(1) space — simpler than Manacher's O(n) algorithm.

def longestPalindrome(s):
    def expand(lo, hi):
        while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
            lo -= 1; hi += 1
        return s[lo + 1:hi]   # last valid range

    best = ""
    for i in range(len(s)):
        odd  = expand(i, i)        # odd-length centre
        even = expand(i, i + 1)   # even-length centre
        if len(odd)  > len(best): best = odd
        if len(even) > len(best): best = even
    return best
```

---

## 5. Valid parentheses / bracket matching (LC 20)

```python
PAIRS = {')': '(', '}': '{', ']': '['}

def isValid(s):
    stack = []
    for c in s:
        if c in '([{':
            stack.append(c)
        elif not stack or stack[-1] != PAIRS[c]:
            return False
        else:
            stack.pop()
    return not stack
```

---

## 6. Encode / decode strings (LC 271)

```python
# Prefix each word with its length and a delimiter: "4#word".
# Handles any characters including the delimiter itself.

def encode(strs):
    return ''.join(f'{len(s)}#{s}' for s in strs)

def decode(s):
    result = []
    i = 0
    while i < len(s):
        j = s.index('#', i)
        length = int(s[i:j])
        result.append(s[j + 1: j + 1 + length])
        i = j + 1 + length
    return result
```

---

## Complexity

> **Key insight:** Rabin-Karp and KMP both achieve O(n + m) — linear in the combined size of text and pattern. Brute force is O(n·m).

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| Brute force search | O(n · m) | O(1) | Every position tries full match |
| Rabin-Karp | **O(n + m)** avg | O(1) | Hash collision → O(n·m) worst |
| KMP | **O(n + m)** | O(m) | `lps` table; no worst case |
| Anagram check | O(n) | O(1) | Fixed 26-char array |
| Find all anagrams | O(n) | O(1) | Sliding window + freq array |
| Longest palindrome (expand) | O(n²) | O(1) | Expand around each centre |
| Valid parentheses | O(n) | O(n) | Stack depth ≤ n |

**Variable key:** *n* = text length · *m* = pattern length

---

## When this pattern shows up

- **Pattern matching** → Rabin-Karp (rolling hash) or KMP (failure function)
- **Anagram / permutation in string** → fixed-size frequency array + sliding window
- **Palindrome** → expand around centres; Manacher for O(n)
- **Balanced brackets** → stack; push open, pop on close
- **String encoding** → length-prefix to handle delimiter collisions

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [28](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) | Find Index of First Occurrence | Easy | KMP or Rabin-Karp |
| [242](https://leetcode.com/problems/valid-anagram/) | Valid Anagram | Easy | Frequency array |
| [438](https://leetcode.com/problems/find-all-anagrams-in-a-string/) | Find All Anagrams | Medium | Sliding window + freq array |
| [5](https://leetcode.com/problems/longest-palindromic-substring/) | Longest Palindromic Substring | Medium | Expand around centres |
| [647](https://leetcode.com/problems/palindromic-substrings/) | Palindromic Substrings | Medium | Count expansions |
| [20](https://leetcode.com/problems/valid-parentheses/) | Valid Parentheses | Easy | Stack push/pop |
| [32](https://leetcode.com/problems/longest-valid-parentheses/) | Longest Valid Parentheses | Hard | Stack tracking indices |
| [271](https://leetcode.com/problems/encode-and-decode-strings/) | Encode and Decode Strings | Medium | Length-prefix encoding |
| [49](https://leetcode.com/problems/group-anagrams/) | Group Anagrams | Medium | Sort or freq tuple as key |
