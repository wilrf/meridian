# Project 4.3: Financial Data Analyzer

Build a portfolio analysis tool that calculates key financial metrics, visualizes performance, and generates reports—all with pandas and matplotlib.

---

## The Problem

You have historical price data for stocks or cryptocurrencies. Raw prices tell you almost nothing useful. What you actually need:

- **Returns**: Did you make or lose money? By how much?
- **Risk metrics**: How volatile is this asset? What's the worst drawdown?
- **Comparisons**: Which asset performed better risk-adjusted?
- **Visualizations**: Charts that reveal patterns numbers alone miss

Financial analysts spend hours in Excel doing this. With pandas, you can analyze years of data in seconds.

---

## Learning Goals

By completing this project, you'll master:

- Loading and cleaning real financial data
- Calculating returns, volatility, and risk metrics
- Creating professional visualizations
- Building reusable analysis classes
- Generating automated reports

---

## Part 1: Getting Real Data

We'll use the CoinGecko API (free, no authentication) to get cryptocurrency prices. The same techniques work for stock data from Yahoo Finance or any CSV.

### Fetching Historical Prices

~~~python runnable
import urllib.request
import json
from datetime import datetime

def fetch_crypto_history(coin_id: str, days: int = 365) -> list[dict]:
    """
    Fetch historical prices from CoinGecko.

    Args:
        coin_id: Coin identifier (e.g., 'bitcoin', 'ethereum')
        days: Number of days of history

    Returns:
        List of dicts with 'date' and 'price' keys
    """
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    url += f"?vs_currency=usd&days={days}"

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())
    except urllib.error.HTTPError as e:
        print(f"API error: {e.code}")
        return []

    # Convert to list of dicts
    history = []
    for timestamp, price in data['prices']:
        date = datetime.fromtimestamp(timestamp / 1000)
        history.append({
            'date': date.strftime('%Y-%m-%d'),
            'price': price
        })

    return history

# Fetch Bitcoin data
btc_data = fetch_crypto_history('bitcoin', days=30)
print(f"Fetched {len(btc_data)} days of Bitcoin prices")
if btc_data:
    print(f"Latest: ${btc_data[-1]['price']:,.2f}")
~~~

### Loading Into pandas

~~~python runnable
import pandas as pd

# Sample data (simulating what you'd get from the API)
sample_data = [
    {'date': '2024-01-01', 'price': 42000.00},
    {'date': '2024-01-02', 'price': 43500.00},
    {'date': '2024-01-03', 'price': 42800.00},
    {'date': '2024-01-04', 'price': 44200.00},
    {'date': '2024-01-05', 'price': 43900.00},
    {'date': '2024-01-06', 'price': 45100.00},
    {'date': '2024-01-07', 'price': 44600.00},
]

# Convert to DataFrame
df = pd.DataFrame(sample_data)

# Convert date string to datetime index
df['date'] = pd.to_datetime(df['date'])
df = df.set_index('date')

print(df)
print(f"\nDate range: {df.index.min()} to {df.index.max()}")
~~~

---

## Part 2: Calculating Returns

Returns answer the essential question: "How much did I make or lose?"

### Why Returns Matter More Than Prices

Prices are misleading. If Bitcoin goes from $40,000 to $41,000, is that good? What about a stock going from $100 to $101? Both moved $1,000 and $1 respectively, but which performed better?

**Returns normalize everything to percentages**, making comparison possible.

### Daily Returns

~~~python runnable
import pandas as pd
import numpy as np

# Create sample price data
prices = pd.Series(
    [100, 102, 99, 103, 101, 105, 104],
    index=pd.date_range('2024-01-01', periods=7),
    name='price'
)

# Method 1: Percentage change (most common)
daily_returns = prices.pct_change()

# Method 2: Log returns (used in academic finance)
log_returns = np.log(prices / prices.shift(1))

print("Prices:")
print(prices)
print("\nDaily Returns (%):")
print((daily_returns * 100).round(2))
print("\nLog Returns (%):")
print((log_returns * 100).round(2))
~~~

### Why Log Returns?

