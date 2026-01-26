# Capstones Overview

## Overview

You've built a strong Python foundation. Now put it all together with three substantial projects that integrate everything you've learned—and extend into real-world applications in finance and ML.

Each project is designed to be portfolio-worthy: something you could show to employers or use as a foundation for real tools.

---

## Project 1: Monte Carlo Portfolio Simulator

### What You'll Build

A simulation engine that models thousands of possible future portfolio outcomes to answer questions like:
- "What's the probability my portfolio loses more than 20%?"
- "What's my 95% Value at Risk (VaR)?"
- "How does adding bonds change my risk profile?"

### Skills Applied

- NumPy for fast random number generation
- Probability distributions (normal, log-normal)
- Statistical analysis (percentiles, confidence intervals)
- Data visualization (histograms, fan charts)
- Object-oriented design

### Project Structure

```
monte_carlo/
├── simulation.py      # Core simulation engine
├── portfolio.py       # Portfolio class with assets and weights
├── distributions.py   # Return distribution models
├── risk_metrics.py    # VaR, CVaR, Sharpe calculations
├── visualization.py   # Plotting functions
└── main.py           # CLI interface
```

### Key Features to Implement

1. **Asset class with return distributions**
   ```python
   class Asset:
       def __init__(self, name, expected_return, volatility):
           pass
       def simulate_returns(self, n_periods, n_simulations):
           """Generate random returns using geometric Brownian motion."""
           pass
   ```

2. **Portfolio with correlation**
   ```python
   class Portfolio:
       def __init__(self, assets, weights, correlation_matrix):
           pass
       def simulate(self, n_periods, n_simulations):
           """Simulate correlated asset returns."""
           pass
   ```

3. **Risk metrics**
   ```python
   def value_at_risk(returns, confidence=0.95):
       """Calculate VaR at given confidence level."""
       pass

   def conditional_var(returns, confidence=0.95):
       """Calculate CVaR (expected shortfall)."""
       pass
   ```

4. **Visualization**
   - Fan chart showing simulation paths
   - Histogram of terminal values
   - Risk metrics summary

---

## Project 2: Automated News Sentiment Analyzer

### What You'll Build

A pipeline that:
1. Fetches financial news articles via API
2. Analyzes sentiment (positive/negative/neutral)
3. Correlates sentiment with stock price movements
4. Generates daily reports

### Skills Applied

- API integration (news APIs, stock APIs)
- Text processing and NLP basics
- pandas for data manipulation
- Scheduling and automation
- Report generation

### Project Structure

```
sentiment_analyzer/
├── news_fetcher.py      # API integration for news
├── sentiment.py         # Text analysis functions
├── price_fetcher.py     # Stock price API
├── correlator.py        # Sentiment-price correlation
├── reporter.py          # Generate reports
├── scheduler.py         # Automated daily runs
└── main.py
```

### Key Features to Implement

1. **News fetching**
   ```python
   class NewsFetcher:
       def fetch_articles(self, query, start_date, end_date):
           """Fetch news articles from API."""
           pass
   ```

2. **Sentiment analysis (using TextBlob or VADER)**
   ```python
   from textblob import TextBlob

   def analyze_sentiment(text):
       """Return sentiment score (-1 to 1) and label."""
       blob = TextBlob(text)
       polarity = blob.sentiment.polarity
       if polarity > 0.1:
           label = "positive"
       elif polarity < -0.1:
           label = "negative"
       else:
           label = "neutral"
       return {"score": polarity, "label": label}
   ```

3. **Correlation analysis**
   ```python
   def correlate_sentiment_returns(sentiment_df, price_df):
       """
       Calculate correlation between daily sentiment
       and next-day returns.
       """
       pass
   ```

4. **Automated reporting**
   - Daily email/file with top positive/negative stories
   - Sentiment trend charts
   - Correlation statistics

---

## Project 3: Backtesting Trading Strategy

### What You'll Build

A backtesting framework that:
1. Loads historical price data
2. Implements trading strategies (buy/sell rules)
3. Simulates trades and tracks portfolio value
4. Calculates performance metrics
5. Compares strategies to buy-and-hold

### Skills Applied

