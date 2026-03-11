import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    
    // For now, just return success
    return NextResponse.json({ success: true, message: "Transaction recorded" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process transaction" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ticker, shares, price, account, notes } = body;
    
    // Validate required fields
    if (!action || !ticker || !shares || !price || !account) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // In production, this would:
    // 1. Update portfolio.json
    // 2. Upload to Vercel Blob
    // 3. Trigger portfolio-manager.py script
    
    console.log("Transaction:", { action, ticker, shares, price, account, notes });
    
    return NextResponse.json({ 
      success: true, 
      message: "Transaction recorded",
      id: `txn-${Date.now()}`
    });
  } catch (error) {
    console.error("Failed to record transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record transaction" },
      { status: 500 }
    );
  }
}