Log returns have a special property: they're **additive**.

If you have +5% one day and -5% the next, regular returns give you:
- $100 → $105 → $99.75 (you lost money!)

Log returns account for this compounding effect, making them mathematically cleaner for analysis.

~~~python runnable
import numpy as np

# Demonstrate the compounding problem
initial = 100

# Regular percentage: +10% then -10%
after_gain = initial * 1.10  # 110
after_loss = after_gain * 0.90  # 99 (not 100!)

print(f"Regular returns: $100 → +10% → -10% → ${after_loss}")

# With log returns
log_gain = np.log(1.10)  # ~0.0953
log_loss = np.log(0.90)  # ~-0.1054
total_log = log_gain + log_loss  # -0.0101

print(f"Log return sum: {total_log:.4f} = {(np.exp(total_log) - 1) * 100:.2f}% actual change")
~~~

---

## Part 3: Risk Metrics

Returns tell you the reward. Risk metrics tell you the price you paid for it.

### Volatility (Standard Deviation of Returns)

~~~python runnable
import pandas as pd
import numpy as np

# Sample daily returns
returns = pd.Series([0.02, -0.01, 0.015, -0.02, 0.03, -0.005, 0.01])

# Daily volatility
daily_vol = returns.std()

# Annualized volatility (assuming 252 trading days)
annual_vol = daily_vol * np.sqrt(252)

print(f"Daily volatility: {daily_vol:.4f} ({daily_vol * 100:.2f}%)")
print(f"Annualized volatility: {annual_vol:.4f} ({annual_vol * 100:.2f}%)")
~~~

**What volatility means**: A stock with 20% annual volatility will typically move within ±20% of its expected return about 68% of the time (one standard deviation).

### Maximum Drawdown

The worst peak-to-trough decline. This is what keeps traders awake at night.

~~~python runnable
import pandas as pd
import numpy as np

# Simulate a price series
np.random.seed(42)
returns = np.random.normal(0.001, 0.02, 100)  # Small positive drift, 2% daily vol
prices = 100 * np.cumprod(1 + returns)
prices = pd.Series(prices)

# Calculate drawdown
running_max = prices.cummax()
drawdown = (prices - running_max) / running_max

# Maximum drawdown
max_drawdown = drawdown.min()
max_dd_idx = drawdown.idxmin()

print(f"Maximum drawdown: {max_drawdown * 100:.2f}%")
print(f"Occurred at index: {max_dd_idx}")
print(f"Price at bottom: ${prices.iloc[max_dd_idx]:.2f}")
print(f"Previous peak: ${running_max.iloc[max_dd_idx]:.2f}")
~~~

### Sharpe Ratio

The holy grail metric: **risk-adjusted returns**. It answers: "How much return did I get per unit of risk?"

~~~python runnable
import pandas as pd
import numpy as np

def sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
    """
    Calculate annualized Sharpe ratio.

    Args:
        returns: Series of daily returns
        risk_free_rate: Annual risk-free rate (default 2%)

    Returns:
        Annualized Sharpe ratio
    """
    # Convert annual risk-free to daily
    daily_rf = (1 + risk_free_rate) ** (1/252) - 1

    # Excess returns
    excess_returns = returns - daily_rf

    # Annualize
    annual_return = excess_returns.mean() * 252
    annual_vol = excess_returns.std() * np.sqrt(252)

    return annual_return / annual_vol

# Example
returns = pd.Series([0.02, -0.01, 0.015, -0.02, 0.03, -0.005, 0.01, 0.005])
sharpe = sharpe_ratio(returns)
print(f"Sharpe Ratio: {sharpe:.2f}")

# Interpretation
if sharpe > 2:
    print("Excellent risk-adjusted returns")
elif sharpe > 1:
    print("Good risk-adjusted returns")
elif sharpe > 0:
    print("Positive but modest risk-adjusted returns")
else:
    print("Poor risk-adjusted returns (worse than risk-free)")
~~~

