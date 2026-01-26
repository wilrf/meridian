# Project 2.6: Portfolio Tracker

## Overview

Build a complete portfolio tracking system using classes. This project ties together lists, dictionaries, functions, and object-oriented programming into a cohesive application.

---

## What You'll Build

A portfolio management system that can:
1. Track stock positions with full history
2. Calculate performance metrics
3. Record transactions (buys and sells)
4. Generate reports

---

## Part 1: The Stock Class

Create `stock.py`:

```python
from datetime import datetime

class Stock:
    """Represents a stock position with transaction history."""

    def __init__(self, symbol: str, shares: int = 0, cost_basis: float = 0):
        """
        Initialize a stock position.

        Parameters
        ----------
        symbol : str
            Stock ticker (e.g., "AAPL")
        shares : int
            Number of shares owned
        cost_basis : float
            Total cost paid for all shares
        """
        self.symbol = symbol.upper()
        self._shares = shares
        self._cost_basis = cost_basis
        self._current_price = 0.0
        self.transactions = []

    @property
    def shares(self) -> int:
        return self._shares

    @property
    def cost_basis(self) -> float:
        return self._cost_basis

    @property
    def avg_cost(self) -> float:
        """Average cost per share."""
        if self._shares == 0:
            return 0.0
        return self._cost_basis / self._shares

    @property
    def current_price(self) -> float:
        return self._current_price

    @current_price.setter
    def current_price(self, price: float):
        if price < 0:
            raise ValueError("Price cannot be negative")
        self._current_price = price

    @property
    def market_value(self) -> float:
        """Current total value of position."""
        return self._shares * self._current_price

    @property
    def unrealized_gain(self) -> float:
        """Profit/loss if sold at current price."""
        return self.market_value - self._cost_basis

    @property
    def unrealized_gain_percent(self) -> float:
        """Percentage gain/loss."""
        if self._cost_basis == 0:
            return 0.0
        return (self.unrealized_gain / self._cost_basis) * 100

    def buy(self, shares: int, price: float):
        """Record a purchase."""
        if shares <= 0:
            raise ValueError("Must buy positive number of shares")
        if price <= 0:
            raise ValueError("Price must be positive")

        cost = shares * price
        self._shares += shares
        self._cost_basis += cost

        self.transactions.append({
            "type": "buy",
            "shares": shares,
            "price": price,
            "total": cost,
            "date": datetime.now()
        })

    def sell(self, shares: int, price: float) -> float:
        """
        Record a sale. Returns realized gain/loss.
        Uses average cost basis method.
        """
        if shares <= 0:
            raise ValueError("Must sell positive number of shares")
        if shares > self._shares:
            raise ValueError(f"Cannot sell {shares} shares, only own {self._shares}")
        if price <= 0:
            raise ValueError("Price must be positive")

        # Calculate gain using average cost
        proceeds = shares * price
        cost_of_sold = shares * self.avg_cost
        realized_gain = proceeds - cost_of_sold

        # Update position
        self._cost_basis -= cost_of_sold
        self._shares -= shares

        self.transactions.append({
            "type": "sell",
            "shares": shares,
            "price": price,
            "total": proceeds,
            "realized_gain": realized_gain,
            "date": datetime.now()
        })

        return realized_gain

    def __str__(self):
        return (f"{self.symbol}: {self._shares} shares @ "
                f"${self.avg_cost:.2f} avg (${self._current_price:.2f} current)")

    def __repr__(self):
        return f"Stock('{self.symbol}', {self._shares}, {self._cost_basis})"


# Test your Stock class
if __name__ == "__main__":
    aapl = Stock("AAPL")

    # Simulate some trades
    aapl.buy(50, 150.00)   # Buy 50 @ $150
    aapl.buy(30, 160.00)   # Buy 30 @ $160
    aapl.current_price = 175.00

    print(aapl)
    print(f"Total shares: {aapl.shares}")
    print(f"Cost basis: ${aapl.cost_basis:.2f}")
    print(f"Avg cost: ${aapl.avg_cost:.2f}")
    print(f"Market value: ${aapl.market_value:.2f}")
    print(f"Unrealized gain: ${aapl.unrealized_gain:.2f} ({aapl.unrealized_gain_percent:.1f}%)")

    # Sell some
    gain = aapl.sell(20, 180.00)
    print(f"\nSold 20 shares, realized gain: ${gain:.2f}")
    print(aapl)
```

---

## Part 2: The Portfolio Class

Create `portfolio.py`:

