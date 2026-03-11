#!/usr/bin/env python3
"""
Portfolio Manager - Upload to Blob & Manage Transactions
- Upload portfolio data to Vercel Blob
- Add/edit transactions with notes
- Fetch real-time prices and update portfolio
"""

import os
import json
import yfinance as yf
import requests
from datetime import datetime

# Configuration
PORTFOLIO_FILE = "/Users/tomchen/.openclaw/workspace-chat/kanban-board/data/portfolio.json"
BLOB_TOKEN = os.getenv("VERCEL_BLOB_TOKEN", "vercel_blob_rw_UGYia2hNbv7cqrOg_76GyC4nYKGX3jpidMeAiDUEFW4pwVr")
BLOB_URL = "https://ugyia2hnbv7cqrog.private.blob.vercel-storage.com/portfolio/holdings.json"

def load_portfolio():
    """Load portfolio from file"""
    if os.path.exists(PORTFOLIO_FILE):
        with open(PORTFOLIO_FILE, 'r') as f:
            return json.load(f)
    return None

def save_portfolio(data):
    """Save portfolio to file"""
    data['lastUpdated'] = datetime.now().isoformat()
    with open(PORTFOLIO_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved to {PORTFOLIO_FILE}")

def upload_to_blob(data):
    """Upload portfolio to Vercel Blob"""
    print(f"📤 Uploading to Vercel Blob...")
    
    try:
        response = requests.put(
            BLOB_URL,
            headers={
                "Authorization": f"Bearer {BLOB_TOKEN}",
                "Content-Type": "application/json"
            },
            data=json.dumps(data, indent=2, ensure_ascii=False)
        )
        
        if response.status_code == 200:
            print(f"✅ Uploaded to Blob: {BLOB_URL}")
            return True
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(response.text[:200])
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def fetch_prices(tickers):
    """Fetch current prices from Yahoo Finance"""
    print(f"📈 Fetching prices for {len(tickers)} tickers...")
    prices = {}
    
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            info = stock.fast_info
            prices[ticker] = {
                "price": float(info['lastPrice']),
                "previousClose": float(info['previousClose']),
                "changePercent": ((float(info['lastPrice']) - float(info['previousClose'])) / float(info['previousClose'])) * 100
            }
            print(f"   ✅ {ticker}: ${prices[ticker]['price']:.2f} ({prices[ticker]['changePercent']:+.2f}%)")
        except Exception as e:
            print(f"   ❌ {ticker}: {e}")
            prices[ticker] = {"price": 0, "previousClose": 0, "changePercent": 0}
    
    return prices

def update_portfolio_with_prices(portfolio, prices):
    """Update portfolio values with current prices"""
    total_value = 0
    total_cost = 0
    account_values = {}
    
    for holding in portfolio["holdings"]:
        ticker = holding["ticker"]
        shares = holding["shares"]
        avg_cost = holding["avgCost"]
        account = holding["account"]
        
        current_price = prices.get(ticker, {}).get("price", 0)
        market_value = shares * current_price
        cost_basis = shares * avg_cost
        gain_loss = market_value - cost_basis
        gain_loss_percent = (gain_loss / cost_basis * 100) if cost_basis > 0 else 0
        
        holding["currentPrice"] = current_price
        holding["marketValue"] = market_value
        holding["gainLoss"] = gain_loss
        holding["gainLossPercent"] = gain_loss_percent
        holding["weight"] = 0
        
        if account not in account_values:
            account_values[account] = {"value": 0, "cost": 0}
        account_values[account]["value"] += market_value
        account_values[account]["cost"] += cost_basis
        
        total_value += market_value
        total_cost += cost_basis
    
    for holding in portfolio["holdings"]:
        holding["weight"] = (holding["marketValue"] / total_value * 100) if total_value > 0 else 0
    
    portfolio["accounts"] = {}
    for account, values in account_values.items():
        account_change = ((values["value"] - values["cost"]) / values["cost"] * 100) if values["cost"] > 0 else 0
        portfolio["accounts"][account] = {"value": values["value"], "change": account_change}
    
    portfolio["totalValue"] = total_value
    portfolio["totalCost"] = total_cost
    portfolio["totalGainLoss"] = total_value - total_cost
    portfolio["totalGainLossPercent"] = ((total_value - total_cost) / total_cost * 100) if total_cost > 0 else 0
    
    return portfolio

def add_transaction(portfolio, action, ticker, shares, price, account, notes=""):
    """Add a new transaction with notes"""
    amount = shares * price
    txn_id = f"txn-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    transaction = {
        "id": txn_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "action": action,
        "ticker": ticker,
        "shares": shares,
        "price": price,
        "amount": amount,
        "account": account,
        "notes": notes
    }
    
    portfolio["transactions"].append(transaction)
    print(f"✅ Added transaction: {action} {shares} {ticker} @ ${price:.2f}")
    print(f"   Notes: {notes}")
    
    return portfolio