**Sharpe ratio benchmarks**:
- < 0: You'd be better off in treasury bonds
- 0-1: Acceptable but not impressive
- 1-2: Good
- 2-3: Very good
- > 3: Exceptional (or your data is wrong)

---

## Part 4: The FinancialAnalyzer Class

Now let's combine everything into a reusable analyzer.

~~~python runnable
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Optional

class FinancialAnalyzer:
    """
    Analyze financial time series data.

    Provides methods for calculating returns, risk metrics,
    and generating summary statistics.
    """

    def __init__(self, prices: pd.Series):
        """
        Initialize with a price series.

        Args:
            prices: Series with DatetimeIndex and price values
        """
        if not isinstance(prices.index, pd.DatetimeIndex):
            raise ValueError("prices must have a DatetimeIndex")

        self.prices = prices.sort_index()
        self._returns: Optional[pd.Series] = None
        self._log_returns: Optional[pd.Series] = None

    @property
    def returns(self) -> pd.Series:
        """Daily percentage returns (cached)."""
        if self._returns is None:
            self._returns = self.prices.pct_change().dropna()
        return self._returns

    @property
    def log_returns(self) -> pd.Series:
        """Daily log returns (cached)."""
        if self._log_returns is None:
            self._log_returns = np.log(self.prices / self.prices.shift(1)).dropna()
        return self._log_returns

    def total_return(self) -> float:
        """Calculate total return over the period."""
        return (self.prices.iloc[-1] / self.prices.iloc[0]) - 1

    def annualized_return(self) -> float:
        """Calculate annualized return."""
        days = (self.prices.index[-1] - self.prices.index[0]).days
        years = days / 365.25
        total = self.total_return()
        return (1 + total) ** (1 / years) - 1

    def volatility(self, annualize: bool = True) -> float:
        """
        Calculate volatility (standard deviation of returns).

        Args:
            annualize: If True, annualize using sqrt(252) rule

        Returns:
            Volatility as a decimal
        """
        vol = self.returns.std()
        if annualize:
            vol *= np.sqrt(252)
        return vol

    def rolling_volatility(self, window: int = 20) -> pd.Series:
        """
        Calculate rolling volatility.

        Args:
            window: Rolling window size in days

        Returns:
            Series of rolling volatility values
        """
        return self.returns.rolling(window).std() * np.sqrt(252)

    def max_drawdown(self) -> dict:
        """
        Calculate maximum drawdown.

        Returns:
            Dict with 'drawdown', 'peak_date', 'trough_date', 'recovery_date'
        """
        running_max = self.prices.cummax()
        drawdown = (self.prices - running_max) / running_max

        trough_idx = drawdown.idxmin()
        peak_idx = self.prices.loc[:trough_idx].idxmax()

        # Find recovery (if any)
        recovery_idx = None
        post_trough = self.prices.loc[trough_idx:]
        recovered = post_trough[post_trough >= running_max.loc[trough_idx]]
        if len(recovered) > 0:
            recovery_idx = recovered.index[0]

        return {
            'drawdown': drawdown.min(),
            'peak_date': peak_idx,
            'trough_date': trough_idx,
            'recovery_date': recovery_idx
        }

    def sharpe_ratio(self, risk_free_rate: float = 0.02) -> float:
        """
        Calculate annualized Sharpe ratio.

        Args:
            risk_free_rate: Annual risk-free rate

        Returns:
            Sharpe ratio
        """
        daily_rf = (1 + risk_free_rate) ** (1/252) - 1
        excess = self.returns - daily_rf

        annual_return = excess.mean() * 252
        annual_vol = excess.std() * np.sqrt(252)

        return annual_return / annual_vol

    def sortino_ratio(self, risk_free_rate: float = 0.02) -> float:
        """
        Calculate Sortino ratio (uses downside deviation only).

        Unlike Sharpe, only penalizes downside volatility.
        """
        daily_rf = (1 + risk_free_rate) ** (1/252) - 1
        excess = self.returns - daily_rf

        # Only negative returns
        downside = excess[excess < 0]
        downside_std = downside.std() * np.sqrt(252)

        annual_return = excess.mean() * 252

        return annual_return / downside_std if downside_std > 0 else np.inf

    def summary(self) -> dict:
        """Generate comprehensive summary statistics."""
        dd = self.max_drawdown()

        return {
            'period_start': self.prices.index[0].strftime('%Y-%m-%d'),
            'period_end': self.prices.index[-1].strftime('%Y-%m-%d'),
            'start_price': self.prices.iloc[0],
            'end_price': self.prices.iloc[-1],
            'total_return': self.total_return(),
            'annualized_return': self.annualized_return(),
            'volatility': self.volatility(),
            'sharpe_ratio': self.sharpe_ratio(),
            'sortino_ratio': self.sortino_ratio(),
            'max_drawdown': dd['drawdown'],
            'max_dd_peak': dd['peak_date'].strftime('%Y-%m-%d'),
            'max_dd_trough': dd['trough_date'].strftime('%Y-%m-%d'),
        }

