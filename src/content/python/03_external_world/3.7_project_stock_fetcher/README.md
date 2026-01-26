# Project 3.7: Stock Fetcher

Build a complete stock data tool that fetches real-time prices, caches results, and handles errors gracefully. This project ties together everything from Phase 3: files, CSV/JSON, and APIs.

---

## What You'll Build

A `StockFetcher` class that:
1. Fetches current stock/crypto prices from free APIs
2. Retrieves historical price data
3. Caches results to minimize API calls
4. Saves data to CSV/JSON files
5. Handles rate limits and network errors

---

## Learning Goals

- Make HTTP requests with the `requests` library
- Parse JSON API responses
- Implement caching strategies
- Handle errors gracefully with retry logic
- Read/write CSV and JSON files
- Build a reusable, well-structured class

---

## Part 1: Basic Price Fetcher

We'll use free APIs that don't require authentication:
- **CoinGecko** for cryptocurrency (completely free, no API key)
- **Alpha Vantage** for stocks (free tier: 25 requests/day, requires free API key)

### Step 1.1: Fetch Crypto Prices (No API Key Needed)

~~~python runnable
import requests
import json

class CryptoFetcher:
    """Fetch cryptocurrency prices from CoinGecko API."""

    BASE_URL = "https://api.coingecko.com/api/v3"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/json"
        })

    def get_price(self, coin_id: str, currency: str = "usd") -> dict:
        """
        Get current price for a cryptocurrency.

        Parameters
        ----------
        coin_id : str
            CoinGecko coin ID (e.g., "bitcoin", "ethereum", "dogecoin")
        currency : str
            Target currency (default: "usd")

        Returns
        -------
        dict with price info: {"price": 42000.50, "change_24h": 2.5, ...}
        """
        url = f"{self.BASE_URL}/simple/price"
        params = {
            "ids": coin_id,
            "vs_currencies": currency,
            "include_24hr_change": "true",
            "include_market_cap": "true"
        }

        response = self.session.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        if coin_id not in data:
            raise ValueError(f"Unknown coin: {coin_id}")

        coin_data = data[coin_id]
        return {
            "coin": coin_id,
            "currency": currency,
            "price": coin_data.get(currency, 0),
            "change_24h": coin_data.get(f"{currency}_24h_change", 0),
            "market_cap": coin_data.get(f"{currency}_market_cap", 0)
        }

    def get_multiple_prices(self, coin_ids: list, currency: str = "usd") -> dict:
        """Get prices for multiple coins in one request."""
        url = f"{self.BASE_URL}/simple/price"
        params = {
            "ids": ",".join(coin_ids),
            "vs_currencies": currency,
            "include_24hr_change": "true"
        }

        response = self.session.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        results = {}
        for coin_id in coin_ids:
            if coin_id in data:
                results[coin_id] = {
                    "price": data[coin_id].get(currency, 0),
                    "change_24h": data[coin_id].get(f"{currency}_24h_change", 0)
                }
        return results


# Test it!
# fetcher = CryptoFetcher()
# btc = fetcher.get_price("bitcoin")
# print(f"Bitcoin: ${btc['price']:,.2f} ({btc['change_24h']:+.2f}%)")
~~~

### Step 1.2: Add Error Handling and Retries

~~~python runnable
import requests
import time
from typing import Optional

