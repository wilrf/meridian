# Project 5.2: ML Price Predictor

Build a machine learning pipeline for predicting financial asset movements—while learning why this is one of the hardest problems in data science.

---

## The Problem

Everyone wants to predict stock prices. It seems simple: past prices contain patterns, machine learning finds patterns, therefore ML should predict prices.

**Reality check**: If this worked reliably, the person who figured it out would own the world. Markets are efficient—millions of traders compete to find and exploit any predictable pattern. The moment a pattern exists, it gets traded away.

**So why build this?** Because the *workflow* matters more than the predictions. You'll learn:

- Feature engineering from time series data
- Proper train/test splitting for time series (no future leakage)
- Model evaluation with realistic metrics
- The difference between overfitting and genuine signal
- Why simple models often beat complex ones

---

## Learning Goals

By completing this project, you'll understand:

- How to engineer features from price data
- Time-series cross-validation (avoiding look-ahead bias)
- Regression vs classification approaches
- Regularization (Ridge, Lasso) and why it helps
- Interpreting ML metrics honestly

---

## Part 1: The Data

We'll generate realistic synthetic data, but the same code works with real prices from the Financial Analyzer project.

~~~python runnable
import pandas as pd
import numpy as np

def generate_price_data(
    n_days: int = 500,
    drift: float = 0.0003,
    volatility: float = 0.02,
    seed: int = 42
) -> pd.DataFrame:
    """
    Generate synthetic price data with realistic properties.

    Args:
        n_days: Number of trading days
        drift: Daily expected return (annualized ~7.5%)
        volatility: Daily volatility (annualized ~31%)
        seed: Random seed for reproducibility

    Returns:
        DataFrame with date index and OHLCV columns
    """
    np.random.seed(seed)

    dates = pd.date_range('2022-01-01', periods=n_days, freq='B')  # Business days

    # Generate returns with slight autocorrelation (realistic)
    base_returns = np.random.normal(drift, volatility, n_days)

    # Add some mean reversion (prices tend to reverse after big moves)
    for i in range(1, n_days):
        if abs(base_returns[i-1]) > volatility * 2:
            base_returns[i] -= base_returns[i-1] * 0.1

    # Generate OHLC from returns
    close = 100 * np.cumprod(1 + base_returns)

    # Create realistic OHLC relationships
    daily_range = np.abs(np.random.normal(0, volatility * 0.5, n_days))
    high = close * (1 + daily_range * np.random.uniform(0.3, 1.0, n_days))
    low = close * (1 - daily_range * np.random.uniform(0.3, 1.0, n_days))
    open_price = np.roll(close, 1) * (1 + np.random.normal(0, volatility * 0.3, n_days))
    open_price[0] = 100

    # Volume (higher on volatile days)
    volume = np.random.lognormal(15, 0.5, n_days) * (1 + np.abs(base_returns) * 10)

    df = pd.DataFrame({
        'open': open_price,
        'high': high,
        'low': low,
        'close': close,
        'volume': volume.astype(int)
    }, index=dates)

    return df

# Generate data
prices = generate_price_data(500)

print("Sample data (first 5 rows):")
print(prices.head())

print("\nData statistics:")
print(prices.describe().round(2))

# Calculate returns
returns = prices['close'].pct_change()
print(f"\nAnnualized return: {returns.mean() * 252 * 100:.2f}%")
print(f"Annualized volatility: {returns.std() * np.sqrt(252) * 100:.2f}%")
~~~

---

## Part 2: Feature Engineering

Raw prices aren't useful for ML. We need **features** that capture patterns.

### Technical Indicators