# Test it
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=252, freq='D')
returns = np.random.normal(0.0005, 0.015, 252)  # Slight upward drift
prices = pd.Series(100 * np.cumprod(1 + returns), index=dates, name='Price')

analyzer = FinancialAnalyzer(prices)
summary = analyzer.summary()

print("=== Financial Analysis Summary ===")
for key, value in summary.items():
    if isinstance(value, float):
        if 'return' in key or 'drawdown' in key:
            print(f"{key}: {value * 100:.2f}%")
        else:
            print(f"{key}: {value:.3f}")
    else:
        print(f"{key}: {value}")
~~~

---

## Part 5: Portfolio Analysis

Real portfolios have multiple assets. Let's extend our analyzer.

~~~python runnable
import pandas as pd
import numpy as np

class PortfolioAnalyzer:
    """
    Analyze a portfolio of multiple assets.
    """

    def __init__(self, prices: pd.DataFrame, weights: dict[str, float] = None):
        """
        Initialize with price data for multiple assets.

        Args:
            prices: DataFrame with DatetimeIndex, one column per asset
            weights: Dict mapping asset names to weights (must sum to 1)
        """
        self.prices = prices.sort_index()
        self.assets = list(prices.columns)

        # Default to equal weights
        if weights is None:
            n = len(self.assets)
            weights = {asset: 1/n for asset in self.assets}

        # Validate weights
        total = sum(weights.values())
        if not np.isclose(total, 1.0):
            raise ValueError(f"Weights must sum to 1, got {total}")

        self.weights = weights
        self._returns: pd.DataFrame | None = None

    @property
    def returns(self) -> pd.DataFrame:
        """Daily returns for all assets."""
        if self._returns is None:
            self._returns = self.prices.pct_change().dropna()
        return self._returns

    def portfolio_returns(self) -> pd.Series:
        """Calculate weighted portfolio returns."""
        weighted = sum(
            self.returns[asset] * weight
            for asset, weight in self.weights.items()
        )
        return weighted

    def correlation_matrix(self) -> pd.DataFrame:
        """Calculate correlation matrix between assets."""
        return self.returns.corr()

    def covariance_matrix(self, annualize: bool = True) -> pd.DataFrame:
        """Calculate covariance matrix."""
        cov = self.returns.cov()
        if annualize:
            cov *= 252
        return cov

    def portfolio_volatility(self) -> float:
        """
        Calculate portfolio volatility using covariance.

        This accounts for diversification benefits.
        """
        cov = self.covariance_matrix(annualize=True)
        w = np.array([self.weights[asset] for asset in self.assets])

        # Portfolio variance: w' * Cov * w
        port_var = w @ cov.values @ w
        return np.sqrt(port_var)

    def individual_metrics(self) -> pd.DataFrame:
        """Calculate metrics for each asset."""
        metrics = []

        for asset in self.assets:
            ret = self.returns[asset]
            metrics.append({
                'asset': asset,
                'weight': self.weights[asset],
                'annual_return': ret.mean() * 252,
                'volatility': ret.std() * np.sqrt(252),
                'sharpe': (ret.mean() * 252) / (ret.std() * np.sqrt(252))
            })

        return pd.DataFrame(metrics).set_index('asset')

    def summary(self) -> dict:
        """Portfolio summary statistics."""
        port_ret = self.portfolio_returns()

        return {
            'assets': self.assets,
            'weights': self.weights,
            'portfolio_return': port_ret.mean() * 252,
            'portfolio_volatility': self.portfolio_volatility(),
            'portfolio_sharpe': (port_ret.mean() * 252) / self.portfolio_volatility(),
            'correlations': self.correlation_matrix().to_dict()
        }

