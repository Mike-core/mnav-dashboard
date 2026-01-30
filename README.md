# DAT mNAV Dashboard

A real-time dashboard for tracking the market Net Asset Value (mNAV) of Digital Asset Treasury (DAT) companies - public companies that hold Bitcoin as a treasury reserve asset.

## Live Demo

👉 [View Dashboard](https://mike-core.github.io/mnav-dashboard/)

## Features

- **Real-time Bitcoin Price** — Fetched from CoinGecko API, updates every minute
- - **Live Stock Prices** — Fetched from Yahoo Finance, updates every minute
  - - **Auto-Populated Shares Outstanding** — Automatically fetched from Yahoo Finance API with manual override capability
    - - **Manual Data Entry** — Enter company financials (BTC holdings, debt, etc.)
      - - **Automatic Calculations** — mNAV, Enterprise Value, Fair Stock Price, and more
        - - **Persistent Storage** — Data saves to browser localStorage automatically
          - - **Export/Import** — Backup and restore your data as JSON
            - - **Sortable Columns** — Click any column header to sort
              - - **mNAV Color Coding**:
                -   - 🟢 Green: < 1.0 (trading at discount to NAV)
                    -   - 🟡 Yellow: 1.0 - 1.5 (slight premium)
                        -   - 🔴 Red: > 1.5 (significant premium)
                         
                            - ## Shares Outstanding Feature
                         
                            - The dashboard automatically fetches shares outstanding data from the Yahoo Finance API, reducing manual data entry while maintaining full control over the values.
                         
                            - ### How It Works
                         
                            - 1. **Automatic Population**: When a company is added or the dashboard loads, shares outstanding is automatically fetched from Yahoo Finance
                              2. 2. **24-Hour Refresh**: API data is refreshed every 24 hours to keep values current
                                 3. 3. **Manual Override**: Click the shares outstanding cell to enter a custom value that overrides the API
                                    4. 4. **Reset to API**: After manually editing, click the reset icon (↻) to revert to the API-fetched value
                                      
                                       5. ### Visual Indicators
                                      
                                       6. The shares outstanding cell displays different indicators based on the data source:
                                      
                                       7. | Indicator | Meaning |
                                       8. |-----------|---------|
                                       9. | No badge | Value from Yahoo Finance API |
                                       10. | **M** badge (blue) | Manually entered value (overrides API) |
                                       11. | **⚠️** icon | Error fetching from API (hover for details) |
                                      
                                       12. ### Error Handling
                                      
                                       13. If the Yahoo Finance API fails to fetch shares outstanding:
                                       14. - A warning icon (⚠️) appears in the cell
                                           - - Hover over the icon to see the error message
                                             - - Click the retry button to attempt fetching again
                                               - - You can always enter a manual value as a fallback
                                                
                                                 - ### Data Persistence
                                                
                                                 - - **API values** are NOT saved to localStorage — they are re-fetched on each page load
                                                   - - **Manual overrides** ARE saved to localStorage and persist across sessions
                                                     - - **Export/Import** includes manual shares outstanding overrides (v2 format)
                                                      
                                                       - ## Tracked Companies
                                                      
                                                       - | Company | Ticker |
                                                       - |---------|--------|
                                                       - | Strategy | MSTR |
                                                       - | Twenty One Capital | XXI |
                                                       - | Bitcoin Standard Treasury | CEPO |
                                                       - | Bullish | BLSH |
                                                       - | Strive | ASST |
                                                       - | GD Culture Group | GDC |
                                                       - | Next Technology Holding | NXTT |
                                                       - | American Bitcoin | ABTC |
                                                       - | KindlyMD | NAKA |
                                                       - | Semler Scientific | SMLR |
                                                       - | ProCap BTC | BRR |
                                                       - | Empery Digital | EMPD |
                                                       - | Microcloud Hologram | HOLO |
                                                       - | Exodus Movement | EXOD |
                                                       - | Fold Holdings | FLD |
                                                       - | DDC Enterprise Limited | DDC |
                                                       - | KULR Technology | KULR |
                                                       - | Nano Labs | NA |
                                                       - | USBC | USBC |
                                                      
                                                       - ## Formulas
                                                      
                                                       - | Metric | Formula |
                                                       - |--------|---------|
                                                       - | Market Cap | Shares Outstanding × Stock Price |
                                                       - | Bitcoin Assets | BTC Holdings × Bitcoin Price |
                                                       - | Assets | Bitcoin Assets + Cash |
                                                       - | Debt | Long Term Debt + Other Debt |
                                                       - | Enterprise Value | Market Cap + Debt + Preferred Stock - Cash |
                                                       - | **mNAV** | Enterprise Value / Bitcoin Assets |
                                                       - | Market Cap / Assets | Market Cap / Assets |
                                                       - | Fair Stock Price | (Assets - Debt - Preferred Stock) / Market Cap |
                                                       - | Equilibrium BTC Price | Bitcoin Price × (Bitcoin Assets / Enterprise Value) |
                                                      
                                                       - ## Usage
                                                      
                                                       - ### Shares Outstanding
                                                      
                                                       - The shares outstanding field auto-populates from Yahoo Finance:
                                                      
                                                       - - **View Source**: Cells without a badge show API-fetched values; cells with an "M" badge show manual overrides
                                                         - - **Manual Entry**: Click any shares outstanding cell to enter a custom value
                                                           - - **Reset to API**: After editing, click the ↻ icon to restore the API value
                                                             - - **Error Recovery**: If API fails, hover over ⚠️ for details or click to retry
                                                              
                                                               - ### Manual Data Entry
                                                              
                                                               - Click any editable cell (highlighted on hover) to enter data:
                                                              
                                                               - - **Bitcoin (BTC)** — Total BTC holdings
                                                                 - - **Cash** — Cash and cash equivalents
                                                                   - - **Long Term Debt** — Bonds, convertible notes, etc.
                                                                     - - **Other Debt** — Short-term debt, other liabilities
                                                                       - - **Preferred Stock** — Preferred equity
                                                                        
                                                                         - ### Stock Price Override
                                                                        
                                                                         - If the API fails to fetch a stock price, click the Stock Price cell to enter manually. A yellow "M" badge indicates a manual override.
                                                                        
                                                                         - ### Export/Import
                                                                        
                                                                         - - **Export JSON** — Download all company data as a backup
                                                                           - - **Import JSON** — Restore data from a previous export
                                                                            
                                                                             - The export format (v2) includes:
                                                                             - - All company financial data
                                                                               - - Manual shares outstanding overrides
                                                                                 - - Manual stock price overrides
                                                                                   - - Timestamp and version information
                                                                                    
                                                                                     - Legacy v1 exports (without shares outstanding data) are still supported for import.
                                                                                    
                                                                                     - ## Technical Details
                                                                                    
                                                                                     - ### API Integration
                                                                                    
                                                                                     - | Data | Source | Refresh Rate |
                                                                                     - |------|--------|--------------|
                                                                                     - | Bitcoin Price | CoinGecko API | Every minute |
                                                                                     - | Stock Prices | Yahoo Finance | Every minute |
                                                                                     - | Shares Outstanding | Yahoo Finance | Every 24 hours |
                                                                                    
                                                                                     - ### Browser Storage
                                                                                    
                                                                                     - Data is automatically saved to browser localStorage:
                                                                                     - - Company financial data (BTC, cash, debt, etc.)
                                                                                       - - Manual shares outstanding overrides
                                                                                         - - Manual stock price overrides
                                                                                          
                                                                                           - Note: API-fetched values (shares outstanding from Yahoo Finance) are not persisted and are re-fetched on page load.
                                                                                          
                                                                                           - ## Development
                                                                                          
                                                                                           - ```bash
                                                                                             # Install dependencies
                                                                                             npm install

                                                                                             # Start development server
                                                                                             npm run dev

                                                                                             # Run tests
                                                                                             npm test

                                                                                             # Build for production
                                                                                             npm run build
                                                                                             ```

                                                                                             ## License

                                                                                             MIT
