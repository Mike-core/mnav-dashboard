import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { useBitcoinPrice } from './hooks/useBitcoinPrice';
import { useStockPrices } from './hooks/useStockPrices';
import './App.css';

function App() {
  // Initialize API polling
  useBitcoinPrice();
  useStockPrices();

  return (
    <div className="app">
      <Header />
      <main>
        <Dashboard />
      </main>
      <footer className="footer">
        <p>
          Data sources: Bitcoin price from CoinGecko • Stock prices from Yahoo Finance
        </p>
        <p>
          <strong>Disclaimer:</strong> This dashboard is for informational purposes only. 
          Not financial advice. Data may be delayed or inaccurate.
        </p>
      </footer>
    </div>
  );
}

export default App;
