---
title: "Bit Manipulation — Templates & Patterns"
date: 2026-05-17
category: algo
difficulty: medium
summary: "Bit manipulation patterns: K-th bit ops, count set bits (Kernighan), DP bit count, XOR for single number, bitmap uniqueness, sum without +, and power checks."
problem: "Bit tricks replace O(n) loops with O(1) or O(k) operations by exploiting binary representation. The core insight: `n & (n-1)` strips the lowest set bit — loop over it to count or clear bits."
---

## 1. Cheat sheet — basic K-th bit operations

```python
# All operations are O(1). k is 0-indexed from the right.

def bit_ops(x, k):
    mask = 1 << k
    check  = x & mask          # non-zero if bit k is set
    set_b  = x | mask          # set bit k to 1
    clear  = x & ~mask         # set bit k to 0
    toggle = x ^ mask          # flip bit k
    return check, set_b, clear, toggle

# Lowest set bit tricks
def last_set_bit(x):
    return x & -x              # isolates the lowest 1-bit  (e.g. 12→4)

def strip_last_set_bit(x):
    return x & (x - 1)        # clears the lowest 1-bit    (e.g. 12→8)

def is_power_of_two(x):
    return x > 0 and (x & (x - 1)) == 0   # power of 2 has exactly one bit

# XOR identity: a ^ a = 0, a ^ 0 = a
# Swap without temp:  a ^= b; b ^= a; a ^= b
```

---

## 2. Count set bits — Brian Kernighan O(k)

```python
# Each iteration strips the lowest set bit → only k iterations where k = popcount.
# Python has bin(n).count('1') and n.bit_count() (3.10+) but knowing the manual
# version is useful for interview explanations.

def count_set_bits(n):
    count = 0
    while n:
        n &= n - 1        # strip lowest set bit
        count += 1
    return count

# count_set_bits(15)  → 4  (1111)
# count_set_bits(12)  → 2  (1100)
```

---

## 3. Count bits from 0 to n — DP O(n) (LC 338)

```python
# dp[i] = number of 1-bits in i.
# Key recurrence: dp[i] = dp[i >> 1] + (i & 1)
# i >> 1 shifts off the last bit (which we already computed); add 1 if last bit is set.

def countBits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp

# countBits(5) → [0, 1, 1, 2, 1, 2]
# Alternative recurrence: dp[i] = dp[i & (i-1)] + 1
# (strip lowest set bit, add 1 for that bit)
```

---

## 4. XOR patterns — single number (LC 136 / 137 / 260)

```python
# XOR properties: a ^ a = 0, a ^ 0 = a, XOR is commutative + associative.
# XOR all elements: duplicates cancel, leaving the singleton.

# LC 136 — every element appears twice except one
def singleNumber(nums):
    result = 0
    for n in nums:
        result ^= n
    return result

# LC 137 — every element appears three times except one
# Use 32-bit counter: for each bit position, count 1s mod 3.
def singleNumberII(nums):
    result = 0
    for i in range(32):
        bit_sum = sum((n >> i) & 1 for n in nums) % 3
        if bit_sum:
            result |= (bit_sum << i)
    return result if result < (1 << 31) else result - (1 << 32)

# LC 260 — two numbers appear once, all others twice
def singleNumberIII(nums):
    xor = 0
    for n in nums: xor ^= n           # xor = a ^ b (the two singletons)

    diff_bit = xor & -xor              # isolate any bit where a and b differ
    a = 0
    for n in nums:
        if n & diff_bit:               # partition: only one singleton has this bit
            a ^= n
    return [a, xor ^ a]
```

---

## 5. Bitmap for character uniqueness and palindrome check

```python
# Replace a set/Counter with a single int when alphabet is small (≤ 64 chars).

def is_unique_chars(text):
    bitmap = 0
    for ch in text:
        n = ord(ch) - ord('a')
        if bitmap & (1 << n):          # already seen
            return False
        bitmap |= (1 << n)
    return True

# Palindrome permutation: at most one character can have an odd count.
# XOR toggles each character's bit; at end, ≤1 bit set ⟺ valid palindrome perm.
def is_palindrome_permutation(text):
    bitmap = 0
    for ch in text:
        bitmap ^= (1 << (ord(ch) - ord('a')))
    return bitmap == 0 or (bitmap & (bitmap - 1)) == 0   # 0 or 1 bit set

# is_palindrome_permutation("aaccf") → True  (can form "acfca")
# is_palindrome_permutation("abc")   → False
```

