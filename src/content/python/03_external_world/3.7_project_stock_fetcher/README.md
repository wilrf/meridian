# Project 3.7: Stock Fetcher

## Overview

Build a stock/crypto data tool that fetches real prices from the internet, caches results, and handles errors gracefully. This project ties together everything from Phase 3: HTTP requests, JSON parsing, file I/O, and error handling.

---

## The Challenge

Create a `StockFetcher` class that can:
1. Fetch current cryptocurrency prices from a free API
2. Cache results to avoid redundant requests
3. Save data to files (CSV and JSON)
4. Handle network errors with automatic retries

---

## The API

We'll use the **CoinGecko API** because it's completely free and requires no authentication.

**Base URL**: `https://api.coingecko.com/api/v3`

**Useful endpoints**:
- `/simple/price?ids=bitcoin&vs_currencies=usd` - Get current price
- `/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true` - Multiple coins with 24h change
- `/coins/{id}/market_chart?vs_currency=usd&days=30` - Historical prices

**Common coin IDs**: `bitcoin`, `ethereum`, `dogecoin`, `solana`, `cardano`

> **Tip**: Test these URLs in your browser first to see the response format.

---

## Requirements

### Part 1: Basic Fetcher

Build a class that can fetch cryptocurrency prices:

- `get_price(coin_id)` - Fetch current price for one coin
- `get_multiple_prices(coin_ids)` - Fetch prices for multiple coins in one request
- Return structured data (consider using a dataclass or dictionary)
- Include price, 24h change percentage, and timestamp

> **Hint**: Use the `requests` library. Remember to handle the JSON response.

---

### Part 2: Error Handling

Network requests fail. Make your fetcher robust:

- Handle connection errors (no internet)
- Handle timeout errors (slow response)
- Handle HTTP errors (bad request, server error)
- Handle rate limiting (429 status code) - wait and retry
- Implement automatic retries with exponential backoff

**Exponential backoff**: Wait 1 second after first failure, 2 seconds after second, 4 seconds after third, etc.

---

### Part 3: Caching

API calls are expensive (rate limits, latency). Add caching:

- Cache responses in memory with expiration times
- `get_price()` should check cache before making a request
- Cache entries should expire after a configurable TTL (time-to-live)
- Add a method to see cache statistics

> **Hint**: Store cache entries with their expiration timestamp.

---

### Part 4: Data Persistence

Save fetched data to files:

- `save_to_csv(data, filename)` - Save price history to CSV
- `save_to_json(data, filename)` - Save structured data to JSON
- `get_history(coin_id, days)` - Fetch historical data from the API

---

### Part 5: Main Application

Create a demo script that:

1. Fetches prices for several cryptocurrencies
2. Displays them in a formatted table
3. Fetches 7-day history for one coin
4. Saves the history to both CSV and JSON files
5. Demonstrates caching (fetch the same data twice, show it's faster)

---

## Design Considerations

- **Session reuse**: Create one `requests.Session` and reuse it
- **Timeout**: Always set a timeout on requests (e.g., 10 seconds)
- **Symbol mapping**: Users might say "BTC" but the API wants "bitcoin"
- **Type hints**: Document what your methods accept and return

---

## Challenge Extensions

1. **Price Alerts**: Add methods to set and check price thresholds
2. **Persistent Cache**: Save cache to disk so it survives restarts
3. **Portfolio Integration**: Connect to your Portfolio Tracker from Project 2.6
4. **CLI Interface**: Add command-line arguments using `argparse`
5. **Async Support**: Make it work with `asyncio` and `aiohttp`

---

## What You're Practicing

- HTTP requests with `requests` library
- JSON parsing
- Error handling and retries
- Caching strategies
- File I/O (CSV and JSON)
- Class design
- Type hints and documentation

---

## When You're Done

Test these scenarios:
- Fetch a valid coin - should return data
- Fetch an invalid coin - should raise a clear error
- Disconnect from internet and try to fetch - should handle gracefully
- Fetch the same coin twice quickly - second should hit cache
- Verify your CSV file opens correctly in a spreadsheet app
