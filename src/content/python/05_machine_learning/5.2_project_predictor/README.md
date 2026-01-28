---
title: "ML Price Predictor"
requires: ["numpy", "pandas", "scikit-learn"]
---

# ML Price Predictor

## Overview

Build a machine learning model that predicts stock or cryptocurrency price movements. This project ties together data preparation, feature engineering, model training, and evaluation.

---

## The Problem

Can we predict tomorrow's price based on today's data? This is one of the hardest problems in finance.

**Reality check**: If this worked reliably, the person who figured it out would own the world. Markets are efficient—millions of traders compete to find and exploit any predictable pattern.

**So why build this?** Because the *workflow* matters more than the predictions. You'll learn proper ML methodology that applies to any prediction problem.

---

## The Challenge

Build a complete ML pipeline that:

1. Prepares time series data for machine learning
2. Engineers meaningful features
3. Trains and evaluates a prediction model
4. Avoids common pitfalls (data leakage, look-ahead bias)

---

## Requirements

### Part 1: Data Preparation

Start with historical price data. Your data prep should:

- Load prices into a pandas DataFrame with datetime index
- Handle missing values appropriately
- Create a target variable (what you're predicting)

**Target options** (choose one):

- Next-day return (continuous - regression)
- Direction (up/down - classification)
- Threshold crossing (>1% move - classification)

> **Critical**: Never use future data to predict the past. This is called "look-ahead bias" and will make your model useless in practice.

---

### Part 2: Feature Engineering

Create features that might predict price movements. Ideas to explore:

**Price-based features**:

- Returns over various lookback periods
- Moving averages
- Price position relative to moving averages
- Rolling volatility

**Technical indicators**:

- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Band position

**Lagged features**:

- Previous days' returns
- Pattern features

> **Critical rule**: Every feature must only use data available at prediction time.

---

### Part 3: Train/Test Split

**Wrong approach** (common mistake): Random split

- Mixes future and past data
- Model "learns" from the future
- Results look great, model fails in reality

**Correct approach**: Time-based split

- Train on earlier data chronologically
- Test on later data chronologically
- Never let training see future data

Implement: ~70-80% train (early data), ~20-30% test (later data)

---

### Part 4: Model Training

Start simple, then iterate:

1. **Baseline model**: Always predict the mean (or "no change")
   - This is your benchmark to beat

2. **Linear model**: LinearRegression or LogisticRegression
   - Simple and interpretable
   - Shows feature importance

3. **Tree-based model**: RandomForest or GradientBoosting
   - Handles non-linear relationships
   - Compare to linear model

Use scikit-learn for all models.

---

### Part 5: Evaluation

**For regression** (predicting returns):

- RMSE, MAE, R²
- Compare to baseline (predicting mean)

**For classification** (predicting direction):

- Accuracy (beware class imbalance!)
- Precision, Recall, F1
- Confusion matrix

**The real test**: If you traded based on predictions, would you make money after costs?

---

### Part 6: Analysis & Reflection

Answer honestly:

- Which features matter most? (feature importance)
- Does the model beat the baseline?
- Would this model actually be useful?
- Where does it fail?

---

## Common Pitfalls

1. **Look-ahead bias**: Using future data in features
2. **Data snooping**: Testing many models, picking the best-looking one
3. **Ignoring transaction costs**: Real trading has fees
4. **Overfitting**: Model memorizes training data, fails on new data
5. **Wrong metrics**: 70% "accuracy" can still lose money

---

## Getting Data

Use your Stock Fetcher (Project 3.7) or generate synthetic data:

```python
import numpy as np
import pandas as pd

np.random.seed(42)
n_days = 500
dates = pd.date_range('2022-01-01', periods=n_days, freq='D')
returns = np.random.normal(0.0003, 0.02, n_days)
prices = pd.DataFrame({
    'close': 100 * np.cumprod(1 + returns)
}, index=dates)
```

---

## Challenge Extensions

1. **Walk-forward validation**: Retrain periodically on expanding window
2. **Feature selection**: Use cross-validation to find best features
3. **Hyperparameter tuning**: GridSearchCV for optimal parameters
4. **Ensemble methods**: Combine multiple models
5. **Paper trading**: Apply to live data (no real money!)

---

## What You're Practicing

- Time series feature engineering
- Proper ML evaluation methodology
- Avoiding common ML mistakes
- Scikit-learn pipelines
- Critical thinking about results

---

## When You're Done

Be honest in your conclusions:

- Most price prediction models don't beat buy-and-hold
- A "70% accurate" model might still lose money
- Understanding *why* prediction is hard is valuable

The goal isn't to get rich—it's to learn proper ML workflow.