# Create sample multi-asset data
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=252, freq='D')

# Simulate correlated assets
n = len(dates)
correlation = 0.6

# Generate correlated returns
z1 = np.random.normal(0, 1, n)
z2 = correlation * z1 + np.sqrt(1 - correlation**2) * np.random.normal(0, 1, n)

stock_returns = 0.0004 + 0.015 * z1  # Stock: higher return, higher vol
bond_returns = 0.0001 + 0.005 * z2   # Bond: lower return, lower vol

prices = pd.DataFrame({
    'Stocks': 100 * np.cumprod(1 + stock_returns),
    'Bonds': 100 * np.cumprod(1 + bond_returns)
}, index=dates)

# Analyze with 60/40 allocation
portfolio = PortfolioAnalyzer(prices, weights={'Stocks': 0.6, 'Bonds': 0.4})

print("=== Individual Asset Metrics ===")
print(portfolio.individual_metrics().round(4))

print("\n=== Correlation Matrix ===")
print(portfolio.correlation_matrix().round(3))

print("\n=== Portfolio Summary ===")
summary = portfolio.summary()
print(f"Portfolio Return: {summary['portfolio_return'] * 100:.2f}%")
print(f"Portfolio Volatility: {summary['portfolio_volatility'] * 100:.2f}%")
print(f"Portfolio Sharpe: {summary['portfolio_sharpe']:.3f}")
~~~

---

## Part 6: Visualization

Numbers are powerful, but charts reveal patterns instantly.

### Price Chart with Moving Averages

~~~python runnable
import pandas as pd
import numpy as np
# Note: matplotlib visualization would display in a real environment
# Here we'll prepare the data for plotting

np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=252, freq='D')
returns = np.random.normal(0.0005, 0.02, 252)
prices = pd.Series(100 * np.cumprod(1 + returns), index=dates)

# Calculate moving averages
ma_20 = prices.rolling(20).mean()
ma_50 = prices.rolling(50).mean()

# Prepare data for visualization
viz_data = pd.DataFrame({
    'Price': prices,
    'MA_20': ma_20,
    'MA_50': ma_50
})

print("Price data with moving averages prepared:")
print(viz_data.tail(10).round(2))

# Golden cross / death cross signals
golden_cross = (ma_20 > ma_50) & (ma_20.shift(1) <= ma_50.shift(1))
death_cross = (ma_20 < ma_50) & (ma_20.shift(1) >= ma_50.shift(1))

print(f"\nGolden crosses (bullish): {golden_cross.sum()}")
print(f"Death crosses (bearish): {death_cross.sum()}")
~~~

### Drawdown Visualization Data

~~~python runnable
import pandas as pd
import numpy as np

np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=252, freq='D')
returns = np.random.normal(0.0003, 0.02, 252)
prices = pd.Series(100 * np.cumprod(1 + returns), index=dates)

# Calculate drawdown series
running_max = prices.cummax()
drawdown = (prices - running_max) / running_max * 100  # As percentage

# Find significant drawdowns (> 5%)
significant_dd = drawdown[drawdown < -5]

print("Drawdown analysis:")
print(f"Current drawdown: {drawdown.iloc[-1]:.2f}%")
print(f"Maximum drawdown: {drawdown.min():.2f}%")
print(f"Days with >5% drawdown: {len(significant_dd)}")
print(f"\nWorst drawdown periods:")
print(drawdown.nsmallest(5).round(2))
~~~

### Return Distribution Analysis

~~~python runnable
import pandas as pd
import numpy as np