```python
from stock import Stock
from typing import Dict, List, Optional

class Portfolio:
    """Manages a collection of stock positions."""

    def __init__(self, name: str, initial_cash: float = 0):
        self.name = name
        self._cash = initial_cash
        self._holdings: Dict[str, Stock] = {}
        self._realized_gains = 0.0

    @property
    def cash(self) -> float:
        return self._cash

    @property
    def holdings(self) -> Dict[str, Stock]:
        return self._holdings.copy()

    @property
    def total_market_value(self) -> float:
        """Sum of all position values."""
        return sum(stock.market_value for stock in self._holdings.values())

    @property
    def total_value(self) -> float:
        """Cash + market value of holdings."""
        return self._cash + self.total_market_value

    @property
    def total_cost_basis(self) -> float:
        """Sum of all cost bases."""
        return sum(stock.cost_basis for stock in self._holdings.values())

    @property
    def total_unrealized_gain(self) -> float:
        """Sum of unrealized gains/losses."""
        return sum(stock.unrealized_gain for stock in self._holdings.values())

    @property
    def realized_gains(self) -> float:
        """Total realized gains from closed positions."""
        return self._realized_gains

    def deposit(self, amount: float):
        """Add cash to portfolio."""
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self._cash += amount

    def withdraw(self, amount: float):
        """Remove cash from portfolio."""
        if amount <= 0:
            raise ValueError("Withdrawal must be positive")
        if amount > self._cash:
            raise ValueError(f"Insufficient cash: ${self._cash:.2f} available")
        self._cash -= amount

    def buy(self, symbol: str, shares: int, price: float):
        """
        Buy shares of a stock.
        Creates new position if not held.
        """
        symbol = symbol.upper()
        total_cost = shares * price

        if total_cost > self._cash:
            raise ValueError(
                f"Insufficient cash: need ${total_cost:.2f}, "
                f"have ${self._cash:.2f}"
            )

        # Get or create stock position
        if symbol not in self._holdings:
            self._holdings[symbol] = Stock(symbol)

        self._holdings[symbol].buy(shares, price)
        self._cash -= total_cost

    def sell(self, symbol: str, shares: int, price: float):
        """Sell shares of a stock."""
        symbol = symbol.upper()

        if symbol not in self._holdings:
            raise ValueError(f"No position in {symbol}")

        stock = self._holdings[symbol]
        realized = stock.sell(shares, price)
        self._realized_gains += realized
        self._cash += shares * price

        # Remove position if fully closed
        if stock.shares == 0:
            del self._holdings[symbol]

    def update_price(self, symbol: str, price: float):
        """Update current price for a holding."""
        symbol = symbol.upper()
        if symbol in self._holdings:
            self._holdings[symbol].current_price = price

    def update_prices(self, prices: Dict[str, float]):
        """Update prices for multiple holdings."""
        for symbol, price in prices.items():
            self.update_price(symbol, price)

    def get_position(self, symbol: str) -> Optional[Stock]:
        """Get a specific holding."""
        return self._holdings.get(symbol.upper())

    def get_allocation(self) -> Dict[str, float]:
        """Get percentage allocation of each holding."""
        total = self.total_value
        if total == 0:
            return {}

        allocation = {"cash": (self._cash / total) * 100}
        for symbol, stock in self._holdings.items():
            allocation[symbol] = (stock.market_value / total) * 100

        return allocation

    def best_performer(self) -> Optional[Stock]:
        """Return holding with highest percentage gain."""
        if not self._holdings:
            return None
        return max(self._holdings.values(),
                   key=lambda s: s.unrealized_gain_percent)

    def worst_performer(self) -> Optional[Stock]:
        """Return holding with lowest percentage gain."""
        if not self._holdings:
            return None
        return min(self._holdings.values(),
                   key=lambda s: s.unrealized_gain_percent)

    def summary(self) -> str:
        """Generate portfolio summary report."""
        lines = [
            f"Portfolio: {self.name}",
            "=" * 50,
            f"Cash: ${self._cash:,.2f}",
            f"Holdings Value: ${self.total_market_value:,.2f}",
            f"Total Value: ${self.total_value:,.2f}",
            "",
            "Holdings:",
            "-" * 50,
        ]

        for symbol, stock in sorted(self._holdings.items()):
            gain_str = f"+${stock.unrealized_gain:,.2f}" if stock.unrealized_gain >= 0 \
                       else f"-${abs(stock.unrealized_gain):,.2f}"
            lines.append(
                f"  {symbol:6} {stock.shares:>6} shares  "
                f"${stock.market_value:>12,.2f}  {gain_str:>12} "
                f"({stock.unrealized_gain_percent:>+6.1f}%)"
            )

        lines.extend([
            "-" * 50,
            f"Cost Basis: ${self.total_cost_basis:,.2f}",
            f"Unrealized Gain: ${self.total_unrealized_gain:,.2f}",
            f"Realized Gains: ${self._realized_gains:,.2f}",
        ])

        allocation = self.get_allocation()
        lines.extend([
            "",
            "Allocation:",
            "-" * 50,
        ])
        for asset, pct in sorted(allocation.items(), key=lambda x: -x[1]):
            lines.append(f"  {asset:10} {pct:>6.1f}%")

        return "\n".join(lines)

    def __str__(self):
        return f"Portfolio({self.name}, ${self.total_value:,.2f})"

    def __repr__(self):
        return f"Portfolio('{self.name}', {self._cash})"


# Test the Portfolio
if __name__ == "__main__":
    # Create portfolio
    port = Portfolio("My Retirement", 100000)

    # Make some trades
    port.buy("AAPL", 100, 150.00)
    port.buy("GOOGL", 50, 130.00)
    port.buy("MSFT", 75, 350.00)
    port.buy("AAPL", 50, 160.00)  # Add to existing position

    # Update current prices
    port.update_prices({
        "AAPL": 175.50,
        "GOOGL": 140.25,
        "MSFT": 380.00
    })

    # Sell some
    port.sell("GOOGL", 20, 145.00)

    # Print summary
    print(port.summary())

    print("\n" + "=" * 50)
    print(f"Best performer: {port.best_performer()}")
    print(f"Worst performer: {port.worst_performer()}")
```