~~~python runnable
import pandas as pd
import numpy as np

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create predictive features from OHLCV data.

    Features fall into categories:
    - Trend: Moving averages, MACD
    - Momentum: RSI, rate of change
    - Volatility: ATR, Bollinger Bands
    - Volume: OBV, volume moving average

    Returns:
        DataFrame with features (drops rows with NaN)
    """
    features = pd.DataFrame(index=df.index)
    close = df['close']
    high = df['high']
    low = df['low']
    volume = df['volume']

    # === TREND FEATURES ===

    # Simple Moving Averages
    for window in [5, 10, 20, 50]:
        ma = close.rolling(window).mean()
        features[f'sma_{window}'] = (close - ma) / ma  # Distance from MA as percentage

    # Exponential Moving Average
    ema_12 = close.ewm(span=12).mean()
    ema_26 = close.ewm(span=26).mean()
    features['ema_ratio'] = (ema_12 - ema_26) / close

    # MACD
    macd = ema_12 - ema_26
    signal = macd.ewm(span=9).mean()
    features['macd'] = (macd - signal) / close

    # === MOMENTUM FEATURES ===

    # Rate of Change
    for window in [5, 10, 20]:
        features[f'roc_{window}'] = close.pct_change(window)

    # RSI (Relative Strength Index)
    delta = close.diff()
    gain = delta.where(delta > 0, 0).rolling(14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
    rs = gain / loss.replace(0, np.nan)
    features['rsi'] = 100 - (100 / (1 + rs))
    features['rsi'] = features['rsi'] / 100  # Normalize to 0-1

    # === VOLATILITY FEATURES ===

    # ATR (Average True Range)
    tr1 = high - low
    tr2 = abs(high - close.shift(1))
    tr3 = abs(low - close.shift(1))
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    features['atr'] = tr.rolling(14).mean() / close  # Normalized

    # Bollinger Band position
    ma_20 = close.rolling(20).mean()
    std_20 = close.rolling(20).std()
    features['bb_position'] = (close - ma_20) / (2 * std_20)  # -1 to 1 range

    # Historical volatility
    features['volatility_20'] = close.pct_change().rolling(20).std()

    # === VOLUME FEATURES ===

    # Volume relative to average
    vol_ma = volume.rolling(20).mean()
    features['volume_ratio'] = volume / vol_ma

    # Price-volume trend
    features['pv_trend'] = (close.pct_change() * volume).rolling(5).sum()
    features['pv_trend'] = features['pv_trend'] / features['pv_trend'].rolling(20).std()

    # === PATTERN FEATURES ===

    # Previous returns (lagged)
    for lag in [1, 2, 3, 5]:
        features[f'return_lag_{lag}'] = close.pct_change().shift(lag)

    # Day of week (Monday=0, Friday=4)
    features['day_of_week'] = df.index.dayofweek / 4  # Normalize to 0-1

    # Drop rows with NaN (from rolling calculations)
    features = features.dropna()

    return features

# Test feature creation
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=100, freq='B')
test_data = pd.DataFrame({
    'open': np.random.uniform(99, 101, 100),
    'high': np.random.uniform(101, 103, 100),
    'low': np.random.uniform(97, 99, 100),
    'close': 100 + np.cumsum(np.random.normal(0.1, 1, 100)),
    'volume': np.random.randint(1000000, 5000000, 100)
}, index=dates)

features = create_features(test_data)

print(f"Created {len(features.columns)} features")
print("\nFeature names:")
for col in features.columns:
    print(f"  - {col}")

print("\nFeature statistics:")
print(features.describe().round(3))
~~~

### The Target Variable

What are we predicting? We have options:

~~~python runnable
import pandas as pd
import numpy as np

# Sample close prices
np.random.seed(42)
close = pd.Series(100 + np.cumsum(np.random.normal(0, 1, 50)))

# Option 1: Next day's return (regression)
next_return = close.pct_change().shift(-1)

# Option 2: Direction (classification)
direction = (close.pct_change().shift(-1) > 0).astype(int)

# Option 3: N-day forward return (longer horizon)
forward_5d = close.pct_change(5).shift(-5)

# Option 4: Volatility (risk prediction)
future_vol = close.pct_change().rolling(5).std().shift(-5)

print("Target variable options:")
print("\n1. Next day return (regression):")
print(f"   Range: {next_return.min():.3f} to {next_return.max():.3f}")

print("\n2. Direction (classification):")
print(f"   Up days: {direction.sum()}/{len(direction)} ({direction.mean()*100:.1f}%)")

print("\n3. 5-day forward return:")
print(f"   Range: {forward_5d.dropna().min():.3f} to {forward_5d.dropna().max():.3f}")

print("\n4. Future volatility:")
print(f"   Range: {future_vol.dropna().min():.4f} to {future_vol.dropna().max():.4f}")
~~~

---

## Part 3: Train/Test Split for Time Series

**Critical**: You cannot use random splits for time series data. This creates **look-ahead bias**—your model "sees" future data during training.

~~~python runnable
import pandas as pd
import numpy as np

def time_series_split(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.2,
    gap: int = 0
) -> tuple:
    """
    Split time series data chronologically.

    Args:
        X: Features DataFrame
        y: Target Series
        test_size: Fraction of data for testing
        gap: Number of periods to skip between train and test
             (prevents data leakage from overlapping calculations)

    Returns:
        X_train, X_test, y_train, y_test
    """
    n = len(X)
    split_idx = int(n * (1 - test_size))

    X_train = X.iloc[:split_idx - gap]
    y_train = y.iloc[:split_idx - gap]
    X_test = X.iloc[split_idx:]
    y_test = y.iloc[split_idx:]

    return X_train, X_test, y_train, y_test

# Demonstrate the problem with random splits
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=100, freq='D')
features = pd.DataFrame({'feature': np.random.randn(100)}, index=dates)
target = pd.Series(np.random.randn(100), index=dates)

# Correct: Time-based split
X_train, X_test, y_train, y_test = time_series_split(features, target, test_size=0.2)

print("Correct time-series split:")
print(f"  Train: {X_train.index[0].date()} to {X_train.index[-1].date()} ({len(X_train)} samples)")
print(f"  Test:  {X_test.index[0].date()} to {X_test.index[-1].date()} ({len(X_test)} samples)")
print(f"  Train ends BEFORE test begins: {X_train.index[-1] < X_test.index[0]}")

# Wrong: Random split (what sklearn does by default)
from sklearn.model_selection import train_test_split
X_train_bad, X_test_bad, _, _ = train_test_split(features, target, test_size=0.2, random_state=42)

print("\nWrong random split (DON'T DO THIS):")
print(f"  Train dates: {X_train_bad.index.min().date()} to {X_train_bad.index.max().date()}")
print(f"  Test dates:  {X_test_bad.index.min().date()} to {X_test_bad.index.max().date()}")
print(f"  Test dates mixed into training period!")
~~~

### Time Series Cross-Validation

For more robust evaluation, use walk-forward validation.

~~~python runnable
import pandas as pd
import numpy as np

def walk_forward_split(
    X: pd.DataFrame,
    y: pd.Series,
    n_splits: int = 5,
    min_train_size: int = 100
) -> list:
    """
    Generate walk-forward cross-validation splits.

    Each split uses all previous data for training
    and the next period for testing.

    Args:
        X: Features DataFrame
        y: Target Series
        n_splits: Number of test periods
        min_train_size: Minimum training set size

    Yields:
        Tuples of (train_idx, test_idx)
    """
    n = len(X)
    test_size = (n - min_train_size) // n_splits

    splits = []
    for i in range(n_splits):
        train_end = min_train_size + i * test_size
        test_end = train_end + test_size

        train_idx = list(range(train_end))
        test_idx = list(range(train_end, min(test_end, n)))

        splits.append((train_idx, test_idx))

    return splits

# Demonstrate walk-forward
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=300, freq='D')
X = pd.DataFrame({'feature': np.random.randn(300)}, index=dates)
y = pd.Series(np.random.randn(300), index=dates)

splits = walk_forward_split(X, y, n_splits=5, min_train_size=100)

print("Walk-forward validation splits:")
for i, (train_idx, test_idx) in enumerate(splits):
    train_start = X.index[train_idx[0]].date()
    train_end = X.index[train_idx[-1]].date()
    test_start = X.index[test_idx[0]].date()
    test_end = X.index[test_idx[-1]].date()

    print(f"\nSplit {i+1}:")
    print(f"  Train: {train_start} to {train_end} ({len(train_idx)} samples)")
    print(f"  Test:  {test_start} to {test_end} ({len(test_idx)} samples)")
~~~

---

## Part 4: Building the Predictor

Now let's put it all together.

~~~python runnable
import pandas as pd
import numpy as np
from typing import Optional

class PricePredictor:
    """
    Machine learning predictor for price movements.

    Supports both regression (predict return) and
    classification (predict direction).
    """

    def __init__(self, task: str = 'regression', regularization: float = 1.0):
        """
        Initialize predictor.

        Args:
            task: 'regression' or 'classification'
            regularization: Strength of L2 regularization (Ridge/Logistic)
        """
        self.task = task
        self.regularization = regularization
        self.model = None
        self.feature_names: list = []
        self.feature_means: Optional[pd.Series] = None
        self.feature_stds: Optional[pd.Series] = None

    def _standardize(self, X: pd.DataFrame, fit: bool = False) -> pd.DataFrame:
        """Standardize features to zero mean, unit variance."""
        if fit:
            self.feature_means = X.mean()
            self.feature_stds = X.std().replace(0, 1)  # Avoid division by zero

        return (X - self.feature_means) / self.feature_stds

    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create features from OHLCV data."""
        features = pd.DataFrame(index=df.index)
        close = df['close']
        high = df['high']
        low = df['low']
        volume = df['volume']

        # Moving average distances
        for window in [5, 10, 20]:
            ma = close.rolling(window).mean()
            features[f'ma_dist_{window}'] = (close - ma) / ma

        # Momentum (rate of change)
        for window in [5, 10]:
            features[f'roc_{window}'] = close.pct_change(window)

        # RSI
        delta = close.diff()
        gain = delta.where(delta > 0, 0).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / (loss + 1e-10)
        features['rsi'] = (100 - (100 / (1 + rs))) / 100

        # Volatility
        features['volatility'] = close.pct_change().rolling(20).std()

        # Volume ratio
        features['vol_ratio'] = volume / volume.rolling(20).mean()

        # Lagged returns
        for lag in [1, 2, 3]:
            features[f'ret_lag_{lag}'] = close.pct_change().shift(lag)

        return features.dropna()

    def create_target(self, df: pd.DataFrame, horizon: int = 1) -> pd.Series:
        """
        Create target variable.

        Args:
            df: OHLCV DataFrame
            horizon: Prediction horizon in days

        Returns:
            Target series (return for regression, direction for classification)
        """
        future_return = df['close'].pct_change(horizon).shift(-horizon)

        if self.task == 'classification':
            return (future_return > 0).astype(int)
        return future_return

    def fit(self, X: pd.DataFrame, y: pd.Series):
        """
        Train the model.

        Uses Ridge regression or Logistic regression with L2.
        """
        self.feature_names = list(X.columns)
        X_std = self._standardize(X, fit=True)

        if self.task == 'regression':
            # Ridge regression (linear regression with L2 regularization)
            self.model = self._fit_ridge(X_std.values, y.values)
        else:
            # Logistic regression
            self.model = self._fit_logistic(X_std.values, y.values)

    def _fit_ridge(self, X: np.ndarray, y: np.ndarray) -> dict:
        """Fit Ridge regression using closed-form solution."""
        n_features = X.shape[1]

        # Add bias term
        X_b = np.column_stack([np.ones(len(X)), X])

        # Ridge: (X'X + λI)^(-1) X'y
        lambda_I = self.regularization * np.eye(n_features + 1)
        lambda_I[0, 0] = 0  # Don't regularize bias

        weights = np.linalg.solve(
            X_b.T @ X_b + lambda_I,
            X_b.T @ y
        )

        return {'type': 'ridge', 'weights': weights}

    def _fit_logistic(self, X: np.ndarray, y: np.ndarray, n_iter: int = 1000) -> dict:
        """Fit Logistic regression using gradient descent."""
        n_samples, n_features = X.shape

        # Add bias term
        X_b = np.column_stack([np.ones(n_samples), X])

        # Initialize weights
        weights = np.zeros(n_features + 1)

        # Learning rate with decay
        lr = 0.1

        for i in range(n_iter):
            # Predictions
            z = X_b @ weights
            predictions = 1 / (1 + np.exp(-np.clip(z, -500, 500)))

            # Gradient with L2 regularization
            gradient = X_b.T @ (predictions - y) / n_samples
            gradient[1:] += self.regularization * weights[1:] / n_samples

            # Update
            weights -= lr * gradient

            # Decay learning rate
            if i % 100 == 0:
                lr *= 0.9

        return {'type': 'logistic', 'weights': weights}

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Generate predictions."""
        X_std = self._standardize(X)
        X_b = np.column_stack([np.ones(len(X_std)), X_std.values])

        weights = self.model['weights']

        if self.model['type'] == 'ridge':
            return X_b @ weights
        else:
            z = X_b @ weights
            probs = 1 / (1 + np.exp(-np.clip(z, -500, 500)))
            return (probs > 0.5).astype(int)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Get probability predictions (classification only)."""
        if self.model['type'] != 'logistic':
            raise ValueError("predict_proba only for classification")

        X_std = self._standardize(X)
        X_b = np.column_stack([np.ones(len(X_std)), X_std.values])

        z = X_b @ self.model['weights']
        return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> dict:
        """Evaluate model performance."""
        predictions = self.predict(X)

        if self.task == 'regression':
            mse = np.mean((predictions - y.values) ** 2)
            rmse = np.sqrt(mse)

            # R² score
            ss_res = np.sum((y.values - predictions) ** 2)
            ss_tot = np.sum((y.values - y.mean()) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0

            # Direction accuracy (did we get the sign right?)
            direction_correct = np.mean(np.sign(predictions) == np.sign(y.values))

            return {
                'mse': mse,
                'rmse': rmse,
                'r2': r2,
                'direction_accuracy': direction_correct
            }
        else:
            accuracy = np.mean(predictions == y.values)

            # Precision, recall for positive class
            true_pos = np.sum((predictions == 1) & (y.values == 1))
            pred_pos = np.sum(predictions == 1)
            actual_pos = np.sum(y.values == 1)

            precision = true_pos / pred_pos if pred_pos > 0 else 0
            recall = true_pos / actual_pos if actual_pos > 0 else 0

            return {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall
            }

    def feature_importance(self) -> pd.Series:
        """Get feature importance (absolute weight values)."""
        weights = self.model['weights'][1:]  # Exclude bias
        importance = pd.Series(
            np.abs(weights),
            index=self.feature_names
        ).sort_values(ascending=False)
        return importance

# Quick test
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=200, freq='B')
test_data = pd.DataFrame({
    'open': 100 + np.cumsum(np.random.normal(0, 0.5, 200)),
    'high': 101 + np.cumsum(np.random.normal(0, 0.5, 200)),
    'low': 99 + np.cumsum(np.random.normal(0, 0.5, 200)),
    'close': 100 + np.cumsum(np.random.normal(0.02, 1, 200)),
    'volume': np.random.randint(1000000, 5000000, 200)
}, index=dates)