np.random.seed(42)
returns = pd.Series(np.random.normal(0.001, 0.02, 252))

# Distribution statistics
print("Return Distribution Analysis")
print("=" * 40)
print(f"Mean daily return: {returns.mean() * 100:.3f}%")
print(f"Median daily return: {returns.median() * 100:.3f}%")
print(f"Standard deviation: {returns.std() * 100:.3f}%")
print(f"Skewness: {returns.skew():.3f}")
print(f"Kurtosis: {returns.kurtosis():.3f}")

# Risk metrics
print(f"\nRisk Metrics")
print("-" * 40)
print(f"5th percentile (VaR 95%): {returns.quantile(0.05) * 100:.3f}%")
print(f"1st percentile (VaR 99%): {returns.quantile(0.01) * 100:.3f}%")
print(f"Worst day: {returns.min() * 100:.3f}%")
print(f"Best day: {returns.max() * 100:.3f}%")

# Days analysis
print(f"\nDay Analysis")
print("-" * 40)
print(f"Positive days: {(returns > 0).sum()} ({(returns > 0).mean() * 100:.1f}%)")
print(f"Negative days: {(returns < 0).sum()} ({(returns < 0).mean() * 100:.1f}%)")
print(f"Days with >2% gain: {(returns > 0.02).sum()}")
print(f"Days with >2% loss: {(returns < -0.02).sum()}")
~~~

---

## Part 7: Report Generation

Automate your analysis into readable reports.

~~~python runnable
import pandas as pd
import numpy as np
from datetime import datetime

def generate_report(analyzer, name: str = "Asset") -> str:
    """
    Generate a text report for a financial analysis.

    Args:
        analyzer: FinancialAnalyzer instance
        name: Name of the asset being analyzed

    Returns:
        Formatted report string
    """
    summary = analyzer.summary()

    report = f"""
{'=' * 60}
FINANCIAL ANALYSIS REPORT: {name.upper()}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'=' * 60}

OVERVIEW
--------
Analysis Period: {summary['period_start']} to {summary['period_end']}
Starting Price:  ${summary['start_price']:.2f}
Ending Price:    ${summary['end_price']:.2f}

PERFORMANCE METRICS
-------------------
Total Return:      {summary['total_return'] * 100:>8.2f}%
Annualized Return: {summary['annualized_return'] * 100:>8.2f}%

RISK METRICS
------------
Volatility (Ann.): {summary['volatility'] * 100:>8.2f}%
Maximum Drawdown:  {summary['max_drawdown'] * 100:>8.2f}%
  Peak Date:       {summary['max_dd_peak']}
  Trough Date:     {summary['max_dd_trough']}

RISK-ADJUSTED RETURNS
---------------------
Sharpe Ratio:      {summary['sharpe_ratio']:>8.3f}
Sortino Ratio:     {summary['sortino_ratio']:>8.3f}

INTERPRETATION
--------------
"""

    # Add interpretation
    if summary['sharpe_ratio'] > 1:
        report += "- Strong risk-adjusted performance (Sharpe > 1)\n"
    elif summary['sharpe_ratio'] > 0:
        report += "- Positive but modest risk-adjusted returns\n"
    else:
        report += "- Poor risk-adjusted returns\n"

    if summary['max_drawdown'] < -0.20:
        report += f"- Significant drawdown of {summary['max_drawdown'] * 100:.1f}% - high risk\n"
    elif summary['max_drawdown'] < -0.10:
        report += f"- Moderate drawdown of {summary['max_drawdown'] * 100:.1f}%\n"
    else:
        report += f"- Contained drawdown of {summary['max_drawdown'] * 100:.1f}%\n"

    if summary['volatility'] > 0.30:
        report += "- High volatility - suitable for risk-tolerant investors\n"
    elif summary['volatility'] > 0.15:
        report += "- Moderate volatility\n"
    else:
        report += "- Low volatility - relatively stable\n"

    report += "\n" + "=" * 60

    return report

