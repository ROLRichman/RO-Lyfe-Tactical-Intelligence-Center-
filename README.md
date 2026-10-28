# RO'Lyfe RTIC — Live Market Scanner & Chart

https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/

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


## Secure live-data panel (current build)

The main dashboard includes a **Secure Market Data & RTIC Scanner** section:
- Tickerbot historical OHLCV bars feed a transparent, equal-weight 10-category technical snapshot (EMA 5/10/20/50/200, MACD, RSI, Stochastic, CCI, squeeze/momentum proxy, RVOL, and 20-bar support/resistance).
- The scan displays a 0–100 directional summary and a 0–10 average-dollar-volume liquidity proxy. These are descriptive indicators, not a probability of success or a trade recommendation.
- Finnhub and Alpha Vantage provide quotes; CoinGecko supports BTC, ETH, SOL, XRP, LINK, and HYPE quotes.
- The frontend calls the `market-data` and `market-data-status` Supabase Edge Functions. Provider credentials are read from server-side Edge Function secrets: `TICKERBOT_API_KEY`, `FINNHUB_API_KEY`, `ALPHA_VANTAGE_API_KEY`, and `COINGECKO_API_KEY`. Never place these provider keys in GitHub files or browser JavaScript.
- `market-data-status` reports whether each secret is configured; it does not prove data-provider connectivity. The data panel separately reports when a provider actually responds.

Before relying on results, verify timestamps, exchange/session coverage, provider plan limits, and quote latency. Average dollar volume is not options-chain liquidity. The embedded TradingView chart remains a separate charting view; scanner data depends on the selected provider and interval.


## Expanded-chart indicator dock and scroll shortcuts (2026-10-28)
- Added a floating quick-navigation rail that appears after scrolling 420px, with **Back to top** and **Expanded chart + RTIC indicators** actions.
- Added quick-jump controls to the slide-out workspace menu for top, scan and expanded chart.
- The RTIC Indicators dock remains attached to expanded TradingView chart mode, updates after scans, and is draggable/collapsible.
- The real MACD and Stochastic momentum panel DOM (not a duplicate clone with duplicate element IDs) is moved into the expanded chart dock while focus mode is active, along with chart-open links and the symbol-entitlement note; all of these nodes are restored to their normal page position when leaving focus mode. This preserves their existing settings event handlers and plot ids.
- Source-level JavaScript syntax checks passed. Live browser interaction, mobile layout and provider scan behavior still need an on-device test.
