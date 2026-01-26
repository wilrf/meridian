# Project 1.7: Number Analyzer

## Overview

Build a program that analyzes a series of numbers, providing statistics relevant to financial data. This project ties together everything from Phase 1: variables, types, operators, control flow, and loops.

---

## What You'll Build

A program that:
1. Takes a list of numbers (simulating daily stock prices)
2. Calculates statistical measures
3. Identifies patterns and anomalies
4. Provides a summary report

---

## Part 1: Basic Statistics

Start with the sample data below:

```python
# Sample data: 30 days of stock prices
prices = [
    152.30, 154.20, 151.80, 155.60, 158.90, 157.20, 159.80, 162.40, 160.50, 163.20,
    165.80, 164.30, 166.90, 168.20, 165.50, 163.80, 167.40, 170.20, 172.50, 169.80,
    171.30, 174.60, 173.20, 176.80, 175.40, 178.90, 177.50, 180.20, 182.60, 179.30
]

# TODO: Calculate the following (without using built-in sum, min, max, len)
# 1. Count of prices
# 2. Sum of all prices
# 3. Minimum price
# 4. Maximum price
# 5. Average (mean) price
# 6. Price range (max - min)

# Hint: Initialize variables before the loop
count = 0
total = 0
minimum = prices[0]  # Start with first price
maximum = prices[0]

for price in prices:
    # Your code here
    pass

# Print results with proper formatting
print("=" * 40)
print("BASIC STATISTICS")
print("=" * 40)
# print(f"Count: {count}")
# ... etc
```

---

## Part 2: Daily Changes

Add analysis of day-to-day changes:

```python
# TODO: Calculate daily changes (today's price - yesterday's price)
daily_changes = []

for i in range(1, len(prices)):
    change = prices[i] - prices[i-1]
    daily_changes.append(change)
    # Or using enumerate:
    # for i, price in enumerate(prices[1:], start=1):
    #     change = price - prices[i-1]

# Calculate:
# 1. Number of "up" days (positive change)
# 2. Number of "down" days (negative change)
# 3. Number of flat days (no change)
# 4. Biggest single-day gain
# 5. Biggest single-day loss
# 6. Average daily change

up_days = 0
down_days = 0
flat_days = 0

for change in daily_changes:
    if change > 0:
        # Your logic
        pass
    elif change < 0:
        pass
    else:
        pass

print("\n" + "=" * 40)
print("DAILY CHANGES")
print("=" * 40)
# Print your results
```

---

## Part 3: Streak Detection

Find winning and losing streaks:

```python
# TODO: Find the longest winning streak (consecutive up days)
# and longest losing streak (consecutive down days)

current_streak = 0
streak_type = None  # "up" or "down"
longest_up_streak = 0
longest_down_streak = 0

for change in daily_changes:
    if change > 0:
        if streak_type == "up":
            current_streak += 1
        else:
            streak_type = "up"
            current_streak = 1
        if current_streak > longest_up_streak:
            longest_up_streak = current_streak
    elif change < 0:
        # Similar logic for down streaks
        pass
    else:
        # Flat day breaks the streak
        streak_type = None
        current_streak = 0

print("\n" + "=" * 40)
print("STREAK ANALYSIS")
print("=" * 40)
print(f"Longest winning streak: {longest_up_streak} days")
print(f"Longest losing streak: {longest_down_streak} days")
```

---

## Part 4: Anomaly Detection

Identify unusual price movements:

```python
# TODO: Find days with "unusual" movements
# Definition: daily change > 2x the average absolute daily change

# First, calculate average absolute daily change
total_abs_change = 0
for change in daily_changes:
    if change < 0:
        total_abs_change += -change  # Make positive
    else:
        total_abs_change += change
# Or: total_abs_change = sum(abs(c) for c in daily_changes)

avg_abs_change = total_abs_change / len(daily_changes)
threshold = avg_abs_change * 2

print("\n" + "=" * 40)
print("ANOMALY DETECTION")
print("=" * 40)
print(f"Average absolute daily change: ${avg_abs_change:.2f}")
print(f"Anomaly threshold: ${threshold:.2f}")
print("\nUnusual movements:")

for i, change in enumerate(daily_changes):
    if change > threshold or change < -threshold:
        day = i + 1  # Day number (1-indexed)
        direction = "up" if change > 0 else "down"
        print(f"  Day {day}: ${change:+.2f} ({direction})")
```

