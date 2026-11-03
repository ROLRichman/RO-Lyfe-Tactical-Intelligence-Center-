# RO’Lyfe Tactical Intelligence Center — Project Handoff

**Repository:** https://github.com/ROLRichman/RO-Lyfe-Tactical-Intelligence-Center-
**Published workspace:** https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/
**Standalone RTIC scanner:** https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/rtic-scanner.js/
**Active implementation branch:** `feature/rol-scanner-directory-links`
**Updated:** November 2, 2026

## Scanner architecture

- The root Tactical Intelligence Center is the full workspace: market scanner, multi-timeframe chart, technical studies, trade map, risk sizing, ladder, journal and review.
- `rtic-scanner.js/index.html` is the focused standalone RTIC Live Scanner. It includes stock/crypto universe controls, live scan, chart, market data settings, trade planning and risk controls.
- `js/rtic-data-engine.js` is shared provider/data-engine logic used by the existing RTIC experience and Market Lab connection. The Scanner Directory is navigation to existing apps; it does not clone a scanner engine.
- The standalone scanner now supports `?embed=desk` for the Live Chart Desk. It keeps the scanner controls visible and sends responsive height messages to the parent frame.
- A Scanner Directory was added inside the existing workspace sidebar, respecting the existing navigation pattern and avoiding floating overlays. A matching dropdown is available in the focused scanner page.

## Connected RO’Lyfe scanners

| Workspace | Purpose | Link |
|---|---|---|
| Tactical RTIC Live Scanner | Stock/crypto scanner and risk/ladder workflow | https://rolrichman.github.io/RO-Lyfe-Tactical-Intelligence-Center-/rtic-scanner.js/ |
| Live Chart Desk Watchlist Scanner | Existing selected-watchlist scanner feeding its chart | https://rolrichman.github.io/RO-Lyfe-Trading-Intelligence-Classroom/live-chart-desk/#symbol-scanner |
| Sports Center Sector Scanner & Chart Lab | 17-sector scan and 14 RTIC indicator panels | https://rolrichman.github.io/RO-Lyfe-Live-Sports-Center/?embed=market-lab |
| Market Terminal | Multi-asset scanner, watchlist and charts | https://rolrichman.github.io/rolyfe-market-terminal/ |
| Trading Calculator Pro | Scanner module roadmap; current module files are empty placeholders | https://rolrichman.github.io/ROlyfe-Trading-Calculator-Pro/ |
| Classroom Market Room | Educational practice chart / risk worksheet, not a live scanner | https://rolrichman.github.io/RO-Lyfe-Trading-Intelligence-Classroom/#market-room |

## Data and safety notes

- A provider-backed scan is only as current as the provider response, symbol coverage, permissions and market session. A key saved in browser settings is not a substitute for provider authorization or a live feed guarantee.
- Do not invent missing candles, quote values, scan scores or indicators. Show unavailable when source bars are absent.
- This system is educational/research tooling, not a broker, investment recommendation or order-execution system.
- Scanner directory links do not transfer user data or synchronize watchlists between sites; those are independent apps unless a documented connection exists.

## Changes in this branch

- Add a cross-project Scanner Directory to the existing Tactical workspace sidebar.
- Add the same directory to the standalone RTIC scanner.
- Add compact embedded mode and responsive height messaging for the Tactical scanner inside Live Chart Desk.
- Preserve all existing scanner logic, settings, watchlists, workspaces, trading controls and user-owned project links.

**Status:** Pending CI and review. Do not merge/deploy this feature branch until the browser checks have passed and the user approves.
