---
title: "Greedy & Intervals — Templates & Patterns"
date: 2026-05-17
category: algo
difficulty: medium
summary: "Greedy patterns: activity selection, interval scheduling, merge intervals, meeting rooms, and jump game. Sort by end time is the core invariant for interval problems."
problem: "Greedy works when a locally optimal choice leads to a globally optimal solution. For intervals, always sort by end time — finishing earliest leaves the most room for future intervals."
---

## The greedy principle

At each step, make the choice that looks best right now — without reconsidering past decisions. Greedy is correct when the **greedy choice property** holds: a locally optimal choice is always part of a globally optimal solution.

> **Key insight:** For interval scheduling, sort by **end time** (not start time). Picking the interval that finishes earliest always leaves the maximum room for subsequent intervals.

---

## 1. Activity selection / non-overlapping intervals (LC 435)

```python
# Minimum number of intervals to remove so no two overlap.
# = total intervals - maximum non-overlapping set.
# Greedy: sort by end, greedily keep intervals that don't overlap.

def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda x: x[1])   # sort by END time
    count = 0
    end = float('-inf')

    for start, finish in intervals:
        if start >= end:
            end = finish    # take this interval
        else:
            count += 1      # skip (remove) overlapping interval

    return count

# eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]) → 1  (remove [1,3])
```

---

## 2. Merge overlapping intervals (LC 56)

```python
# Sort by start time. Merge current interval into last if they overlap.

def merge(intervals):
    intervals.sort(key=lambda x: x[0])   # sort by START time
    merged = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)   # extend
        else:
            merged.append([start, end])

    return merged

# merge([[1,3],[2,6],[8,10],[15,18]]) → [[1,6],[8,10],[15,18]]
```

---

## 3. Insert interval (LC 57)

```python
def insert(intervals, newInterval):
    result = []
    i, n = 0, len(intervals)

    # Add all intervals that end before new one starts
    while i < n and intervals[i][1] < newInterval[0]:
        result.append(intervals[i]); i += 1

    # Merge all overlapping intervals
    while i < n and intervals[i][0] <= newInterval[1]:
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i += 1
    result.append(newInterval)

    # Append the rest
    result.extend(intervals[i:])
    return result
```

---

## 4. Meeting rooms II — minimum rooms (LC 253)

```python
# Minimum conference rooms = maximum concurrent meetings at any point.
# Two-pointer on sorted start and end times.

def minMeetingRooms(intervals):
    starts = sorted(i[0] for i in intervals)
    ends   = sorted(i[1] for i in intervals)

    rooms = 0
    max_rooms = 0
    j = 0   # pointer into ends

    for i in range(len(intervals)):
        rooms += 1
        if starts[i] >= ends[j]:
            rooms -= 1       # one meeting ended; reuse room
            j += 1
        max_rooms = max(max_rooms, rooms)

    return max_rooms

# minMeetingRooms([[0,30],[5,10],[15,20]]) → 2
```

---

## 5. Jump game I — can reach end? (LC 55)

```python
# Greedy: track the farthest reachable index.
# If you reach a position beyond max_reach, you're stuck.

def canJump(nums):
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
    return True
```

---

## 6. Jump game II — minimum jumps (LC 45)

```python
# Greedy BFS: at each "level" (current jump range), find the farthest
# you can reach in the next jump. Increment jumps per level.

def jump(nums):
    jumps = 0
    current_end = 0   # end of current jump range
    farthest = 0      # farthest reachable from current range

    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:          # exhausted current range
            jumps += 1
            current_end = farthest    # expand to next range

    return jumps

# jump([2,3,1,1,4]) → 2
```

---

## 7. Task scheduler (LC 621)

```python
# Cooldown n between same tasks. Count max-frequency task; idle slots fill gaps.
# Result = max(actual tasks, frame formula)

from collections import Counter
import math

def leastInterval(tasks, n):
    counts = Counter(tasks)
    max_count = max(counts.values())
    max_count_tasks = sum(1 for c in counts.values() if c == max_count)

    # Slots = (max_count - 1) frames of (n+1) each + tasks tied at max
    slots = (max_count - 1) * (n + 1) + max_count_tasks
    return max(slots, len(tasks))

# leastInterval(["A","A","A","B","B","B"], 2) → 8  (A→B→idle→A→B→idle→A→B)
```

---

## 8. Partition labels (LC 763)

```python
# Each letter must appear in only one partition.
# Greedy: extend current partition to cover the last occurrence of every
# letter seen so far. When index reaches the partition end, cut.

def partitionLabels(s):
    last = {c: i for i, c in enumerate(s)}   # last occurrence of each char
    result = []
    start = end = 0

    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            result.append(end - start + 1)
            start = i + 1

    return result

# partitionLabels("ababcbacadefegdehijhklij") → [9,7,8]
```

---

## Complexity

> **Key insight:** Most greedy solutions are O(n log n) because the bottleneck is sorting. The greedy pass itself is O(n).

| Algorithm | Time | Space | Notes |
|---|---|---|---|
| Activity selection (non-overlap) | **O(n log n)** | O(1) | Sort by end; single pass |
| Merge intervals | **O(n log n)** | O(n) | Sort by start; merge pass |
| Insert interval | **O(n)** | O(n) | Input already sorted |
| Meeting rooms II | **O(n log n)** | O(n) | Sort starts + ends separately |
| Jump game I | **O(n)** | O(1) | Track max reach |
| Jump game II | **O(n)** | O(1) | Greedy BFS levels |
| Task scheduler | **O(n)** | O(1) | Counter + formula |
| Partition labels | **O(n)** | O(1) | Last-occurrence map |

---

## When this pattern shows up

- **Interval scheduling** — sort by end time, greedily pick non-overlapping
- **Merge** — sort by start time, extend last interval
- **Room / resource allocation** — two-pointer on sorted starts and ends
- **Reach-farthest** — jump game, gas station, boat to save people
- **Frequency + cooldown** — task scheduler, rearrange string k distance apart
- **Partition** — extend boundary to cover all occurrences

## Problems to try

| # | Problem | Difficulty | Pattern |
|---|---|---|---|
| [435](https://leetcode.com/problems/non-overlapping-intervals/) | Non-overlapping Intervals | Medium | Sort by end; count removals |
| [56](https://leetcode.com/problems/merge-intervals/) | Merge Intervals | Medium | Sort by start; extend |
| [57](https://leetcode.com/problems/insert-interval/) | Insert Interval | Medium | Three-phase scan |
| [252](https://leetcode.com/problems/meeting-rooms/) | Meeting Rooms | Easy | Any overlap → false |
| [253](https://leetcode.com/problems/meeting-rooms-ii/) | Meeting Rooms II | Medium | Two-pointer on sorted starts/ends |
| [55](https://leetcode.com/problems/jump-game/) | Jump Game | Medium | Track max reachable |
| [45](https://leetcode.com/problems/jump-game-ii/) | Jump Game II | Medium | Greedy BFS levels |
| [621](https://leetcode.com/problems/task-scheduler/) | Task Scheduler | Medium | Frame formula |
| [763](https://leetcode.com/problems/partition-labels/) | Partition Labels | Medium | Last-occurrence extension |
| [134](https://leetcode.com/problems/gas-station/) | Gas Station | Medium | Net gas running sum |
