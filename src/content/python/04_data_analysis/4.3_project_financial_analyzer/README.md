---
title: "Financial Data Analyzer"
requires: ["numpy", "pandas"]
---

# Financial Data Analyzer

## Overview

Build a portfolio analysis tool that calculates key financial metrics, generates statistics, and produces reports—all with pandas.

---

## The Problem

Raw price data tells you almost nothing useful. What you actually need:

- **Returns**: Did you make or lose money? By how much?
- **Risk metrics**: How volatile is this asset? What's the worst drawdown?
- **Comparisons**: Which asset performed better on a risk-adjusted basis?

Financial analysts spend hours in Excel doing this. With pandas, you can analyze years of data in seconds.

---

## The Challenge

Build a `FinancialAnalyzer` class that takes a price series and calculates comprehensive metrics.

---

## Requirements

### Part 1: Data Loading

Your analyzer should accept a pandas Series with a DatetimeIndex:

```python
analyzer = FinancialAnalyzer(prices)  # prices is a pd.Series with datetime index
```

If the data doesn't have a DatetimeIndex, raise a helpful error.

---

### Part 2: Returns Calculations

Implement these as properties or methods:

- **Daily returns**: Percentage change from day to day (`pct_change()`)
- **Log returns**: Natural log of price ratios (used in academic finance)
- **Total return**: Overall gain/loss from start to end
- **Annualized return**: Total return converted to yearly rate

> **Why log returns?** They're additive across time periods, making them mathematically cleaner for analysis.

---

### Part 3: Risk Metrics

Calculate these measures of risk:

- **Volatility**: Standard deviation of returns, annualized (multiply daily by √252)
- **Rolling volatility**: 20-day rolling window of annualized volatility
- **Maximum drawdown**: Largest peak-to-trough decline
  - Include the peak date, trough date, and recovery date (if any)

> **Hint for drawdown**: Calculate the running maximum, then find where the current price differs most from that maximum.

---

### Part 4: Risk-Adjusted Returns

Implement these classic metrics:

- **Sharpe Ratio**: (Return - Risk-free rate) / Volatility
  - Use 2% annual risk-free rate as default
  - Annualize both return and volatility
- **Sortino Ratio**: Like Sharpe, but only penalizes downside volatility
  - Only include negative returns in the volatility calculation

**Interpretation**:

- Sharpe < 0: Worse than risk-free (treasury bonds)
- Sharpe 0-1: Acceptable
- Sharpe 1-2: Good
- Sharpe > 2: Excellent

---

### Part 5: Summary Report

Create a `summary()` method that returns a dictionary with all key metrics:

- Period start/end dates
- Starting/ending prices
- Total and annualized returns
- Volatility
- Sharpe and Sortino ratios
- Maximum drawdown details

---

### Part 6: Portfolio Analysis (Bonus)

Extend your analyzer to handle multiple assets:

- Accept a DataFrame with multiple price columns
- Calculate correlation matrix between assets
- Calculate portfolio returns given weights
- Calculate portfolio volatility (accounts for diversification)

> **Portfolio volatility formula**: It's not just the weighted average of individual volatilities—you need the covariance matrix.

---

## Getting Test Data

Use the CoinGecko API (from Project 3.7) or generate synthetic data:

```python
import numpy as np
import pandas as pd

# Generate 1 year of synthetic price data
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=252, freq='D')
returns = np.random.normal(0.0005, 0.02, 252)  # Small drift, 2% daily vol
prices = pd.Series(100 * np.cumprod(1 + returns), index=dates)
```

---

## Design Considerations

- **Lazy calculation**: Use `@property` with caching to avoid recalculating
- **Input validation**: Check that prices have a DatetimeIndex
- **Edge cases**: Handle division by zero, empty data, single data point
- **Annualization**: Trading days per year = 252 (not 365)

---

## Challenge Extensions

1. **Value at Risk (VaR)**: Calculate the maximum expected loss at 95% and 99% confidence
2. **Efficient Frontier**: Given multiple assets, find optimal weights for maximum Sharpe
3. **Report Generation**: Create a formatted text or HTML report
4. **Visualization**: Add methods that return data ready for plotting

---

## What You're Practicing

- pandas Series and DataFrame operations
- Financial calculations and formulas
- Class design with properties
- Statistical concepts (mean, std, correlation)
- Working with time series data

---

## When You're Done

Verify your calculations:

- Total return should match: (end_price / start_price) - 1
- Sharpe ratio sign should match whether returns beat risk-free rate
- Maximum drawdown should be negative (it's a loss)
- Test with flat prices (all same value) - volatility should be 0