predictor = PricePredictor(task='regression')
features = predictor.create_features(test_data)
target = predictor.create_target(test_data)

# Align features and target
common_idx = features.index.intersection(target.dropna().index)
X = features.loc[common_idx]
y = target.loc[common_idx]

# Split
split_idx = int(len(X) * 0.8)
X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

# Train and evaluate
predictor.fit(X_train, y_train)
metrics = predictor.evaluate(X_test, y_test)

print("Model Evaluation (Regression):")
print(f"  RMSE: {metrics['rmse']:.6f}")
print(f"  R²:   {metrics['r2']:.4f}")
print(f"  Direction Accuracy: {metrics['direction_accuracy']:.2%}")

print("\nTop 5 Features by Importance:")
importance = predictor.feature_importance()
for feat, imp in importance.head().items():
    print(f"  {feat}: {imp:.4f}")
~~~

---

## Part 5: The Complete Pipeline

Let's run a full experiment with proper evaluation.

~~~python runnable
import pandas as pd
import numpy as np

class MLExperiment:
    """
    Run a complete ML experiment with proper methodology.
    """

    def __init__(self, data: pd.DataFrame, task: str = 'regression'):
        self.data = data
        self.task = task
        self.results: list = []

    def run_walk_forward(
        self,
        n_splits: int = 5,
        min_train_size: int = 100,
        regularization: float = 1.0
    ) -> pd.DataFrame:
        """
        Run walk-forward validation experiment.

        Returns:
            DataFrame with results for each split
        """
        predictor = PricePredictor(task=self.task, regularization=regularization)

        # Create features and target
        features = predictor.create_features(self.data)
        target = predictor.create_target(self.data)

        # Align
        common_idx = features.index.intersection(target.dropna().index)
        X = features.loc[common_idx]
        y = target.loc[common_idx]

        n = len(X)
        test_size = (n - min_train_size) // n_splits

        results = []

        for i in range(n_splits):
            train_end = min_train_size + i * test_size
            test_end = min(train_end + test_size, n)

            X_train = X.iloc[:train_end]
            y_train = y.iloc[:train_end]
            X_test = X.iloc[train_end:test_end]
            y_test = y.iloc[train_end:test_end]

            # Train fresh model
            model = PricePredictor(task=self.task, regularization=regularization)
            model.fit(X_train, y_train)

            # Evaluate
            metrics = model.evaluate(X_test, y_test)
            metrics['split'] = i + 1
            metrics['train_size'] = len(X_train)
            metrics['test_size'] = len(X_test)
            metrics['test_start'] = X_test.index[0]
            metrics['test_end'] = X_test.index[-1]

            results.append(metrics)

        return pd.DataFrame(results)

    def compare_regularization(
        self,
        alphas: list = [0.01, 0.1, 1.0, 10.0, 100.0]
    ) -> pd.DataFrame:
        """
        Compare different regularization strengths.
        """
        results = []

        for alpha in alphas:
            split_results = self.run_walk_forward(
                n_splits=3,
                regularization=alpha
            )

            # Average across splits
            avg_metrics = split_results.mean(numeric_only=True)
            avg_metrics['regularization'] = alpha
            results.append(avg_metrics)

        return pd.DataFrame(results)

