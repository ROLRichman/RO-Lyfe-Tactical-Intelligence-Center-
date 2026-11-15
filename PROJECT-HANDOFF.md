# RO’Lyfe Tactical Intelligence Center — Project Handoff

**Repository:** https://github.com/ROLRichman/RO-Lyfe-Tactical-Intelligence-Center-
**Published workspace:** https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/
**Standalone RTIC scanner:** https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/rtic-scanner.js/
**Default branch:** `main`
**Updated:** November 2, 2026

## Workspace architecture

- Root Tactical Intelligence Center is the full market workspace: scanner, multi-timeframe chart, technical studies, trade map, risk sizing, ladder, journal and review.
- `rtic-scanner.js/index.html` is the focused standalone RTIC Live Scanner. It contains stock/crypto universe controls, Live Scan, chart, market-data settings and the trade/risk workflow.
- `js/rtic-data-engine.js` remains the secure provider/data-engine code used by the full workspace. The directory routes to existing scanners; it does not clone their scan engines.
- Existing project links and the sidebar Scanner Directory are preserved.

## Connected scanner workspaces

| Workspace | Purpose | Link |
|---|---|---|
| Tactical RTIC Live Scanner | Stock / crypto scanner, chart and risk ladder | https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/rtic-scanner.js/ |
| Live Chart Desk Watchlist Scanner | Selected Live Desk watchlist and chart | https://rolrichman.github.io/RO-Lyfe-Trading-Intelligence-Classroom/live-chart-desk/#symbol-scanner |
| Sports Center Sector Scanner & Chart Lab | Sector scan and RTIC indicator panels | https://rolrichman.github.io/RO-Lyfe-Live-Sports-Center/?embed=market-lab |
| Market Terminal | Multi-asset scanner and chart workflow | https://rolrichman.github.io/rolyfe-market-terminal/ |
| Trading Calculator Pro | Scanner directory and module status | https://rolrichman.github.io/ROlyfe-Trading-Calculator-Pro/ |
| Classroom Market Room | Educational practice chart and risk worksheet | https://rolrichman.github.io/RO-Lyfe-Trading-Intelligence-Classroom/#market-room |

## Shared page-language system

- Root Tactical workspace and standalone RTIC scanner include the global RO’Lyfe page-language selector: English, Spanish, French, Haitian Creole and Portuguese.
- The selector translates eligible interface copy across the entire page, including headings, navigation, buttons, form labels, placeholders, instructions, statuses and accessible labels.
- A visitor's selection is saved as `rolyfe-translate-language`; all RO’Lyfe GitHub Pages projects on `rolrichman.github.io` share the same browser origin and preference.
- Dynamic UI text is observed and translated as new controls or statuses appear.
- Live quotes, prices, tickers, numeric values, calculated results, chart canvases and embedded TradingView/chart content are excluded. The translation service is not allowed to change market data or calculations.
- The page translator uses the `rol-page-translate` Supabase Edge Function in the active Trading Intelligence Classroom project. It requires the server-side `OPENAI_API_KEY`; the key is never placed in page code.

## Data integrity and refresh behavior

- Provider-backed scans depend on market-data coverage, credentials, exchange entitlement and provider response. Never fabricate missing candles, quote values, scores or indicators.
- Standalone stock scans require a Finnhub key. Without the key, stock-only auto-refresh pauses with a clear status rather than repeatedly reporting a blocked scan.
- Crypto scanning remains available without a stock API key and can auto-refresh when Crypto is selected.
- In combined mode without a Finnhub key, crypto results can still load while stock scanning is clearly marked as skipped.
- Watchlists and settings do not automatically synchronize between independent apps except for the shared browser language preference.
- Educational research only; not investment advice, broker connectivity or order execution.

## Maintenance

Run `node --test tests/scanner-directory.test.mjs` for navigation, embed and translator checks. Preserve existing engines, dated backups and mobile menu navigation.
