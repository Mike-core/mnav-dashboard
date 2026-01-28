# DAT mNAV Dashboard

A real-time dashboard for tracking the market Net Asset Value (mNAV) of Digital Asset Treasury (DAT) companies — public companies that hold Bitcoin as a treasury reserve asset.

## Live Demo

🔗 [View Dashboard](https://mike-core.github.io/mnav-dashboard/)

## Features

- **Real-time Bitcoin Price** — Fetched from CoinGecko API, updates every minute
- **Live Stock Prices** — Fetched from Yahoo Finance, updates every minute
- **Manual Data Entry** — Enter company financials (shares outstanding, BTC holdings, debt, etc.)
- **Automatic Calculations** — mNAV, Enterprise Value, Fair Stock Price, and more
- **Persistent Storage** — Data saves to browser localStorage automatically
- **Export/Import** — Backup and restore your data as JSON
- **Sortable Columns** — Click any column header to sort
- **mNAV Color Coding**:
  - 🟢 Green: < 1.0 (trading at discount to NAV)
  - 🟡 Yellow: 1.0 - 1.5 (slight premium)
  - 🔴 Red: > 1.5 (significant premium)

## Tracked Companies

| Company | Ticker |
|---------|--------|
| Strategy | MSTR |
| Twenty One Capital | XXI |
| Bitcoin Standard Treasury | CEPO |
| Bullish | BLSH |
| Strive | ASST |
| GD Culture Group | GDC |
| Next Technology Holding | NXTT |
| American Bitcoin | ABTC |
| KindlyMD | NAKA |
| Semler Scientific | SMLR |
| ProCap BTC | BRR |
| Empery Digital | EMPD |
| Microcloud Hologram | HOLO |
| Exodus Movement | EXOD |
| Fold Holdings | FLD |
| DDC Enterprise Limited | DDC |
| KULR Technology | KULR |
| Nano Labs | NA |
| USBC | USBC |

## Formulas

| Metric | Formula |
|--------|---------|
| Market Cap | Shares Outstanding × Stock Price |
| Bitcoin Assets | BTC Holdings × Bitcoin Price |
| Assets | Bitcoin Assets + Cash |
| Debt | Long Term Debt + Other Debt |
| Enterprise Value | Market Cap + Debt + Preferred Stock - Cash |
| **mNAV** | Enterprise Value / Bitcoin Assets |
| Market Cap / Assets | Market Cap / Assets |
| Fair Stock Price | (Assets - Debt - Preferred Stock) / Market Cap |
| Equilibrium BTC Price | Bitcoin Price × (Bitcoin Assets / Enterprise Value) |

## Usage

### Manual Data Entry

Click any editable cell (highlighted on hover) to enter data:
- **Shares Outstanding** — Total common shares
- **Bitcoin (BTC)** — Total BTC holdings
- **Cash** — Cash and cash equivalents
- **Other Assets** — Non-BTC, non-cash assets
- **Long Term Debt** — Bonds, convertible notes, etc.
- **Other Debt** — Short-term debt, other liabilities
- **Preferred Stock** — Preferred equity

### Stock Price Override

If the API fails to fetch a stock price, click the Stock Price cell to enter manually. A yellow "M" badge indicates manual override.

### Export/Import

- **Export JSON** — Download all company data as a backup
- **Import JSON** — Restore data from a previous export
- **Reset** — Clear all data and return to defaults

## Local Development

```bash
# Clone the repository
git clone https://github.com/Mike-core/mnav-dashboard.git
cd mnav-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Zustand** — State management
- **TanStack Table** — Table functionality
- **Vitest** — Testing

## Data Sources

- **Bitcoin Price**: [CoinGecko API](https://www.coingecko.com/api/documentation) (free tier)
- **Stock Prices**: Yahoo Finance (via CORS proxy)

## Disclaimer

⚠️ **This dashboard is for informational purposes only.**

- Data may be delayed or inaccurate
- Stock prices fetched via third-party proxy may fail
- Manual data entry is user's responsibility to verify
- Not financial advice — do your own research

## License

MIT License — feel free to fork and modify.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request