# Generate data
np.random.seed(42)
dates = pd.date_range('2022-01-01', periods=500, freq='B')
drift = 0.0003
vol = 0.02
returns = np.random.normal(drift, vol, 500)
close = 100 * np.cumprod(1 + returns)

data = pd.DataFrame({
    'open': close * (1 + np.random.normal(0, 0.005, 500)),
    'high': close * (1 + np.abs(np.random.normal(0, 0.01, 500))),
    'low': close * (1 - np.abs(np.random.normal(0, 0.01, 500))),
    'close': close,
    'volume': np.random.randint(1000000, 5000000, 500)
}, index=dates)

# Run experiment
print("Running walk-forward validation...")
experiment = MLExperiment(data, task='regression')
results = experiment.run_walk_forward(n_splits=5, min_train_size=100)

print("\n=== Walk-Forward Results ===")
print(results[['split', 'train_size', 'test_size', 'rmse', 'r2', 'direction_accuracy']].round(4))

print("\n=== Average Performance ===")
print(f"Mean R²: {results['r2'].mean():.4f} ± {results['r2'].std():.4f}")
print(f"Mean Direction Accuracy: {results['direction_accuracy'].mean():.2%}")

# Baseline: random guessing
print(f"\nBaseline (random): 50% direction accuracy")
print(f"Model improvement: {(results['direction_accuracy'].mean() - 0.5) * 100:.1f} percentage points")
~~~

