#!/usr/bin/env python3
"""
Portfolio Tracker - Daily Price Update
- Fetch current prices from Yahoo Finance
- Update portfolio value and gains
- Save to Vercel Blob
"""

import os
import json
import yfinance as yf
from datetime import datetime

# Portfolio data structure
PORTFOLIO_FILE = "/Users/tomchen/.openclaw/workspace-chat/kanban-board/data/portfolio.json"

# Initial portfolio holdings (user needs to set this up)
DEFAULT_PORTFOLIO = {
    "lastUpdated": datetime.now().isoformat(),
    "holdings": [
        {
            "ticker": "SCHD",
            "name": "Schwab U.S. Dividend Equity ETF",
            "shares": 1500,  # User needs to input actual shares
            "avgCost": 79.47,  # Average cost per share
            "account": "IBKR Taxable"
        },
        {
            "ticker": "VTI",
            "name": "Vanguard Total Stock Market ETF",
            "shares": 400,
            "avgCost": 239.00,
            "account": "Fidelity Brokerage"
        },
        {
            "ticker": "JEPI",
            "name": "JPMorgan Equity Premium Income ETF",
            "shares": 1200,
            "avgCost": 65.75,
            "account": "Chase Investment"
        },
        {
            "ticker": "MSFT",
            "name": "Microsoft Corporation",
            "shares": 120,
            "avgCost": 344.17,
            "account": "IBKR Taxable"
        },
        {
            "ticker": "BND",
            "name": "Vanguard Total Bond Market ETF",
            "shares": 500,
            "avgCost": 85.00,
            "account": "Fidelity IRA"
        }
    ],
    "accounts": {
        "IBKR Taxable": {"value": 0, "change": 0},
        "Fidelity Brokerage": {"value": 0, "change": 0},
        "Fidelity IRA": {"value": 0, "change": 0},
        "Chase Investment": {"value": 0, "change": 0}
    }
}

def fetch_current_prices(tickers):
    """Fetch current prices from Yahoo Finance"""
    print(f"📈 Fetching prices for {len(tickers)} tickers...")
    
    prices = {}
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.fast_info
            current_price = float(info['lastPrice'])
            previous_close = float(info['previousClose'])
            change_percent = ((current_price - previous_close) / previous_close) * 100
            
            prices[ticker] = {
                "price": current_price,
                "previousClose": previous_close,
                "changePercent": change_percent
            }
            print(f"   ✅ {ticker}: ${current_price:.2f} ({change_percent:+.2f}%)")
        except Exception as e:
            print(f"   ❌ {ticker}: {e}")
            prices[ticker] = {"price": 0, "previousClose": 0, "changePercent": 0}
    
    return prices

def update_portfolio(portfolio, prices):
    """Update portfolio with current prices"""
    total_value = 0
    total_cost = 0
    account_values = {}
    
    for holding in portfolio["holdings"]:
        ticker = holding["ticker"]
        shares = holding["shares"]
        avg_cost = holding["avgCost"]
        account = holding["account"]
        
        # Get current price
        current_price = prices.get(ticker, {}).get("price", 0)
        
        # Calculate values
        market_value = shares * current_price
        cost_basis = shares * avg_cost
        gain_loss = market_value - cost_basis
        gain_loss_percent = (gain_loss / cost_basis) * 100 if cost_basis > 0 else 0
        
        # Update holding
        holding["currentPrice"] = current_price
        holding["marketValue"] = market_value
        holding["gainLoss"] = gain_loss
        holding["gainLossPercent"] = gain_loss_percent
        holding["weight"] = 0  # Will calculate after total
        
        # Update account totals
        if account not in account_values:
            account_values[account] = {"value": 0, "cost": 0}
        account_values[account]["value"] += market_value
        account_values[account]["cost"] += cost_basis
        
        total_value += market_value
        total_cost += cost_basis
    
    # Calculate weights
    for holding in portfolio["holdings"]:
        holding["weight"] = (holding["marketValue"] / total_value * 100) if total_value > 0 else 0
    
    # Update account summary
    portfolio["accounts"] = {}
    for account, values in account_values.items():
        account_change = ((values["value"] - values["cost"]) / values["cost"] * 100) if values["cost"] > 0 else 0
        portfolio["accounts"][account] = {
            "value": values["value"],
            "change": account_change
        }
    
    # Portfolio totals
    portfolio["totalValue"] = total_value
    portfolio["totalCost"] = total_cost
    portfolio["totalGainLoss"] = total_value - total_cost
    portfolio["totalGainLossPercent"] = ((total_value - total_cost) / total_cost * 100) if total_cost > 0 else 0
    portfolio["lastUpdated"] = datetime.now().isoformat()
    
    return portfolio

def main():
    print("=" * 60)
    print("💼 Portfolio Tracker - Daily Price Update")
    print("=" * 60)
    
    # Load or create portfolio
    if os.path.exists(PORTFOLIO_FILE):
        with open(PORTFOLIO_FILE, 'r') as f:
            portfolio = json.load(f)
        print(f"📂 Loaded portfolio from {PORTFOLIO_FILE}")
    else:
        portfolio = DEFAULT_PORTFOLIO
        print(f"⚠️  No portfolio file found, using default template")
        print(f"   Please edit {PORTFOLIO_FILE} with your actual holdings")
    
    # Get unique tickers
    tickers = list(set([h["ticker"] for h in portfolio["holdings"]]))
    
    # Fetch current prices
    prices = fetch_current_prices(tickers)
    
    # Update portfolio
    portfolio = update_portfolio(portfolio, prices)
    
    # Save updated portfolio
    with open(PORTFOLIO_FILE, 'w') as f:
        json.dump(portfolio, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved to {PORTFOLIO_FILE}")
    print(f"\n📊 Portfolio Summary:")
    print(f"   Total Value: ${portfolio['totalValue']:,.2f}")
    print(f"   Total Cost: ${portfolio['totalCost']:,.2f}")
    print(f"   Total Gain/Loss: ${portfolio['totalGainLoss']:,.2f} ({portfolio['totalGainLossPercent']:+.2f}%)")
    print(f"   Last Updated: {portfolio['lastUpdated']}")
    
    return portfolio

if __name__ == '__main__':
    main()