def show_summary(portfolio):
    """Show portfolio summary"""
    print("\n💼 Portfolio Summary")
    print("=" * 60)
    print(f"Total Value: ${portfolio['totalValue']:,.2f}")
    print(f"Total Cost: ${portfolio['totalCost']:,.2f}")
    print(f"Total Gain/Loss: ${portfolio['totalGainLoss']:,.2f} ({portfolio['totalGainLossPercent']:+.2f}%)")
    print(f"\n📊 Holdings ({len(portfolio['holdings'])}):")
    for h in portfolio['holdings']:
        print(f"   {h['ticker']}: {h['shares']} shares @ ${h['currentPrice']:.2f} = ${h['marketValue']:,.2f} ({h['gainLossPercent']:+.2f}%)")
    print(f"\n📝 Recent Transactions ({len(portfolio['transactions'])}):")
    for txn in portfolio['transactions'][-5:]:
        print(f"   {txn['date']}: {txn['action']} {txn['shares']} {txn['ticker']} @ ${txn['price']:.2f} - {txn['notes'][:50]}")
    print(f"\n🕐 Last Updated: {portfolio['lastUpdated']}")

def main():
    import sys
    
    portfolio = load_portfolio()
    if not portfolio:
        print("❌ No portfolio file found")
        return
    
    if len(sys.argv) < 2:
        # Default: update prices and upload
        tickers = [h["ticker"] for h in portfolio["holdings"]]
        prices = fetch_prices(tickers)
        portfolio = update_portfolio_with_prices(portfolio, prices)
        save_portfolio(portfolio)
        upload_to_blob(portfolio)
        show_summary(portfolio)
    
    elif sys.argv[1] == "upload":
        upload_to_blob(portfolio)
    
    elif sys.argv[1] == "update":
        tickers = [h["ticker"] for h in portfolio["holdings"]]
        prices = fetch_prices(tickers)
        portfolio = update_portfolio_with_prices(portfolio, prices)
        save_portfolio(portfolio)
        show_summary(portfolio)
    
    elif sys.argv[1] == "add" and len(sys.argv) >= 7:
        action = sys.argv[2]
        ticker = sys.argv[3]
        shares = float(sys.argv[4])
        price = float(sys.argv[5])
        account = sys.argv[6]
        notes = " ".join(sys.argv[7:]) if len(sys.argv) > 7 else ""
        
        portfolio = add_transaction(portfolio, action, ticker, shares, price, account, notes)
        save_portfolio(portfolio)
        upload_to_blob(portfolio)
    
    elif sys.argv[1] == "summary":
        show_summary(portfolio)
    
    else:
        print("Usage:")
        print("  python3 portfolio-manager.py              # Update prices + upload")
        print("  python3 portfolio-manager.py upload       # Upload to Blob")
        print("  python3 portfolio-manager.py update       # Update prices only")
        print("  python3 portfolio-manager.py summary      # Show summary")
        print("  python3 portfolio-manager.py add <action> <ticker> <shares> <price> <account> [notes]")
        print("    Example: python3 portfolio-manager.py buy SCHD 100 30.99 'IBKR Taxable' 'Added on weakness'")

if __name__ == '__main__':
    main()
