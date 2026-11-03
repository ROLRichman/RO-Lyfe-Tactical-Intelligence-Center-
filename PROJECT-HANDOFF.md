# RO’Lyfe Tactical Intelligence Center — Project Handoff

**Repository:** https://github.com/ROLRichman/RO-Lyfe-Tactical-Intelligence-Center-
**Published workspace:** https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/
**Standalone RTIC scanner:** https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/rtic-scanner.js/
**Implementation branch:** `feature/rol-scanner-directory-links`
**Updated:** November 2, 2026

## Scanner architecture

- Root Tactical Intelligence Center is the full market workspace: scanner, multi-timeframe chart, technical studies, trade map, risk sizing, ladder, journal and review.
- `rtic-scanner.js/index.html` is the focused standalone RTIC Live Scanner. It contains stock/crypto universe controls, Live Scan, chart, market-data settings and the trade/risk workflow.
- `js/rtic-data-engine.js` remains the provider/data-engine code. The directory only routes to existing scanners; no engine is copied.
- Standalone scanner now supports `?embed=desk` for the Live Chart Desk and sends responsive height messages to its host frame.
- Scanner Directory has been added inside the existing workspace sidebar and standalone scanner header; it avoids new floating overlays.

## Connected scanner workspaces

| Workspace | Purpose | Link |
|---|---|---|
| Tactical RTIC Live Scanner | Stock / crypto scanner, chart and risk ladder | https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/rtic-scanner.js/ |
| Live Chart Desk Watchlist Scanner | Scans the selected Live Desk watchlist and loads results into its chart | https://rolrichman.github.io/RO-Lyfe-Trading-Intelligence-Classroom/live-chart-desk/#symbol-scanner |
| Sports Center Sector Scanner & Chart Lab | 17-sector scanner and 14 RTIC indicator panels | https://rolrichman.github.io/RO-Lyfe-Live-Sports-Center/?embed=market-lab |
| Market Terminal | Multi-asset scanner and chart workflow | https://rolrichman.github.io/rolyfe-market-terminal/ |
| Trading Calculator Pro | Module directory; dedicated scanner files are empty placeholders | https://rolrichman.github.io/ROlyfe-Trading-Calculator-Pro/ |
| Classroom Market Room | Practice chart and risk worksheet, not a live scanner | https://rolrichman.github.io/RO-Lyfe-Trading-Intelligence-Classroom/#market-room |

## Data integrity

- Provider-backed scans depend on market-data coverage, credentials, exchange entitlement and the provider response. No missing candles, quote values, scan scores or indicators should be fabricated.
- Watchlists and settings do not automatically synchronize between the independent sites unless a documented connection exists.
- Educational research only; not an investment recommendation, broker or order-execution connection.

## Branch update

Adds a sidebar Scanner Directory, the same directory in the focused scanner page, responsive embed mode, static tests and a GitHub Actions check. Preserves the existing scan engine, indicators, settings, trade map and user-owned links.

**Status:** Pending CI and review. Not merged or deployed.