---

## Part 6: Why Predictions Are Hard

Let's understand why this is difficult.

~~~python runnable
import pandas as pd
import numpy as np

def demonstrate_overfitting():
    """Show how easily models overfit on financial data."""

    np.random.seed(42)

    # Generate pure random walk (no predictable signal)
    n = 500
    returns = np.random.normal(0, 0.02, n)
    close = 100 * np.cumprod(1 + returns)

    dates = pd.date_range('2022-01-01', periods=n, freq='B')
    data = pd.DataFrame({
        'open': close * 1.001,
        'high': close * 1.01,
        'low': close * 0.99,
        'close': close,
        'volume': np.random.randint(1000000, 5000000, n)
    }, index=dates)

    predictor = PricePredictor(task='regression', regularization=0.001)  # Low regularization
    features = predictor.create_features(data)
    target = predictor.create_target(data)

    common_idx = features.index.intersection(target.dropna().index)
    X = features.loc[common_idx]
    y = target.loc[common_idx]

    # Train/test split
    split = int(len(X) * 0.7)
    X_train, X_test = X.iloc[:split], X.iloc[split:]
    y_train, y_test = y.iloc[:split], y.iloc[split:]

    # Train
    predictor.fit(X_train, y_train)

    # Evaluate on train vs test
    train_metrics = predictor.evaluate(X_train, y_train)
    test_metrics = predictor.evaluate(X_test, y_test)

    print("=== Overfitting Demonstration ===")
    print("\nThis data is a PURE RANDOM WALK (no real signal)")
    print("\nLow regularization (λ=0.001):")
    print(f"  Training R²: {train_metrics['r2']:.4f}")
    print(f"  Test R²:     {test_metrics['r2']:.4f}")
    print(f"  Gap:         {train_metrics['r2'] - test_metrics['r2']:.4f}")

    # Now with strong regularization
    predictor_reg = PricePredictor(task='regression', regularization=100)
    predictor_reg.fit(X_train, y_train)

    train_metrics_reg = predictor_reg.evaluate(X_train, y_train)
    test_metrics_reg = predictor_reg.evaluate(X_test, y_test)

    print("\nHigh regularization (λ=100):")
    print(f"  Training R²: {train_metrics_reg['r2']:.4f}")
    print(f"  Test R²:     {test_metrics_reg['r2']:.4f}")
    print(f"  Gap:         {train_metrics_reg['r2'] - test_metrics_reg['r2']:.4f}")

    print("\n💡 Key insight: Regularization prevents overfitting to noise")
    print("   but can't create signal that doesn't exist!")

