# Capstone 6.2: News Sentiment Analyzer

Analyze financial news sentiment and correlate with price movements.

## What You'll Build

A pipeline that:
1. Fetches financial news via API
2. Analyzes sentiment (positive/negative/neutral)
3. Correlates sentiment with stock returns
4. Generates daily reports

## Core Concepts

- API integration for news data
- Natural Language Processing basics
- Text preprocessing and tokenization
- Sentiment scoring with TextBlob/VADER

## Project Structure

```
6.2_sentiment_analyzer/
├── README.md
├── news_fetcher.py    # API integration
├── sentiment.py       # Text analysis
├── correlator.py      # Sentiment vs returns
├── reporter.py        # Generate reports
└── main.py
```

## Libraries

- `requests` for API calls
- `textblob` or `nltk.vader` for sentiment
- `pandas` for data manipulation