---

## Part 3: Price Updates (Simulated)

Create `price_service.py`:

```python
import random
from typing import Dict

class PriceService:
    """
    Simulated price service.
    In real app, this would call an API like Alpha Vantage or Yahoo Finance.
    """

    def __init__(self):
        # Simulated "last known" prices
        self._base_prices = {
            "AAPL": 175.00,
            "GOOGL": 140.00,
            "MSFT": 380.00,
            "AMZN": 178.00,
            "TSLA": 248.00,
            "META": 505.00,
            "NVDA": 875.00,
        }

    def get_price(self, symbol: str) -> float:
        """Get current price (with simulated movement)."""
        symbol = symbol.upper()
        if symbol not in self._base_prices:
            raise ValueError(f"Unknown symbol: {symbol}")

        base = self._base_prices[symbol]
        # Random walk: -2% to +2%
        change = random.uniform(-0.02, 0.02)
        price = base * (1 + change)
        self._base_prices[symbol] = price  # Update base
        return round(price, 2)

    def get_prices(self, symbols: list) -> Dict[str, float]:
        """Get prices for multiple symbols."""
        return {s: self.get_price(s) for s in symbols}


# Usage
if __name__ == "__main__":
    service = PriceService()

    # Simulate price updates over time
    for i in range(5):
        prices = service.get_prices(["AAPL", "GOOGL", "MSFT"])
        print(f"Update {i+1}: {prices}")
```

---

## Part 4: Main Application

Create `main.py`:

```python
from portfolio import Portfolio
from price_service import PriceService

def main():
    # Initialize
    portfolio = Portfolio("Growth Portfolio", 50000)
    price_service = PriceService()

    # Simulate trading activity
    print("Starting portfolio simulation...\n")

    # Initial purchases
    trades = [
        ("AAPL", 30, 170.00),
        ("GOOGL", 20, 135.00),
        ("MSFT", 15, 375.00),
        ("NVDA", 10, 850.00),
    ]

    for symbol, shares, price in trades:
        portfolio.buy(symbol, shares, price)
        print(f"Bought {shares} {symbol} @ ${price:.2f}")

    print("\n" + "=" * 50)
    print("Updating prices...")

    # Update with "current" prices
    symbols = list(portfolio.holdings.keys())
    current_prices = price_service.get_prices(symbols)
    portfolio.update_prices(current_prices)

    for symbol, price in current_prices.items():
        print(f"  {symbol}: ${price:.2f}")

    # Sell some GOOGL
    print("\nSelling 10 GOOGL...")
    portfolio.sell("GOOGL", 10, price_service.get_price("GOOGL"))

    # Final summary
    print("\n" + portfolio.summary())

    # Interactive menu (optional extension)
    # TODO: Add menu for buy/sell/view/quit


if __name__ == "__main__":
    main()
```

---

## Challenge Extensions

### Extension 1: Persistence
Save and load portfolio to JSON:
```python
def to_json(self) -> dict:
    """Serialize portfolio to dict."""
    pass

@classmethod
def from_json(cls, data: dict) -> 'Portfolio':
    """Create portfolio from dict."""
    pass
```

### Extension 2: Real Price API
Replace `PriceService` with real API calls using `requests` library (Phase 3 topic).

### Extension 3: Performance Tracking
Add time-weighted return calculations and benchmark comparison.

### Extension 4: Risk Metrics
Calculate portfolio beta, Sharpe ratio, and volatility.

---

## What You've Practiced

- Object-oriented design (classes, inheritance hierarchy)
- Properties for computed attributes and validation
- Composition (Portfolio contains Stocks)
- Encapsulation (private attributes with underscore)
- Type hints for documentation
- Exception handling for validation
- Dictionary operations for managing holdings
- String formatting for reports

---

## Next Phase

You've built a complete application using Python's core features. In Phase 3, you'll learn to **talk to the outside world**: reading files, handling errors gracefully, making API calls, and using third-party libraries.