demonstrate_overfitting()
~~~

### The Efficient Market Hypothesis

~~~python runnable
import numpy as np

print("""
=== Why Price Prediction Is Hard ===

1. EFFICIENT MARKETS
   - Millions of traders compete to find patterns
   - Any discoverable pattern gets traded until it disappears
   - What remains is mostly unpredictable noise

2. NON-STATIONARITY
   - Markets change over time
   - Patterns that worked in 2010 may not work in 2024
   - Your model trains on the past but predicts the future

3. SIGNAL-TO-NOISE RATIO
   - Expected daily return: ~0.03% (annualized 7.5%)
   - Daily volatility: ~1-2%
   - Signal is 50-100x smaller than noise!

4. DATA SNOOPING BIAS
   - Many features tested = some will look good by chance
   - 20 features at 95% confidence = 1 false positive expected
   - Publication bias: only "successful" strategies get published

5. TRANSACTION COSTS
   - Even if you predict correctly, costs eat profits
   - Bid-ask spread: 0.01-0.1%
   - If your signal is 0.05%, costs might exceed gains
""")

# Demonstrate signal vs noise
np.random.seed(42)
n = 252  # One year

# True signal (if it existed)
true_signal = 0.0003  # 0.03% daily = 7.5% annual

# Noise
daily_vol = 0.015  # 1.5% daily

# Generate returns
returns = np.random.normal(true_signal, daily_vol, n)

# What can we actually detect?
sample_mean = np.mean(returns)
sample_std = np.std(returns) / np.sqrt(n)  # Standard error of mean

# t-statistic
t_stat = sample_mean / sample_std

print(f"\n=== Statistical Reality ===")
print(f"True daily signal: {true_signal * 100:.3f}%")
print(f"Daily volatility: {daily_vol * 100:.1f}%")
print(f"Signal/Noise ratio: {true_signal/daily_vol:.3f}")
print(f"\nWith 252 days of data:")
print(f"  Estimated signal: {sample_mean * 100:.3f}%")
print(f"  Standard error: {sample_std * 100:.3f}%")
print(f"  t-statistic: {t_stat:.2f}")
print(f"  Significant at 95%? {'Yes' if abs(t_stat) > 1.96 else 'No'}")
print(f"\nNeed ~{int((1.96 * daily_vol / true_signal) ** 2)} days to reliably detect this signal")
~~~

---

## Part 7: What Actually Works

Despite the challenges, there are lessons for real applications.

~~~python runnable
print("""
=== What ML Can Do in Finance ===

1. RISK PREDICTION (easier than return prediction)
   - Volatility is more predictable than returns
   - High volatility clusters (GARCH effects)
   - Use case: Position sizing, risk management

2. RELATIVE VALUE (easier than absolute prediction)
   - Which stock will outperform its peers?
   - Pairs trading, sector rotation
   - Cross-sectional rather than time-series

3. ALTERNATIVE DATA
   - Sentiment from news/social media
   - Satellite imagery (parking lots, shipping)
   - Credit card transaction data
   - These provide *new* information

4. FACTOR INVESTING
   - Well-documented factors: value, momentum, quality
   - ML can help combine factors optimally
   - Works at portfolio level, not individual stocks

5. EXECUTION OPTIMIZATION
   - When to trade to minimize market impact
   - Order book dynamics
   - This is where quant funds actually make money
""")