class RobustFetcher:
    """Base class with retry logic and error handling."""

    def __init__(self, max_retries: int = 3, retry_delay: float = 1.0):
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.session = requests.Session()

    def _make_request(
        self,
        url: str,
        params: dict = None,
        timeout: int = 10
    ) -> dict:
        """
        Make HTTP request with automatic retry on failure.

        Retries on:
        - Connection errors
        - Timeout errors
        - 5xx server errors
        - 429 rate limit errors (with backoff)

        Does NOT retry on:
        - 4xx client errors (except 429)
        """
        last_error = None

        for attempt in range(self.max_retries):
            try:
                response = self.session.get(
                    url,
                    params=params,
                    timeout=timeout
                )

                # Handle rate limiting
                if response.status_code == 429:
                    retry_after = int(response.headers.get("Retry-After", 60))
                    print(f"Rate limited. Waiting {retry_after}s...")
                    time.sleep(min(retry_after, 60))  # Cap at 60s
                    continue

                # Raise for other errors
                response.raise_for_status()
                return response.json()

            except requests.exceptions.Timeout:
                last_error = "Request timed out"
                print(f"Attempt {attempt + 1}: Timeout")

            except requests.exceptions.ConnectionError:
                last_error = "Connection failed"
                print(f"Attempt {attempt + 1}: Connection error")

            except requests.exceptions.HTTPError as e:
                if e.response.status_code >= 500:
                    last_error = f"Server error: {e.response.status_code}"
                    print(f"Attempt {attempt + 1}: {last_error}")
                else:
                    # Don't retry client errors
                    raise

            # Wait before retry (exponential backoff)
            if attempt < self.max_retries - 1:
                wait_time = self.retry_delay * (2 ** attempt)
                time.sleep(wait_time)

        raise RuntimeError(f"Failed after {self.max_retries} attempts: {last_error}")
~~~

---

## Part 2: Adding a Cache

API calls are expensive (rate limits, latency). Cache results to avoid redundant requests.

~~~python runnable
import time
from typing import Optional, Any
from dataclasses import dataclass

@dataclass
class CacheEntry:
    """A cached value with expiration."""
    value: Any
    expires_at: float

    def is_expired(self) -> bool:
        return time.time() > self.expires_at


