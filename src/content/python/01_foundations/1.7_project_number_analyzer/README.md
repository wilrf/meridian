# Number Analyzer

## Overview

Build a program that analyzes a series of numbers, providing statistics relevant to financial data. This project ties together everything from Phase 1: variables, types, operators, control flow, and loops.

---

## The Challenge

You're given 30 days of stock prices. Build a complete analysis tool that answers these questions:

```python
# Your data
prices = [
    152.30, 154.20, 151.80, 155.60, 158.90, 157.20, 159.80, 162.40, 160.50, 163.20,
    165.80, 164.30, 166.90, 168.20, 165.50, 163.80, 167.40, 170.20, 172.50, 169.80,
    171.30, 174.60, 173.20, 176.80, 175.40, 178.90, 177.50, 180.20, 182.60, 179.30
]
```

---

## Requirements

### Part 1: Basic Statistics

Calculate these metrics **without using built-in functions** like `sum()`, `min()`, `max()`, or `len()`:

- Total count of prices
- Sum of all prices
- Minimum and maximum prices
- Average (mean) price
- Price range (max - min)

> **Hint**: You'll need to initialize tracking variables before looping through the data.

---

### Part 2: Daily Changes

Analyze the day-over-day price movements:

- Calculate each day's change (today's price minus yesterday's)
- Count how many days were "up" (positive change), "down" (negative), and "flat" (no change)
- Find the biggest single-day gain and loss
- Calculate the average daily change

---

### Part 3: Streak Detection

Find patterns in the price movements:

- Identify the longest consecutive "winning streak" (days in a row with positive changes)
- Identify the longest consecutive "losing streak" (days in a row with negative changes)

> **Hint**: You'll need to track the current streak and compare it to the longest found so far.

---

### Part 4: Anomaly Detection

Flag unusual price movements:

- Calculate the average *absolute* daily change (ignore positive/negative, just magnitude)
- Define "unusual" as any day where the change exceeds 2x the average absolute change
- Report which days had unusual movements and in which direction

---

### Part 5: Investment Summary

Generate a final report that includes:

- Starting and ending prices
- Total return (in dollars and percentage)
- Trend analysis: Compare the average of the last 5 days to the overall average
  - BULLISH if recent average is more than 5% above overall
  - BEARISH if recent average is more than 5% below overall
  - NEUTRAL otherwise
- Win rate (percentage of days that were positive)
- A simple recommendation based on your analysis

---

## Output Format

Your program should produce a formatted report. Design your own layout, but make sure it's readable and includes all the metrics above.

---

## Challenge Extensions

If you finish early:

1. **Moving Average**: Calculate a 5-day moving average and identify when price crosses above/below it
2. **Volatility**: Calculate standard deviation (measure of how spread out the values are)
3. **User Input**: Let users enter their own prices instead of using hardcoded data

---

## What You're Practicing

- Variables and assignment
- Arithmetic and comparison operators
- Control flow (if/elif/else)
- Loops and iteration
- Accumulator patterns
- Index tracking
- String formatting
- Algorithm design

---

## When You're Done

Compare your output to your own manual calculations for a few metrics to verify correctness. There's no single "right" output format—focus on accuracy and clarity.
