# FinancialData.Net API — RO’Lyfe Integration Checklist

## Current status

- FinancialData.Net replied to Richardson's API inquiry and shared the public `fdnpy` SDK.
- An account and API key have **not been confirmed**.
- The Tactical Intelligence Center currently calls the RO’Lyfe Supabase Edge Function layer for configured providers such as Tickerbot, Finnhub, Alpha Vantage, and CoinGecko.
- FinancialData.Net is currently listed as a research resource only. It is **not yet connected to the live scanner**.

## 1. Create the account and locate the key

1. Visit https://financialdata.net/sign-up and create an account.
2. Review https://financialdata.net/pricing before selecting a paid plan.
3. Sign in and open https://financialdata.net/dashboard.
4. Copy the API key into a secure password manager or directly into the Supabase secret configuration in a later integration step. Do not put it in a public GitHub file, HTML, JavaScript, screenshots, or a chat message.
5. Verify which endpoints are available under the selected plan in https://financialdata.net/documentation.

The provider's documentation advertises up to 300 requests/day on its free subscription. Its current endpoint documentation marks daily historical stock prices as free and latest one-minute prices as Premium. Access varies by endpoint, so confirm the specific coverage before relying on it.

## 2. What RO’Lyfe needs to connect it safely

The planned integration should follow the existing architecture:

- Browser UI calls the RO’Lyfe Supabase Edge Function.
- The Edge Function reads a server-side secret such as `FINANCIALDATA_API_KEY`.
- The Edge Function requests only the supported FinancialData.Net endpoint(s), validates and normalizes the response, and returns a minimal response to the browser.
- The frontend converts normalized OHLCV bars into the existing RTIC scanner format so the current indicators and score can be reused.
- The browser never receives the provider's secret key.

The secret name above is a proposed name, not a secret that has already been created. The Edge Function implementation and provider status reporting still need to be updated before this provider can be selected for a scan.

## 3. First test to run

Start with one liquid stock symbol (for example, SPY or AAPL) and daily historical OHLCV data. Compare the returned date, open, high, low, close, and volume against a trusted chart for the same session. Then verify:

- timestamp and timezone handling;
- split adjustment and missing-bar behavior;
- rate limits and error responses;
- whether the required intraday interval and lookback are included in the plan;
- data licensing and display permissions for the intended use.

Do not label data “real-time” unless the endpoint, subscription, exchange coverage, and timestamps support that claim.

## 4. Options-data limitation

The email mentions options coverage, but that alone does not confirm that the selected plan returns a complete, sufficiently current options chain with expirations, strikes, bid/ask, volume, open interest, and Greeks. Confirm those fields and entitlements separately before using this provider for option-selection or contract-level calculations.

## 5. Official resources

- Account: https://financialdata.net/sign-up
- Dashboard / API key: https://financialdata.net/dashboard
- Documentation: https://financialdata.net/documentation
- Pricing: https://financialdata.net/pricing
- Python SDK: https://github.com/financialdatanet/fdnpy

**Safety rule:** never commit a live API key to GitHub. If a key is ever exposed in a public file or message, revoke it and generate a replacement.