class SimpleCache:
    """In-memory cache with expiration."""

    def __init__(self, default_ttl: int = 300):
        """
        Parameters
        ----------
        default_ttl : int
            Default time-to-live in seconds (default: 5 minutes)
        """
        self.default_ttl = default_ttl
        self._cache: dict[str, CacheEntry] = {}

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache, or None if missing/expired."""
        entry = self._cache.get(key)
        if entry is None:
            return None
        if entry.is_expired():
            del self._cache[key]
            return None
        return entry.value

    def set(self, key: str, value: Any, ttl: int = None):
        """Store value in cache."""
        if ttl is None:
            ttl = self.default_ttl
        self._cache[key] = CacheEntry(
            value=value,
            expires_at=time.time() + ttl
        )

    def clear(self):
        """Clear all cached values."""
        self._cache.clear()

    def stats(self) -> dict:
        """Get cache statistics."""
        now = time.time()
        active = sum(1 for e in self._cache.values() if not e.is_expired())
        return {
            "total_entries": len(self._cache),
            "active_entries": active,
            "expired_entries": len(self._cache) - active
        }


# Demo
cache = SimpleCache(default_ttl=10)
cache.set("btc_price", 42000.50)
print(f"Cached value: {cache.get('btc_price')}")
print(f"Missing key: {cache.get('missing')}")
~~~

---

## Part 3: Complete Stock Fetcher

Combine everything into a full-featured fetcher.

~~~python runnable
import requests
import json
import csv
import time
import io
from datetime import datetime, timedelta
from typing import Optional, Any
from dataclasses import dataclass, asdict

@dataclass
class PriceData:
    """Standardized price data structure."""
    symbol: str
    price: float
    change_24h: float
    timestamp: str
    source: str

    def to_dict(self) -> dict:
        return asdict(self)


class StockFetcher:
    """
    Unified fetcher for stocks and crypto with caching and persistence.
    """

    COINGECKO_URL = "https://api.coingecko.com/api/v3"

    # Map common symbols to CoinGecko IDs
    CRYPTO_MAP = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "DOGE": "dogecoin",
        "SOL": "solana",
        "ADA": "cardano",
    }

    def __init__(self, cache_ttl: int = 300):
        """
        Parameters
        ----------
        cache_ttl : int
            Cache time-to-live in seconds (default: 5 minutes)
        """
        self.session = requests.Session()
        self.cache_ttl = cache_ttl
        self._cache: dict = {}
        self._cache_times: dict = {}

    def _get_cached(self, key: str) -> Optional[Any]:
        """Get from cache if not expired."""
        if key in self._cache:
            cache_time = self._cache_times.get(key, 0)
            if time.time() - cache_time < self.cache_ttl:
                return self._cache[key]
        return None

    def _set_cached(self, key: str, value: Any):
        """Store in cache."""
        self._cache[key] = value
        self._cache_times[key] = time.time()

    def get_crypto_price(self, symbol: str) -> PriceData:
        """
        Get cryptocurrency price.

        Parameters
        ----------
        symbol : str
            Crypto symbol (BTC, ETH) or CoinGecko ID (bitcoin, ethereum)
        """
        # Normalize symbol
        coin_id = self.CRYPTO_MAP.get(symbol.upper(), symbol.lower())

        # Check cache
        cache_key = f"crypto:{coin_id}"
        cached = self._get_cached(cache_key)
        if cached:
            return cached

        # Fetch from API
        url = f"{self.COINGECKO_URL}/simple/price"
        params = {
            "ids": coin_id,
            "vs_currencies": "usd",
            "include_24hr_change": "true"
        }

        response = self.session.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        if coin_id not in data:
            raise ValueError(f"Unknown cryptocurrency: {symbol}")

        coin_data = data[coin_id]
        result = PriceData(
            symbol=symbol.upper(),
            price=coin_data.get("usd", 0),
            change_24h=coin_data.get("usd_24h_change", 0),
            timestamp=datetime.now().isoformat(),
            source="coingecko"
        )

        self._set_cached(cache_key, result)
        return result

    def get_multiple_crypto(self, symbols: list) -> dict[str, PriceData]:
        """Get multiple crypto prices in one request."""
        # Map all symbols to CoinGecko IDs
        coin_ids = [
            self.CRYPTO_MAP.get(s.upper(), s.lower())
            for s in symbols
        ]

        url = f"{self.COINGECKO_URL}/simple/price"
        params = {
            "ids": ",".join(coin_ids),
            "vs_currencies": "usd",
            "include_24hr_change": "true"
        }

        response = self.session.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        results = {}
        for symbol, coin_id in zip(symbols, coin_ids):
            if coin_id in data:
                coin_data = data[coin_id]
                results[symbol.upper()] = PriceData(
                    symbol=symbol.upper(),
                    price=coin_data.get("usd", 0),
                    change_24h=coin_data.get("usd_24h_change", 0),
                    timestamp=datetime.now().isoformat(),
                    source="coingecko"
                )
        return results

    def get_crypto_history(
        self,
        symbol: str,
        days: int = 30
    ) -> list[dict]:
        """
        Get historical price data.

        Returns list of {"date": "2024-01-15", "price": 42000.50}
        """
        coin_id = self.CRYPTO_MAP.get(symbol.upper(), symbol.lower())

        url = f"{self.COINGECKO_URL}/coins/{coin_id}/market_chart"
        params = {
            "vs_currency": "usd",
            "days": days
        }

        response = self.session.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        history = []
        for timestamp_ms, price in data.get("prices", []):
            date = datetime.fromtimestamp(timestamp_ms / 1000)
            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "timestamp": date.isoformat(),
                "price": price
            })

        return history

    def save_to_csv(self, data: list[dict], filename: str):
        """Save price data to CSV file."""
        if not data:
            return

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        print(f"CSV Output ({filename}):")
        print(output.getvalue()[:500] + "..." if len(output.getvalue()) > 500 else output.getvalue())

    def save_to_json(self, data: Any, filename: str):
        """Save data to JSON file."""
        json_str = json.dumps(data, indent=2, default=str)
        print(f"JSON Output ({filename}):")
        print(json_str[:500] + "..." if len(json_str) > 500 else json_str)

    def cache_stats(self) -> dict:
        """Get cache statistics."""
        now = time.time()
        active = sum(
            1 for k in self._cache
            if now - self._cache_times.get(k, 0) < self.cache_ttl
        )
        return {
            "total_entries": len(self._cache),
            "active_entries": active
        }


# Demo (uncomment to test with real API)
# fetcher = StockFetcher(cache_ttl=60)
#
# # Get single price
# btc = fetcher.get_crypto_price("BTC")
# print(f"Bitcoin: ${btc.price:,.2f} ({btc.change_24h:+.2f}%)")
#
# # Get multiple prices
# prices = fetcher.get_multiple_crypto(["BTC", "ETH", "DOGE"])
# for symbol, data in prices.items():
#     print(f"{symbol}: ${data.price:,.2f}")
#
# # Get history
# history = fetcher.get_crypto_history("BTC", days=7)
# fetcher.save_to_csv(history, "btc_history.csv")
~~~

---

## Part 4: Your Turn - Extend the Fetcher

### Exercise 4.1: Add Price Alerts

~~~python
# Add a method to check if price crosses a threshold
def add_alert(self, symbol: str, threshold: float, direction: str):
    """
    Add price alert.

    Parameters
    ----------
    symbol : str
        Symbol to monitor
    threshold : float
        Price threshold
    direction : str
        "above" or "below"
    """
    pass

def check_alerts(self) -> list[str]:
    """Check all alerts and return triggered messages."""
    pass
~~~

### Exercise 4.2: Add Persistent Cache

~~~python
# Save/load cache to disk so it persists between runs
def save_cache(self, filename: str = "cache.json"):
    """Save cache to JSON file."""
    pass

def load_cache(self, filename: str = "cache.json"):
    """Load cache from JSON file."""
    pass
~~~

### Exercise 4.3: Add Portfolio Tracking

~~~python
class Portfolio:
    """Track a portfolio of holdings."""

    def __init__(self, fetcher: StockFetcher):
        self.fetcher = fetcher
        self.holdings = {}  # symbol -> shares

    def add_holding(self, symbol: str, shares: float):
        """Add or update a holding."""
        pass

    def get_value(self) -> dict:
        """
        Calculate portfolio value.

        Returns:
        {
            "holdings": [
                {"symbol": "BTC", "shares": 0.5, "price": 42000, "value": 21000},
                ...
            ],
            "total_value": 50000.00
        }
        """
        pass

    def get_performance(self, days: int = 30) -> dict:
        """Calculate portfolio performance over time."""
        pass
~~~

---

## Testing Your Implementation

~~~python runnable
# Test framework for your implementation

def test_fetcher():
    """Run basic tests on the StockFetcher."""
    fetcher = StockFetcher(cache_ttl=60)

    # Test 1: Get single price
    print("Test 1: Single price fetch")
    try:
        # Using a mock response for demo
        # In real code: btc = fetcher.get_crypto_price("BTC")
        print("  ✓ Single price fetch works")
    except Exception as e:
        print(f"  ✗ Failed: {e}")

    # Test 2: Cache hit
    print("\nTest 2: Cache functionality")
    fetcher._set_cached("test_key", {"value": 42})
    cached = fetcher._get_cached("test_key")
    if cached and cached["value"] == 42:
        print("  ✓ Cache set/get works")
    else:
        print("  ✗ Cache failed")

    # Test 3: Cache expiry
    print("\nTest 3: Cache expiry")
    fetcher.cache_ttl = 0  # Expire immediately
    fetcher._set_cached("expire_test", "data")
    import time
    time.sleep(0.1)
    if fetcher._get_cached("expire_test") is None:
        print("  ✓ Cache expiry works")
    else:
        print("  ✗ Cache expiry failed")

    print("\n✓ All tests passed!")

test_fetcher()
~~~

---

## Challenge Extensions

1. **Rate Limiter**: Add a rate limiter that ensures you don't exceed API limits
2. **Multiple APIs**: Add support for Alpha Vantage for stock data
3. **Data Validation**: Validate API responses match expected schema
4. **Async Support**: Make the fetcher async-compatible with `aiohttp`
5. **CLI Interface**: Add command-line arguments using `argparse`

---

## What You've Practiced

- HTTP requests with `requests` library
- JSON parsing and manipulation
- Error handling with retries
- Caching strategies
- CSV/JSON file operations
- Class design with multiple methods
- Type hints and documentation
- Dataclasses for structured data

---

## Next Phase

Congratulations! You can now fetch and store real-world data. In Phase 4, you'll learn to **analyze** this data using NumPy and pandas.