---

## 6. Sum of two integers without + (LC 371)

```python
# Half-adder: sum = a XOR b (bits with no carry); carry = (a AND b) << 1.
# Repeat until carry = 0.

def getSum(a, b):
    MASK = 0xFFFFFFFF          # 32-bit mask
    MAX  = 0x7FFFFFFF          # max positive 32-bit int
    while b & MASK:
        carry = (a & b) << 1
        a = a ^ b
        b = carry
    # In Python, ints are unbounded — sign-extend the result
    return a if a <= MAX else ~(a ^ MASK)
```

---

## 7. Reverse bits (LC 190)

```python
def reverseBits(n):
    result = 0
    for _ in range(32):
        result = (result << 1) | (n & 1)
        n >>= 1
    return result

# reverseBits(0b00000010100101000001111010011100) → 964176192
```

---

## Complexity

> **Key insight:** `n & (n-1)` strips the lowest set bit — loop over it k times where k = popcount, not 32. For per-bit-position work, 32 iterations is O(1) since the bit-width is constant.

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| K-th bit ops | **O(1)** | O(1) | Single mask operation |
| Count set bits (Kernighan) | **O(k)** | O(1) | k = number of 1-bits |
| Count bits 0..n (DP) | **O(n)** | O(n) | `dp[i] = dp[i>>1] + (i&1)` |
| Single number I | **O(n)** | O(1) | XOR all; duplicates cancel |
| Single number III | **O(n)** | O(1) | Partition by differing bit |
| Palindrome permutation | **O(n)** | O(1) | XOR bitmap; check ≤1 bit set |
| Sum without + | **O(1)** | O(1) | At most 32 iterations |
| Reverse bits | **O(1)** | O(1) | Fixed 32 iterations |

**Variable key:** *n* = input length · *k* = number of set bits

---

## When this pattern shows up

- **Unique / missing element** → XOR to cancel duplicates
- **Count characters without extra space** → bitmap (int) instead of dict
- **Check palindrome permutation** → XOR bitmap; 0 or 1 bit set at end
- **Power-of-two check** → `n & (n-1) == 0`
- **Strip lowest set bit** → `n & (n-1)` for Kernighan's count
- **K-th bit** → `1 << k` as mask; combine with `&`, `|`, `^`, `~`
- **DP on bits** → `dp[i] = dp[i>>1] + (i&1)` propagates from half

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [136](https://leetcode.com/problems/single-number/) | Single Number | Easy | XOR all — duplicates cancel |
| [137](https://leetcode.com/problems/single-number-ii/) | Single Number II | Medium | 32-bit counter mod 3 |
| [260](https://leetcode.com/problems/single-number-iii/) | Single Number III | Medium | Partition by differing bit |
| [338](https://leetcode.com/problems/counting-bits/) | Counting Bits | Easy | DP: `dp[i] = dp[i>>1] + (i&1)` |
| [371](https://leetcode.com/problems/sum-of-two-integers/) | Sum of Two Integers | Medium | XOR + carry loop |
| [190](https://leetcode.com/problems/reverse-bits/) | Reverse Bits | Easy | Shift + OR 32 times |
| [191](https://leetcode.com/problems/number-of-1-bits/) | Number of 1 Bits | Easy | Kernighan `n & (n-1)` |
| [268](https://leetcode.com/problems/missing-number/) | Missing Number | Easy | XOR with indices |
| [287](https://leetcode.com/problems/find-the-duplicate-number/) | Find the Duplicate Number | Medium | Floyd's cycle (alt: bit count) |
| [201](https://leetcode.com/problems/bitwise-and-of-numbers-range/) | Bitwise AND of Numbers Range | Medium | Find common prefix bits |
| [318](https://leetcode.com/problems/maximum-product-of-word-lengths/) | Maximum Product of Word Lengths | Medium | Bitmask per word; `mask & mask == 0` |