---

## Part 5: Summary Report

Combine everything into a formatted report:

```python
# Generate a final summary with investment recommendation

print("\n" + "=" * 40)
print("INVESTMENT SUMMARY")
print("=" * 40)

# Calculate total return
total_return = prices[-1] - prices[0]
percent_return = (total_return / prices[0]) * 100

print(f"Starting price: ${prices[0]:.2f}")
print(f"Ending price: ${prices[-1]:.2f}")
print(f"Total return: ${total_return:+.2f} ({percent_return:+.2f}%)")

# Simple trend analysis
recent_avg = 0
for price in prices[-5:]:  # Last 5 days
    recent_avg += price
recent_avg /= 5

overall_avg = total / count  # From Part 1

if recent_avg > overall_avg * 1.05:
    trend = "BULLISH (recent prices above average)"
elif recent_avg < overall_avg * 0.95:
    trend = "BEARISH (recent prices below average)"
else:
    trend = "NEUTRAL (recent prices near average)"

print(f"Trend: {trend}")

# Win/loss ratio
win_rate = up_days / len(daily_changes) * 100
print(f"Win rate: {win_rate:.1f}% of days were positive")

# Recommendation
if percent_return > 10 and win_rate > 55:
    recommendation = "STRONG BUY"
elif percent_return > 5 and win_rate > 50:
    recommendation = "BUY"
elif percent_return < -10:
    recommendation = "SELL"
elif percent_return < -5:
    recommendation = "WATCH"
else:
    recommendation = "HOLD"

print(f"\nRecommendation: {recommendation}")
```

---

## Challenge Extensions

If you finish early, try these enhancements:

### Extension 1: Moving Average
Calculate a 5-day moving average and identify "golden cross" / "death cross" (when price crosses above/below the moving average).

### Extension 2: Volatility Measure
Calculate standard deviation (measure of volatility):
```
variance = sum((x - mean)^2 for each x) / count
std_dev = variance ** 0.5
```

### Extension 3: Interactive Input
Replace the hardcoded prices list with user input:
```python
prices = []
print("Enter prices (one per line, empty line to finish):")
while True:
    user_input = input()
    if user_input == "":
        break
    prices.append(float(user_input))
```

---

## What You've Practiced

- Variables and assignment
- Numeric types (int, float) and their precision
- Arithmetic and comparison operators
- Control flow (if/elif/else)
- Loops (for, while)
- Accumulator patterns (building up results in a loop)
- Index tracking and range
- String formatting with f-strings
- Basic algorithm design

---

## Sample Output

```
========================================
BASIC STATISTICS
========================================
Count: 30
Sum: $5,073.40
Minimum: $151.80
Maximum: $182.60
Average: $169.11
Range: $30.80

========================================
DAILY CHANGES
========================================
Up days: 19
Down days: 10
Flat days: 0
Biggest gain: +$4.20
Biggest loss: -$3.50
Average daily change: +$0.93

========================================
STREAK ANALYSIS
========================================
Longest winning streak: 4 days
Longest losing streak: 2 days

========================================
ANOMALY DETECTION
========================================
Average absolute daily change: $2.15
Anomaly threshold: $4.30
Unusual movements:
  Day 5: +$3.30 (up)

========================================
INVESTMENT SUMMARY
========================================
Starting price: $152.30
Ending price: $179.30
Total return: +$27.00 (+17.73%)
Trend: BULLISH (recent prices above average)
Win rate: 65.5% of days were positive

Recommendation: STRONG BUY
```

---

## Next Phase

Congratulations! You've completed Phase 1. You now understand how Python executes code, stores data, makes decisions, and repeats operations.

In Phase 2, you'll learn to organize complexity: **lists, dictionaries, functions, and objects**—the building blocks of larger programs.