- Time series data manipulation
- Strategy pattern (OOP)
- Performance analytics
- Vectorized backtesting
- Visualization

### Project Structure

```
backtester/
├── data_loader.py       # Load and prepare price data
├── strategy.py          # Base class + implementations
├── backtester.py        # Simulation engine
├── metrics.py           # Performance calculations
├── visualization.py     # Equity curves, drawdowns
└── main.py
```

### Key Features to Implement

1. **Strategy base class**
   ```python
   from abc import ABC, abstractmethod

   class Strategy(ABC):
       @abstractmethod
       def generate_signals(self, prices: pd.DataFrame) -> pd.Series:
           """
           Return Series of signals: 1 (buy), -1 (sell), 0 (hold)
           """
           pass
   ```

2. **Example strategies**
   ```python
   class MovingAverageCrossover(Strategy):
       def __init__(self, short_window=20, long_window=50):
           self.short_window = short_window
           self.long_window = long_window

       def generate_signals(self, prices):
           short_ma = prices["close"].rolling(self.short_window).mean()
           long_ma = prices["close"].rolling(self.long_window).mean()
           signal = (short_ma > long_ma).astype(int)
           return signal.diff()  # 1 = new buy, -1 = new sell

   class RSIStrategy(Strategy):
       def __init__(self, period=14, oversold=30, overbought=70):
           pass
   ```

3. **Backtester**
   ```python
   class Backtester:
       def __init__(self, strategy, initial_capital=100000):
           pass

       def run(self, prices: pd.DataFrame) -> pd.DataFrame:
           """
           Run backtest and return DataFrame with:
           - signals
           - positions
           - portfolio_value
           - returns
           """
           pass
   ```

4. **Performance metrics**
   ```python
   def calculate_metrics(equity_curve: pd.Series) -> dict:
       """
       Calculate:
       - Total return
       - Annualized return
       - Sharpe ratio
       - Max drawdown
       - Win rate
       - Profit factor
       """
       pass
   ```

5. **Visualization**
   - Equity curve with buy/sell markers
   - Drawdown chart
   - Monthly returns heatmap
   - Strategy comparison table

---

## Getting Started

### Recommended Order

1. **Monte Carlo** - Deepens NumPy/statistics knowledge
2. **Sentiment Analyzer** - Practices APIs and text processing
3. **Backtester** - Most complex, ties everything together

### Project Requirements

For each project, include:
- [ ] README with setup instructions
- [ ] requirements.txt with dependencies
- [ ] Example usage / demo script
- [ ] Unit tests for core functions
- [ ] Documentation (docstrings + high-level docs)

### Evaluation Criteria

A complete capstone should demonstrate:
1. **Correctness**: Code works and produces valid results
2. **Code quality**: Clean, readable, well-organized
3. **Documentation**: Clear explanations of what and why
4. **Testing**: Confidence the code works correctly
5. **Extensibility**: Easy to add new features

---

## Resources

### APIs You'll Need

- **Stock prices**: Alpha Vantage (free), Yahoo Finance, Polygon.io
- **News**: News API, Alpha Vantage News, Financial Modeling Prep
- **Crypto**: CoinGecko (free, no auth)

### Libraries to Install

```bash
pip install pandas numpy matplotlib seaborn
pip install requests
pip install textblob  # For sentiment
pip install scikit-learn  # For ML
pip install yfinance  # Easy stock data
```

### Further Reading

- "Advances in Financial Machine Learning" by Marcos López de Prado
- "Python for Finance" by Yves Hilpisch
- QuantStart blog (quantstart.com)
- Towards Data Science finance articles

---

## What's Next?

After completing these capstones, you'll have:

1. **A solid Python foundation** for any programming task
2. **Data analysis skills** with pandas and NumPy
3. **ML fundamentals** you can build upon
4. **Portfolio projects** demonstrating your abilities
5. **Domain knowledge** in quantitative finance

From here, you can explore:
- Deep learning with PyTorch/TensorFlow
- More advanced ML (XGBoost, neural networks)
- Production deployment (Docker, cloud)
- Real-time trading systems
- Alternative data sources

Congratulations on completing the Python Learning Track!