# Generate sample report
class SimpleAnalyzer:
    """Simplified analyzer for demonstration."""
    def __init__(self, prices):
        self.prices = prices
        self.returns = prices.pct_change().dropna()

    def summary(self):
        daily_rf = 0.02 / 252
        excess = self.returns - daily_rf
        downside = excess[excess < 0]

        running_max = self.prices.cummax()
        drawdown = (self.prices - running_max) / running_max

        return {
            'period_start': self.prices.index[0].strftime('%Y-%m-%d'),
            'period_end': self.prices.index[-1].strftime('%Y-%m-%d'),
            'start_price': self.prices.iloc[0],
            'end_price': self.prices.iloc[-1],
            'total_return': self.prices.iloc[-1] / self.prices.iloc[0] - 1,
            'annualized_return': ((self.prices.iloc[-1] / self.prices.iloc[0]) ** (252/len(self.prices)) - 1),
            'volatility': self.returns.std() * np.sqrt(252),
            'sharpe_ratio': excess.mean() * 252 / (excess.std() * np.sqrt(252)),
            'sortino_ratio': excess.mean() * 252 / (downside.std() * np.sqrt(252)) if len(downside) > 0 else np.inf,
            'max_drawdown': drawdown.min(),
            'max_dd_peak': self.prices.loc[:drawdown.idxmin()].idxmax().strftime('%Y-%m-%d'),
            'max_dd_trough': drawdown.idxmin().strftime('%Y-%m-%d'),
        }

np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=252, freq='D')
returns = np.random.normal(0.0005, 0.015, 252)
prices = pd.Series(100 * np.cumprod(1 + returns), index=dates)

analyzer = SimpleAnalyzer(prices)
report = generate_report(analyzer, "Bitcoin")
print(report)
~~~

---

## Exercises

Build your own financial analyzer step by step.

### Exercise 1: Basic Returns Calculator

Create a function that calculates both simple and log returns.

~~~python exercise id="4.3.1" validate="assert abs(simple_return - 0.05) < 0.001 and abs(log_return - 0.0488) < 0.001"
import numpy as np

def calculate_returns(start_price: float, end_price: float) -> tuple[float, float]:
    """
    Calculate both simple and log returns.

    Args:
        start_price: Starting price
        end_price: Ending price

    Returns:
        Tuple of (simple_return, log_return)
    """
    # Your code here:
    # simple_return = percentage change
    # log_return = ln(end/start)
    pass

# Test with 5% gain
simple_return, log_return = calculate_returns(100, 105)
print(f"Simple return: {simple_return * 100:.2f}%")
print(f"Log return: {log_return * 100:.2f}%")
~~~

### Exercise 2: Rolling Volatility

Calculate rolling 20-day annualized volatility.

~~~python exercise id="4.3.2" validate="assert len(rolling_vol.dropna()) == 80 and 0.1 < rolling_vol.dropna().mean() < 0.5"
import pandas as pd
import numpy as np

# Given price data
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=100, freq='D')
returns = np.random.normal(0.001, 0.02, 100)
prices = pd.Series(100 * np.cumprod(1 + returns), index=dates)

# Your task: Calculate 20-day rolling annualized volatility
# Hint: Use pct_change(), rolling(), std(), and multiply by sqrt(252)

rolling_vol = None  # Replace with your calculation

print(f"Rolling volatility (last 5 days):")
print(rolling_vol.tail())
~~~

### Exercise 3: Maximum Drawdown Finder

Find the maximum drawdown and its timing.

~~~python exercise id="4.3.3" validate="assert -0.5 < max_dd < 0 and peak_date is not None and trough_date is not None"
import pandas as pd
import numpy as np

# Price data with a known drawdown
prices = pd.Series(
    [100, 105, 110, 108, 95, 85, 80, 82, 90, 95, 100, 105],
    index=pd.date_range('2024-01-01', periods=12, freq='D')
)

# Your task: Find the maximum drawdown
# 1. Calculate running maximum (cummax)
# 2. Calculate drawdown at each point
# 3. Find the minimum (most negative) drawdown
# 4. Find the peak date (before the trough)
# 5. Find the trough date