# Example: Volatility prediction (what actually works)
import pandas as pd
import numpy as np

np.random.seed(42)
n = 500

# Generate returns with volatility clustering (realistic)
vol = np.zeros(n)
vol[0] = 0.01
for i in range(1, n):
    vol[i] = 0.9 * vol[i-1] + 0.1 * np.abs(np.random.normal(0, 0.01))

returns = np.random.normal(0, vol)

# Can we predict volatility?
realized_vol = pd.Series(returns).rolling(20).std()
future_vol = realized_vol.shift(-20)

# Simple feature: past volatility
past_vol = realized_vol

# Correlation
mask = ~(past_vol.isna() | future_vol.isna())
correlation = np.corrcoef(past_vol[mask], future_vol[mask])[0, 1]

print(f"\n=== Volatility Prediction Example ===")
print(f"Correlation between past and future volatility: {correlation:.3f}")
print("This is actually predictable!")

# Compare to return prediction
past_return = pd.Series(returns).rolling(20).mean()
future_return = past_return.shift(-20)

mask = ~(past_return.isna() | future_return.isna())
return_corr = np.corrcoef(past_return[mask], future_return[mask])[0, 1]

print(f"Correlation between past and future returns: {return_corr:.3f}")
print("Returns are much harder to predict!")
~~~

---

## Exercises

### Exercise 1: Feature Engineering

Add a new feature to the predictor.

~~~python exercise id="5.2.1" validate="assert 'new_feature' in features.columns and not features['new_feature'].isna().all()"
import pandas as pd
import numpy as np

