# Capstone 6.3: Backtesting Trading Strategy

Build a framework to test trading strategies on historical data.

## What You'll Build

A backtesting engine that:
1. Loads historical price data
2. Implements trading strategies
3. Simulates trades and tracks portfolio
4. Calculates performance metrics

## Core Concepts

- Strategy pattern (OOP)
- Event-driven vs vectorized backtesting
- Transaction costs and slippage
- Performance metrics: Sharpe, max drawdown, win rate

## Project Structure

```
6.3_backtesting_system/
├── README.md
├── data_loader.py     # Load price data
├── strategy.py        # Base class + implementations
├── backtester.py      # Simulation engine
├── metrics.py         # Performance calculations
├── visualization.py   # Equity curves
└── main.py
```

## Example Strategies

- Moving Average Crossover
- RSI Overbought/Oversold
- Mean Reversion
- Momentum

## Key Challenge

Avoid look-ahead bias—never use future data in decisions.
