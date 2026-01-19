/**
 * Pure calculation functions for mNAV Dashboard
 * All functions return number | null
 * null indicates insufficient data to calculate
 */

// Market Capitalization = Common Shares Outstanding × Stock Price
export function calcMarketCap(
  shares: number | null,
  price: number | null
): number | null {
  if (shares === null || price === null) return null;
  return shares * price;
}

// Bitcoin Assets = Bitcoin × Bitcoin Price
export function calcBitcoinAssets(
  btc: number | null,
  btcPrice: number | null
): number | null {
  if (btc === null || btcPrice === null) return null;
  return btc * btcPrice;
}

// Assets = Bitcoin Assets + Cash + Other Assets
export function calcAssets(
  btcAssets: number | null,
  cash: number | null,
  otherAssets: number | null
): number | null {
  if (btcAssets === null) return null;
  return btcAssets + (cash ?? 0) + (otherAssets ?? 0);
}

// Debt = Long Term Debt + Other Debt
export function calcDebt(
  longTermDebt: number | null,
  otherDebt: number | null
): number | null {
  return (longTermDebt ?? 0) + (otherDebt ?? 0);
}

// Enterprise Value = Market Cap + Debt + Preferred Stock - Cash
export function calcEnterpriseValue(
  marketCap: number | null,
  debt: number | null,
  preferredStock: number | null,
  cash: number | null
): number | null {
  if (marketCap === null) return null;
  return marketCap + (debt ?? 0) + (preferredStock ?? 0) - (cash ?? 0);
}

// mNAV = Enterprise Value / Bitcoin Assets
export function calcMNAV(
  enterpriseValue: number | null,
  btcAssets: number | null
): number | null {
  if (enterpriseValue === null || btcAssets === null || btcAssets === 0) return null;
  return enterpriseValue / btcAssets;
}

// Market Cap / Assets = Market Capitalization / Assets
export function calcMarketCapToAssets(
  marketCap: number | null,
  assets: number | null
): number | null {
  if (marketCap === null || assets === null || assets === 0) return null;
  return marketCap / assets;
}

// Fair Stock Price = ((Assets - Debt - Preferred Stock) / Market Capitalization) * Stock Price
export function calcFairStockPrice(
    assets: number | null,
    debt: number | null,
    preferredStock: number | null,
    marketCap: number | null,
    stockPrice: number | null
  ): number | null {
    if (assets === null || marketCap === null || marketCap === 0 || stockPrice === null) return null;
    return ((assets - (debt ?? 0) - (preferredStock ?? 0)) / marketCap) * stockPrice;
}

// Fair BTC Stock Price = (Bitcoin Assets - Long Term Debt - Preferred Stock) / Market Capitalization
export function calcFairBTCStockPrice(
  btcAssets: number | null,
  longTermDebt: number | null,
  preferredStock: number | null,
  marketCap: number | null
): number | null {
  if (btcAssets === null || marketCap === null || marketCap === 0) return null;
  return (btcAssets - (longTermDebt ?? 0) - (preferredStock ?? 0)) / marketCap;
}

// Equilibrium BTC Price = Bitcoin Price × (Bitcoin Assets / Enterprise Value)
export function calcEquilibriumBTCPrice(
  btcPrice: number | null,
  btcAssets: number | null,
  enterpriseValue: number | null
): number | null {
  if (btcPrice === null || btcAssets === null || enterpriseValue === null || enterpriseValue === 0) return null;
  return btcPrice * (btcAssets / enterpriseValue);
}

// Calculate all fields for a company
export interface CalculationInputs {
  commonSharesOutstanding: number | null;
  bitcoin: number | null;
  cash: number | null;
  otherAssets: number | null;
  longTermDebt: number | null;
  otherDebt: number | null;
  preferredStock: number | null;
  stockPrice: number | null;
  bitcoinPrice: number | null;
}

export interface CalculationOutputs {
  marketCap: number | null;
  bitcoinAssets: number | null;
  assets: number | null;
  debt: number | null;
  enterpriseValue: number | null;
  mNAV: number | null;
  marketCapToAssets: number | null;
  fairStockPrice: number | null;
  fairBTCStockPrice: number | null;
  equilibriumBTCPrice: number | null;
}

export function calculateAll(inputs: CalculationInputs): CalculationOutputs {
  const marketCap = calcMarketCap(inputs.commonSharesOutstanding, inputs.stockPrice);
  const bitcoinAssets = calcBitcoinAssets(inputs.bitcoin, inputs.bitcoinPrice);
  const assets = calcAssets(bitcoinAssets, inputs.cash, inputs.otherAssets);
  const debt = calcDebt(inputs.longTermDebt, inputs.otherDebt);
  const enterpriseValue = calcEnterpriseValue(marketCap, debt, inputs.preferredStock, inputs.cash);
  const mNAV = calcMNAV(enterpriseValue, bitcoinAssets);
  const marketCapToAssets = calcMarketCapToAssets(marketCap, assets);
  const fairStockPrice = calcFairStockPrice(assets, debt, inputs.preferredStock, marketCap, inputs.stockPrice);  const fairBTCStockPrice = calcFairBTCStockPrice(bitcoinAssets, inputs.longTermDebt, inputs.preferredStock, marketCap);
  const equilibriumBTCPrice = calcEquilibriumBTCPrice(inputs.bitcoinPrice, bitcoinAssets, enterpriseValue);

  return {
    marketCap,
    bitcoinAssets,
    assets,
    debt,
    enterpriseValue,
    mNAV,
    marketCapToAssets,
    fairStockPrice,
    fairBTCStockPrice,
    equilibriumBTCPrice,
  };
}