def create_features_extended(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create features including a custom one.

    Your task: Add a feature called 'new_feature' that captures
    the relationship between volume and price movement.

    Hint: When price moves up on high volume, that's often
    more significant than on low volume.
    """
    features = pd.DataFrame(index=df.index)
    close = df['close']
    volume = df['volume']

    # Existing features
    features['return_1d'] = close.pct_change()
    features['volume_ratio'] = volume / volume.rolling(20).mean()

    # Your custom feature:
    # Create 'new_feature' that combines price change and volume
    # One idea: return * volume_ratio (captures volume-confirmed moves)
    features['new_feature'] = None  # Replace with your calculation

    return features.dropna()

# Test
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=100, freq='B')
test_data = pd.DataFrame({
    'close': 100 + np.cumsum(np.random.normal(0, 1, 100)),
    'volume': np.random.randint(1000000, 5000000, 100)
}, index=dates)

features = create_features_extended(test_data)
print(f"Features created: {list(features.columns)}")
print(f"\nNew feature statistics:")
print(features['new_feature'].describe())
~~~

### Exercise 2: Classification Model

Modify the predictor to predict direction (up/down).

~~~python exercise id="5.2.2" validate="assert 0.4 < accuracy < 0.7 and predictions.dtype in [np.int64, np.int32, int]"
import pandas as pd
import numpy as np

# Setup: Create a simple dataset
np.random.seed(42)
n = 200
dates = pd.date_range('2023-01-01', periods=n, freq='B')

# Generate returns with slight momentum (so there's some signal)
momentum = 0.1  # Positive autocorrelation
base_returns = np.zeros(n)
base_returns[0] = np.random.normal(0, 0.01)
for i in range(1, n):
    base_returns[i] = momentum * base_returns[i-1] + np.random.normal(0, 0.01)

close = 100 * np.cumprod(1 + base_returns)

# Features: lagged returns
features = pd.DataFrame({
    'ret_1': pd.Series(base_returns).shift(1),
    'ret_2': pd.Series(base_returns).shift(2),
    'ret_3': pd.Series(base_returns).shift(3),
}, index=dates).dropna()

# Target: direction of next return (1 = up, 0 = down)
target = (pd.Series(base_returns) > 0).astype(int)
target = target.loc[features.index]

# Split
split = int(len(features) * 0.7)
X_train = features.iloc[:split]
y_train = target.iloc[:split]
X_test = features.iloc[split:]
y_test = target.iloc[split:]

# Your task: Build and train a simple classifier
# Use logistic regression or any method you prefer
# Store predictions in 'predictions' (should be 0 or 1)

predictions = None  # Your predictions here (numpy array of 0s and 1s)
accuracy = None     # Calculate accuracy

print(f"Test accuracy: {accuracy:.2%}")
print(f"Baseline (random): 50%")
~~~

### Exercise 3: Walk-Forward Evaluation

Implement walk-forward cross-validation.

~~~python exercise id="5.2.3" validate="assert len(all_metrics) == 3 and all(0 <= m['accuracy'] <= 1 for m in all_metrics)"
import pandas as pd
import numpy as np

# Setup
np.random.seed(42)
n = 300
features = pd.DataFrame({
    'f1': np.random.randn(n),
    'f2': np.random.randn(n),
}, index=range(n))

# Target with weak signal
target = pd.Series(
    (0.1 * features['f1'] + np.random.randn(n) > 0).astype(int),
    index=features.index
)

def simple_classifier(X_train, y_train, X_test):
    """Very simple classifier: predict most common class."""
    most_common = y_train.mode().iloc[0]
    return np.full(len(X_test), most_common)

# Your task: Implement walk-forward validation
# Split data into 3 periods:
# - Period 1: Train on [0:100], test on [100:150]
# - Period 2: Train on [0:150], test on [150:200]
# - Period 3: Train on [0:200], test on [200:250]

all_metrics = []  # Store {'accuracy': float} for each period

# Your code here:
# For each period:
#   1. Define train and test indices
#   2. Train classifier
#   3. Calculate accuracy
#   4. Append {'accuracy': acc} to all_metrics

print("Walk-forward results:")
for i, metrics in enumerate(all_metrics):
    print(f"  Period {i+1}: {metrics['accuracy']:.2%} accuracy")
~~~

### Exercise 4: Regularization Comparison

Compare models with different regularization strengths.

~~~python exercise id="5.2.4" validate="assert len(results) >= 3 and all('alpha' in r and 'test_r2' in r for r in results)"
import pandas as pd
import numpy as np

# Setup: Noisy regression problem
np.random.seed(42)
n = 200
n_features = 10

# Many features, most are noise
X = pd.DataFrame(
    np.random.randn(n, n_features),
    columns=[f'f{i}' for i in range(n_features)]
)

# Only first 2 features matter
true_weights = np.array([0.5, -0.3] + [0] * (n_features - 2))
y = X.values @ true_weights + np.random.randn(n) * 0.5

# Split
split = int(n * 0.7)
X_train, X_test = X.iloc[:split], X.iloc[split:]
y_train, y_test = y[:split], y[split:]

# Your task: Compare different regularization strengths
# Test alphas: [0.01, 1.0, 100.0]
# For each alpha:
#   1. Fit ridge regression: w = (X'X + αI)^(-1) X'y
#   2. Calculate R² on test set
#   3. Store {'alpha': α, 'test_r2': r2}

results = []  # List of {'alpha': float, 'test_r2': float}

# Your code here

print("Regularization comparison:")
for r in results:
    print(f"  α={r['alpha']:6.2f}: Test R² = {r['test_r2']:.4f}")
~~~

---

## Extension Challenges

### Challenge 1: Feature Selection

Implement forward feature selection.

```python
def forward_selection(X: pd.DataFrame, y: pd.Series, max_features: int = 5) -> list:
    """
    Select features one at a time, adding the best performer.

    Returns list of selected feature names.
    """
    pass
```

### Challenge 2: Ensemble Methods

Build a simple ensemble of models.

```python
class EnsemblePredictor:
    def __init__(self, n_models: int = 5):
        pass

    def fit(self, X, y):
        """Train multiple models with different subsets/regularization."""
        pass

    def predict(self, X):
        """Average predictions across models."""
        pass
```

### Challenge 3: Online Learning

Implement a model that updates with each new observation.

```python
class OnlinePredictor:
    def __init__(self, learning_rate: float = 0.01):
        pass

    def partial_fit(self, x: np.ndarray, y: float):
        """Update model with single observation."""
        pass

    def predict(self, x: np.ndarray) -> float:
        """Predict using current weights."""
        pass
```

### Challenge 4: Backtesting Integration

Connect to the Financial Analyzer to backtest predictions.

```python
class PredictorBacktest:
    def __init__(self, predictor, transaction_cost: float = 0.001):
        pass

    def run(self, prices: pd.DataFrame) -> pd.DataFrame:
        """
        Backtest the predictor.
        Returns DataFrame with dates, predictions, positions, returns.
        """
        pass

    def report(self) -> dict:
        """Generate backtest report with Sharpe, drawdown, etc."""
        pass
```

---

## Key Takeaways

1. **Process over predictions**: The ML workflow matters more than accuracy on financial data
2. **Time matters**: Always use chronological splits, never random
3. **Regularization is essential**: Financial data is noisy; prevent overfitting
4. **Baselines are humbling**: Compare to random guessing (50%) and buy-and-hold
5. **Risk prediction > return prediction**: Volatility is actually forecastable
6. **Transaction costs kill**: A 0.1% edge evaporates after trading costs

---

## What's Next?

After completing this project, you're ready for:

- **6.1 Monte Carlo Simulation**: Model uncertainty with randomness
- **6.2 Sentiment Analyzer**: Alternative data for prediction
- **6.3 Backtesting Framework**: Full trading simulation
