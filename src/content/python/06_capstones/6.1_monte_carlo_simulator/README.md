# Capstone 6.1: Monte Carlo Portfolio Simulator

Simulate thousands of possible portfolio outcomes to measure risk.

## What You'll Build

A simulation engine that answers:
- "What's the probability my portfolio loses more than 20%?"
- "What's my 95% Value at Risk (VaR)?"
- "How does adding bonds change my risk profile?"

## Core Concepts

- Random sampling from return distributions
- Geometric Brownian Motion for price paths
- Correlation between assets
- Risk metrics: VaR, CVaR, Sharpe ratio

## Project Structure

```
6.1_monte_carlo_simulator/
├── README.md
├── simulation.py      # Core simulation engine
├── portfolio.py       # Portfolio class
├── risk_metrics.py    # VaR, CVaR calculations
├── visualization.py   # Fan charts, histograms
└── main.py           # CLI interface
```

## Key Challenge

Model correlated asset returns using Cholesky decomposition.