max_dd = None       # Maximum drawdown as negative decimal
peak_date = None    # Date of peak before drawdown
trough_date = None  # Date of trough (lowest point)

print(f"Maximum drawdown: {max_dd * 100:.2f}%")
print(f"Peak date: {peak_date}")
print(f"Trough date: {trough_date}")
~~~

### Exercise 4: Portfolio Sharpe Ratio

Calculate the Sharpe ratio for a two-asset portfolio.

~~~python exercise id="4.3.4" validate="assert isinstance(portfolio_sharpe, float) and -2 < portfolio_sharpe < 5"
import pandas as pd
import numpy as np

# Two-asset returns data
np.random.seed(42)
n = 252

returns_data = pd.DataFrame({
    'Stock': np.random.normal(0.0004, 0.015, n),  # Higher return, higher vol
    'Bond': np.random.normal(0.0001, 0.005, n)    # Lower return, lower vol
})

weights = {'Stock': 0.7, 'Bond': 0.3}
risk_free_rate = 0.02  # 2% annual

# Your task: Calculate portfolio Sharpe ratio
# 1. Calculate weighted portfolio returns
# 2. Calculate excess returns (subtract daily risk-free rate)
# 3. Annualize mean excess return (multiply by 252)
# 4. Annualize volatility (multiply by sqrt(252))
# 5. Sharpe = annualized excess return / annualized volatility

portfolio_sharpe = None  # Your calculation

print(f"Portfolio Sharpe Ratio: {portfolio_sharpe:.3f}")
~~~

---

## Extension Challenges

Take your analyzer further.

### Challenge 1: Value at Risk (VaR)

Add VaR calculation—the maximum expected loss at a given confidence level.

```python
def value_at_risk(returns: pd.Series, confidence: float = 0.95) -> float:
    """
    Calculate historical VaR.

    Args:
        returns: Daily returns series
        confidence: Confidence level (e.g., 0.95 for 95%)

    Returns:
        VaR as a positive decimal (loss amount)
    """
    # Hint: Use quantile at (1 - confidence)
    pass
```

### Challenge 2: Efficient Frontier

Given multiple assets, find the portfolio weights that maximize Sharpe ratio.

```python
def optimize_portfolio(returns: pd.DataFrame) -> dict[str, float]:
    """
    Find optimal portfolio weights using mean-variance optimization.

    Returns weights that maximize Sharpe ratio.
    """
    # This is a classic quadratic optimization problem
    # Try scipy.optimize.minimize
    pass
```

### Challenge 3: Backtesting Framework

Build a simple backtester that simulates trading strategies.

```python
class Backtester:
    def __init__(self, prices: pd.DataFrame, initial_capital: float = 10000):
        pass

    def run_strategy(self, strategy_func) -> pd.DataFrame:
        """
        Run a trading strategy and return portfolio values.

        strategy_func takes prices and returns target weights dict
        """
        pass

    def report(self) -> dict:
        """Generate backtest report with returns, Sharpe, drawdown."""
        pass
```

### Challenge 4: Live Data Integration

Connect to a real API and analyze current market data.

```python
class LiveAnalyzer:
    def __init__(self, symbols: list[str]):
        pass

    def fetch_latest(self) -> pd.DataFrame:
        """Fetch latest prices for all symbols."""
        pass

    def daily_update(self) -> str:
        """Generate daily analysis report."""
        pass
```

---

## Key Takeaways

1. **Returns normalize comparisons**—always convert prices to returns for analysis
2. **Volatility measures risk**—but only one dimension of it
3. **Sharpe ratio is king**—risk-adjusted returns matter more than raw returns
4. **Maximum drawdown is psychological**—the metric that causes panic selling
5. **Correlation enables diversification**—uncorrelated assets reduce portfolio risk
6. **Automate everything**—pandas makes institutional-grade analysis accessible

---

## What's Next?

After completing this project, you're ready for:

- **5.1 Linear Regression**: Predict returns based on factors
- **5.2 ML Predictor**: Build machine learning trading models
- **6.1 Monte Carlo Simulation**: Model uncertain outcomes
