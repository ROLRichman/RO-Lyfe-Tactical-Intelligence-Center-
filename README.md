# RO'Lyfe RTIC — Live Market Scanner & Chart

Standalone GitHub Pages build for the RO'Lyfe Tactical Intelligence Center architecture.

## What it includes

- RTIC 0–100 technical score using the 10-category structure:
  - 200 MA
  - 50 MA
  - 5/10/20 alignment
  - MACD
  - RSI
  - Stochastic
  - CCI
  - TTM-style squeeze state + momentum proxy
  - Volume / RVOL
  - Support / resistance
- Liquidity score 0–10
- Stock scan lane ($1–$10 by default)
- Long / Short / Both scan modes
- Crypto scan for BTC, ETH, SOL, XRP, ADA, AVAX, DOGE
- Lightweight Charts interactive candlesticks with 5/10/20/50/200 MA overlays
- Multi-timeframe chart buttons: 1D, 4H, 1H, 15M, 5M
- Trade map: entry, hard stop, 1R / 2R / 3R, account risk, share sizing
- Live crypto kline WebSocket updates through Binance public market-data infrastructure
- Optional Finnhub stock connection for latest quotes and candles
- Local browser storage for the optional stock API key; never commit the key to GitHub

## Deploy

1. Create a new GitHub repository or folder for the page.
2. Put `index.html` at the publish root.
3. Enable GitHub Pages from the repository's main branch.
4. Open the page and use **Data Settings** to add your own Finnhub API key for live stock data.

## Data architecture

GitHub Pages is static, so this build intentionally has two market-data paths:

- Crypto: browser -> Binance public market-data endpoints/WebSocket.
- Stocks: browser -> Finnhub with the user's own API key.

A future production version can move the stock data layer to a small serverless function so credentials are not held in the browser.

## RTIC note

The score is a local implementation of the existing RO'Lyfe scoring architecture. It is intentionally transparent and editable in the page source. A chart is still required for final entry/stop validation.

## Attribution

Chart rendering uses TradingView Lightweight Charts.
