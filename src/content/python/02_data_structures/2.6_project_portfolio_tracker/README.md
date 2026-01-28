# Project 2.6: Portfolio Tracker

## Overview

Build a complete portfolio tracking system using classes. This project ties together lists, dictionaries, functions, and object-oriented programming into a cohesive application.

---

## The Challenge

Create a portfolio management system that tracks stock positions, records transactions, calculates performance metrics, and generates reports.

---

## Requirements

### Part 1: The Stock Class

Build a `Stock` class that represents a position in a single stock. It should:

**Store this data:**
- Stock symbol (e.g., "AAPL")
- Number of shares owned
- Total cost basis (what you paid)
- Current price
- Transaction history

**Provide these capabilities:**
- `buy(shares, price)` - Record a purchase, update shares and cost basis
- `sell(shares, price)` - Record a sale, calculate realized gain/loss using average cost method
- Calculate average cost per share
- Calculate current market value
- Calculate unrealized gain/loss (both dollars and percentage)

**Handle these edge cases:**
- Can't sell more shares than you own
- Prices and shares must be positive
- Division by zero when calculating averages

> **Hint**: Use properties (`@property`) for calculated values like `market_value` and `unrealized_gain`.

---

### Part 2: The Portfolio Class

Build a `Portfolio` class that manages multiple stock positions. It should:

**Store this data:**
- Portfolio name
- Cash balance
- Dictionary of Stock positions (keyed by symbol)
- Total realized gains from closed positions

**Provide these capabilities:**
- `deposit(amount)` / `withdraw(amount)` - Manage cash
- `buy(symbol, shares, price)` - Buy shares (creates position if new, deducts cash)
- `sell(symbol, shares, price)` - Sell shares (adds to cash, tracks realized gains)
- `update_price(symbol, price)` - Update current price for a holding
- Calculate total portfolio value (cash + all holdings)
- Calculate total unrealized gains across all positions
- Get allocation percentages for each holding
- Find best and worst performing positions
- Generate a summary report

**Handle these edge cases:**
- Can't buy if insufficient cash
- Can't sell stock you don't own
- Remove position from holdings when fully sold

---

### Part 3: Price Service (Simulated)

Build a `PriceService` class that simulates fetching current prices:

- Store base prices for several symbols
- `get_price(symbol)` returns the price with small random variation (±2%)
- `get_prices(symbols)` returns prices for multiple symbols at once

This simulates what you'd get from a real API.

---

### Part 4: Main Application

Create a `main.py` that demonstrates your system:

1. Create a portfolio with starting cash
2. Make several buy transactions across different stocks
3. Update prices using the price service
4. Make a sell transaction
5. Print a comprehensive portfolio summary

---

## Design Considerations

Think about:

- **Encapsulation**: Which attributes should be private (prefixed with `_`)?
- **Validation**: Where should you check for invalid inputs?
- **Separation of concerns**: Each class should have one clear responsibility
- **Readable output**: Format currency with commas and 2 decimal places

---

## Challenge Extensions

1. **Persistence**: Add `to_json()` and `from_json()` methods to save/load portfolio state
2. **Transaction Log**: Add a method to display full transaction history with timestamps
3. **Rebalancing**: Add a method that calculates trades needed to reach target allocations
4. **Multiple Accounts**: Support different account types (taxable, retirement) with different realized gain tracking

---

## What You're Practicing

- Object-oriented design (classes, properties, methods)
- Composition (Portfolio contains Stocks)
- Encapsulation (private attributes)
- Type hints and docstrings
- Exception handling
- Dictionary operations
- String formatting

---

## When You're Done

Test your system with various scenarios:
- Buy and sell the same stock multiple times
- Try to sell more than you own (should error)
- Try to buy with insufficient cash (should error)
- Verify gain/loss calculations manually for at least one position
