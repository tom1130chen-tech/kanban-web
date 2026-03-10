"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Board, type BoardStatus } from "../components/board/Board";
import { Button } from "../components/ui/Button";

// Newsletter digest data - fallback if Blob is empty
import newsletterData from "../data/newsletter-digest.json";

interface NewsletterArticle {
  digestDate: string;
  article: {
    title: string;
    subtitle?: string;
    content: string;
    author?: string;
    sources: Array<{ name: string; url: string; summary?: string; type?: string }>;
    tags?: string[];
  };
  metadata: {
    wordCount: number;
    readTime: string;
    language: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
}

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  source?: string;
}

// Full Calendar + Todo View Component (for TODO tab)
function TodoCalendarFullView() {
  const [data, setData] = useState<{ calendarEvents: CalendarEvent[]; todos: TodoItem[]; lastUpdated: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar-todo")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading calendar and todos...</p>
      </div>
    );
  }

  const calendarEvents = data?.calendarEvents || [];
  const todos = data?.todos || [];
  const lastUpdated = data?.lastUpdated || new Date().toISOString();

  // Group events by date for next 3 days
  const next3Days = getNext3Days();
  const eventsByDate = calendarEvents.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const timeSlots = getTimeSlots();

  return (
    <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
      {/* Calendar - Left 2/3 */}
      <div className="col-span-2 bg-white rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-xl border-2 border-dashed border-gray-400 overflow-hidden flex flex-col">
        {/* Calendar Header - 3 Days */}
        <div className="grid grid-cols-3 border-b-2 border-dashed border-gray-300">
          {next3Days.map((day) => (
            <div
              key={day.date}
              className={`p-4 text-center border-r-2 border-dashed border-gray-200 last:border-r-0 ${
                day.isToday ? 'bg-[var(--accent)]/10' : ''
              }`}
            >
              <div className="text-sm font-handwritten text-gray-500 uppercase tracking-wide">
                {day.display.split(',')[0]}
              </div>
              <div className={`text-2xl font-bold mt-1 ${
                day.isToday ? 'text-[var(--accent)]' : 'text-gray-900'
              }`}>
                {day.display.split(',')[1]}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Grid with Time Slots */}
        <div className="flex-1 overflow-auto relative">
          <div className="flex min-h-[960px]">
            {/* Time Column */}
            <div className="w-20 flex-shrink-0 border-r-2 border-dashed border-gray-200 bg-gray-50">
              {timeSlots.map((time, idx) => (
                <div key={idx} className="h-[60px] text-xs text-gray-400 text-right pr-2 pt-2">
                  {time}
                </div>
              ))}
            </div>

            {/* 3 Day Columns */}
            <div className="flex-1 grid grid-cols-3">
              {next3Days.map((day) => {
                const dayEvents = eventsByDate[day.date] || [];
                return (
                  <div
                    key={day.date}
                    className={`relative border-r-2 border-dashed border-gray-200 last:border-r-0 ${
                      day.isToday ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Hour Lines */}
                    {timeSlots.map((_, idx) => (
                      <div key={idx} className="h-[60px] border-b border-dashed border-gray-100" />
                    ))}

                    {/* Events */}
                    {dayEvents.map((event) => {
                      const { top, height } = getEventPosition(event.time);
                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 p-2 rounded-[18px] border-2 border-dashed cursor-pointer transition-all hover:shadow-lg"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: day.isToday 
                              ? 'rgba(45, 93, 161, 0.1)' 
                              : 'rgba(255, 77, 77, 0.1)',
                            borderColor: day.isToday 
                              ? 'var(--blue)' 
                              : 'var(--accent)',
                          }}
                        >
                          <div className="font-handwritten text-sm text-gray-900 truncate">
                            {event.title}
                          </div>
                          {event.time && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {event.time}
                            </div>
                          )}
                          {event.description && (
                            <div className="text-xs text-gray-400 mt-1 truncate">
                              {event.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* To Do - Right 1/3 */}
      <div className="bg-white rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-xl border-2 border-dashed border-gray-400 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-handwritten flex items-center gap-2">
            <span>✅</span> To Do
          </h2>
          <span className="text-xs text-gray-400">{todos.length} tasks</span>
        </div>
        
        {todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500">No tasks yet</p>
            <p className="text-sm text-gray-400 mt-2">Ask Chat to add some!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`group p-4 rounded-[225px_18px_255px_18px/18px_255px_18px_225px] border-2 transition-all ${
                  todo.completed
                    ? "bg-gray-100 border-gray-300 border-dashed"
                    : "bg-white border-gray-400 border-dashed hover:border-[var(--accent)] hover:shadow-md cursor-pointer"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    todo.completed
                      ? "border-gray-400 bg-gray-400"
                      : "border-gray-400 group-hover:border-[var(--accent)]"
                  }`}>
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm ${
                        todo.completed ? "text-gray-500 line-through" : "text-gray-900 font-handwritten"
                      }`}
                    >
                      {todo.title}
                    </div>
                    {todo.source && (
                      <div className="text-xs text-gray-400 mt-1">
                        via {todo.source}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Todo + Calendar Tab Component removed - replaced with TodoCalendarFullView

// Helper functions for calendar view
function getNext3Days() {
  const days = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      full: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      isToday: i === 0,
    });
  }
  return days;
}

function getTimeSlots() {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    slots.push(`${h} ${ampm}`);
  }
  return slots;
}

function getEventPosition(time?: string) {
  if (!time) return { top: 0, height: 40 };
  const [timeStr, ampm] = time.split(' ');
  let hour = parseInt(timeStr);
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  
  const top = (hour - 6) * 60;
  return { top, height: 50 };
}

const tabs = [
  { id: "board", label: "KANBAN", title: "Project board" },
  { id: "todo", label: "TO DO + CALENDAR", title: "Schedule + tasks" },
  { id: "news", label: "DAILY NEWS", title: "Signals + headlines" },
  { id: "finance", label: "FINANCIAL WATCH", title: "Markets + liquidity" },
  { id: "focus", label: "FOCUS", title: "Rituals" },
];

const financeWatch = [
  { id: "fin-01", label: "Liquidity", value: "Stable", detail: "Tier-one funds holding steady." },
  { id: "fin-02", label: "Currency", value: "USD strength", detail: "Dollar index up 0.4% week-over-week." },
  { id: "fin-03", label: "Signals", value: "Monitoring", detail: "Tracking cost-of-capital and platform rents." },
];

const focusRituals = [
  "Single-task on sprint priority for 90 minutes.",
  "Silence notifications between 10 AM and 12 PM.",
  "Daily recap with a teammate at 5 PM.",
];

// Financial Watch Component
function FinancialWatchView() {
  const portfolioTrend = [55, 58, 57, 61, 64, 68, 66, 71, 73, 75, 79, 82];
  const max = Math.max(...portfolioTrend);
  const min = Math.min(...portfolioTrend);
  const points = portfolioTrend
    .map((value, index) => {
      const x = (index / (portfolioTrend.length - 1)) * 100;
      const y = 100 - ((value - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const holdings = [
    { ticker: "SCHD", name: "Schwab U.S. Dividend Equity ETF", account: "IBKR Taxable", value: "$128,400", cost: "$119,200", change: "+7.7%", weight: "26.8%" },
    { ticker: "VTI", name: "Vanguard Total Stock Market ETF", account: "Fidelity Brokerage", value: "$102,850", cost: "$95,600", change: "+7.6%", weight: "21.5%" },
    { ticker: "JEPI", name: "JPMorgan Equity Premium Income ETF", account: "Chase Investment", value: "$74,300", cost: "$78,900", change: "-5.8%", weight: "15.5%" },
    { ticker: "MSFT", name: "Microsoft", account: "IBKR Taxable", value: "$52,600", cost: "$41,300", change: "+27.4%", weight: "11.0%" },
    { ticker: "BND", name: "Vanguard Total Bond Market ETF", account: "Fidelity IRA", value: "$41,900", cost: "$42,500", change: "-1.4%", weight: "8.8%" },
  ];

  const recentTrades = [
    { date: "Mar 8", action: "Buy", ticker: "SCHD", account: "IBKR Taxable", amount: "$4,200", note: "Added on weakness after yield moved up." },
    { date: "Mar 5", action: "Sell", ticker: "TSLA", account: "Fidelity Brokerage", amount: "$3,850", note: "Trimmed to reduce concentration." },
    { date: "Mar 2", action: "Buy", ticker: "BND", account: "Fidelity IRA", amount: "$2,500", note: "Rebalanced cash into lower-volatility bucket." },
  ];

  const accountSummary = [
    { name: "IBKR Taxable", value: "$211,700", change: "+9.2% YTD" },
    { name: "Fidelity Brokerage", value: "$126,400", change: "+4.8% YTD" },
    { name: "Fidelity IRA", value: "$61,500", change: "+2.1% YTD" },
    { name: "Chase Investment", value: "$78,300", change: "-1.7% YTD" },
  ];

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[26px_30px_22px_34px/28px_22px_30px_24px] border-2 border-dashed border-gray-300 bg-white p-6 shadow-[4px_5px_0_rgba(255,77,77,0.05)]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total portfolio</p>
          <div className="mt-1 flex items-end gap-3">
            <span className="text-3xl font-semibold">$477,900</span>
            <span className="rounded-full px-2.5 py-1 text-sm font-medium text-white bg-[var(--accent)]">+6.4% YTD</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">Estimated annual dividend income: $4,860</p>
        </div>

        <div className="rounded-[32px_22px_30px_24px/24px_31px_21px_29px] border-2 border-dashed border-gray-300 bg-white p-6 shadow-[4px_5px_0_rgba(255,77,77,0.05)]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Accounts</p>
          <div className="mt-3 space-y-2">
            {accountSummary.map((acc, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{acc.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{acc.value}</span>
                  <span className={`text-xs ${acc.change.includes('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{acc.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Trend */}
      <section className="rounded-[24px_34px_20px_28px/29px_24px_32px_20px] border-2 border-dashed border-gray-300 bg-white p-6 shadow-[4px_5px_0_rgba(255,77,77,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Portfolio trend</h2>
            <p className="text-sm text-slate-500">12-month portfolio value snapshot</p>
          </div>
          <div className="flex gap-2 text-xs">
            <button className="rounded-full border-2 border-dashed border-gray-300 px-3 py-1.5 text-white bg-[var(--accent)]">1Y</button>
            <button className="rounded-full border-2 border-dashed border-gray-300 px-3 py-1.5 text-slate-500 bg-white">6M</button>
            <button className="rounded-full border-2 border-dashed border-gray-300 px-3 py-1.5 text-slate-500 bg-white">1M</button>
          </div>
        </div>
        <div className="mt-6 rounded-[22px_28px_20px_26px/26px_20px_28px_22px] border-2 border-dashed border-gray-200 bg-white/70 p-4">
          <div className="h-64">
            <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
              {[0, 25, 50, 75, 100].map((line) => (
                <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="currentColor" className="text-gray-200" strokeWidth="0.6" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
              ))}
              <polyline fill="none" stroke="#ff4d4d" strokeWidth="2.8" vectorEffect="non-scaling-stroke" points={points} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3 text-sm text-slate-500">
          {['Apr','Jun','Aug','Oct','Dec','Feb'].map((m) => <div key={m}>{m}</div>)}
        </div>
      </section>

      {/* Holdings Table */}
      <section className="rounded-[30px_25px_34px_22px/22px_30px_24px_31px] border-2 border-dashed border-gray-300 bg-white p-6 shadow-[4px_5px_0_rgba(255,77,77,0.05)]">
        <h2 className="text-lg font-semibold">Positions</h2>
        <p className="text-sm text-slate-500">Current portfolio allocation</p>
        <div className="mt-4 overflow-hidden rounded-[26px_30px_22px_34px/28px_22px_30px_24px] border-2 border-dashed border-gray-200">
          <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 bg-[#fff6f6] px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            <div>Asset</div>
            <div>Cost</div>
            <div>Gain</div>
            <div>Weight</div>
            <div>Account</div>
          </div>
          <div className="divide-y divide-gray-200/70">
            {holdings.map((h, idx) => (
              <div key={h.ticker} className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 px-4 py-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center text-xs font-semibold text-white" style={{backgroundColor: idx%2===0?'#ff4d4d':'#1f1f1f', borderRadius:'28px 22px 26px 18px / 20px 28px 18px 24px'}}>{h.ticker}</div>
                  <div>
                    <p className="font-medium">{h.name}</p>
                  </div>
                </div>
                <div className="text-sm">{h.cost}</div>
                <div className={`text-sm font-medium ${h.change.startsWith('+')?'text-emerald-700':'text-rose-700'}`}>{h.change}</div>
                <div className="text-sm">{h.weight}</div>
                <div className="text-sm text-slate-600">{h.account}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Trades & Notes */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[24px_34px_20px_28px/29px_24px_32px_20px] border-2 border-dashed border-gray-300 bg-white p-6 shadow-[4px_5px_0_rgba(255,77,77,0.05)]">
          <h2 className="text-lg font-semibold">Actions</h2>
          <p className="text-sm text-slate-500">Recent buy / sell decisions</p>
          <div className="mt-5 space-y-3">
            {recentTrades.map((trade, idx) => (
              <div key={`${trade.date}-${trade.ticker}`} className={`rounded-[26px_30px_22px_34px/28px_22px_30px_24px] border-2 border-dashed border-gray-200 p-4 bg-[#fffdfa]`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${trade.action==='Buy'?'bg-[var(--accent)]':'bg-gray-900'}`}>{trade.action}</span>
                      <span className="text-sm text-slate-500">{trade.date}</span>
                    </div>
                    <p className="mt-2 font-medium">{trade.ticker}</p>
                    <p className="text-sm text-slate-500">{trade.account}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{trade.amount}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{trade.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px_25px_34px_22px/22px_30px_24px_31px] border-2 border-dashed border-gray-300 bg-white p-6 shadow-[4px_5px_0_rgba(255,77,77,0.05)]">
          <h2 className="text-lg font-semibold">Investment note</h2>
          <p className="text-sm text-slate-500">Your reasoning for a trade</p>
          <div className="mt-5 rounded-[32px_22px_30px_24px/24px_31px_21px_29px] border-2 border-dashed border-gray-200 p-5 bg-[#fffdfa]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Selected idea</p>
                <h3 className="mt-2 text-xl font-semibold">Why I bought more SCHD</h3>
              </div>
              <span className="rounded-full border-2 border-dashed border-gray-300 bg-white px-3 py-1 text-sm text-slate-500">Updated Mar 8</span>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <p>My goal here is to increase the portion of the portfolio that can generate reliable dividend income without requiring constant monitoring.</p>
              <p>I still want equity exposure, but I want the position to be easier to hold emotionally during market volatility compared with pure growth names.</p>
              <p>This buy also fits the broader plan of building toward a target monthly income stream while keeping the portfolio structure simple.</p>
            </div>
            <button className="mt-5 rounded-full border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-white bg-[var(--accent)]">Open full investment journal</button>
          </div>
        </div>
      </section>
    </div>
  );
}

const teamMembers = [
  { id: "crew-01", name: "Tom", role: "Ops", initials: "TC", avatar: "/avatar.png" },
  { id: "crew-02", name: "Chat", role: "Admin", initials: "CH", avatar: "/avatar-chat.png" },
  { id: "crew-03", name: "Claw", role: "Coder", initials: "CL", avatar: "/avatar-claw.png" },
  { id: "crew-04", name: "Gem", role: "Art", initials: "GM", avatar: "/avatar-gem.png" },
];

const crewHighlights: Record<string, string> = {
  "crew-01": "Mapping sprint milestones, refreshing delivery notes, and keeping the ops pulse alive.",
  "crew-02": "Curating notes, defending the workspace, and prepping your next spotlight (avatar incoming).",
  "crew-03": "Aligning code, refining the kanban wiring, and keeping drag operations smooth.",
  "crew-04": "Designing art treatments, sketches, and tactile cues for the board experience.",
};

const statusLabelMap: Record<BoardStatus, string> = {
  synced: "Synced",
  saving: "Saving",
  error: "Error",
};

export default function Page() {
  const [activeTab, setActiveTab] = useState("news");
  const [activeCrew, setActiveCrew] = useState(teamMembers[0].id);
  const [boardStatus, setBoardStatus] = useState<BoardStatus>("synced");
  const [selectedNewsDate, setSelectedNewsDate] = useState<string>(newsletterData.digestDate);
  const [currentArticle, setCurrentArticle] = useState<NewsletterArticle | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  const tabMeta = useMemo(() => tabs.find((tab) => tab.id === activeTab), [activeTab]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Generate past 5 days + today for date buttons
  // Only show dates from 2026-03-07 onwards (first newsletter date)
  const pastDates = useMemo(() => {
    const dates = [];
    const firstNewsDate = new Date('2026-03-07'); // First newsletter date
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Only include dates on or after firstNewsDate
      if (date >= firstNewsDate) {
        dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
      }
    }
    return dates;
  }, []);

  // Check if a date has special guest article (latest article takes priority)
  const isSpecialDate = (date: string) => {
    // Add your special guest article dates here
    const specialDates = ['2026-03-07']; // CKC335's article
    return specialDates.includes(date);
  };

  // Check available articles in Blob on mount
  useEffect(() => {
    async function checkAvailableArticles() {
      try {
        const res = await fetch('/api/newsletter');
        const data = await res.json();
        
        if (data.success && data.data) {
          // Set default to latest article
          setSelectedNewsDate(data.data.latest || newsletterData.digestDate);
          if (data.data.available) {
            setAvailableDates(data.data.available);
          }
        }
      } catch (error) {
        console.error('Failed to check available articles:', error);
      }
    }
    
    checkAvailableArticles();
  }, []);

  // Load news for selected date
  useEffect(() => {
    async function loadNewsForDate(date: string) {
      setLoadingArticle(true);
      setArticleError(null);
      
      try {
        const res = await fetch(`/api/newsletter?date=${date}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          setCurrentArticle(data.data);
        } else if (date === newsletterData.digestDate) {
          setCurrentArticle(newsletterData);
        } else {
          setArticleError(data.error || `No article found for ${date}`);
          setCurrentArticle(null);
        }
      } catch (error) {
        console.error('Failed to load news:', error);
        if (date === newsletterData.digestDate) {
          setCurrentArticle(newsletterData);
        } else {
          setArticleError('Failed to load article');
          setCurrentArticle(null);
        }
      } finally {
        setLoadingArticle(false);
      }
    }
    
    if (selectedNewsDate) {
      loadNewsForDate(selectedNewsDate);
    }
  }, [selectedNewsDate]);

  const refreshPage = () => {
    if (boardStatus === "synced") {
      location.reload();
    }
  };

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10">
      <nav className="w-full rounded-[var(--r-wobbly-md)] border-[3px] border-pencil bg-white/90 px-4 py-2 shadow-hard">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-[0.65rem] font-heading uppercase tracking-[0.6em] text-slate-600">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs tracking-[0.35em] transition-all ${
                  activeTab === tab.id
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-transparent bg-white/60 text-pencil hover:border-accent"
                }`}
                style={{ boxShadow: activeTab === tab.id ? "4px 4px 0px #2d2d2d" : "3px 3px 0px rgba(45,45,45,0.4)" }}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Current</p>
              <span className="text-sm font-heading uppercase tracking-[0.4em] text-slate-800">{tabMeta?.label}</span>
            </div>
            <Button
              variant="secondary"
              type="button"
              onClick={refreshPage}
              disabled={boardStatus !== "synced"}
              className="text-xs uppercase tracking-[0.4em]"
              title="Click when synced to refresh"
            >
              {statusLabelMap[boardStatus]}
            </Button>
          </div>
        </div>
      </nav>

      <div className="board-stage" aria-live="polite">
        {activeTab === "board" && (
          <>
            <div className="board-canvas">
              <Board onStatusChange={setBoardStatus} />
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_minmax(240px,260px)]">
              <div className="rounded-[var(--r-wobbly)] border-[2px] border-dashed border-pencil bg-white/90 p-5 shadow-hard">
                <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Crew</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setActiveCrew(member.id)}
                      className={`flex items-center gap-3 rounded-[var(--r-wobbly)] border-[3px] px-3 py-2 shadow-hard transition-all ${
                        activeCrew === member.id ? "border-accent bg-accent/15" : "border-pencil bg-muted/70"
                      }`}
                    >
                      <div className="crew-avatar">
                        {member.avatar ? (
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            width={52}
                            height={52}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-heading">{member.initials}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-base font-heading text-slate-900">{member.name}</p>
                        <p className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-500">{member.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 p-5 shadow-hard flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="crew-avatar">
                    {teamMembers.find((member) => member.id === activeCrew)?.avatar ? (
                      <Image
                        src={teamMembers.find((member) => member.id === activeCrew)?.avatar as string}
                        alt={teamMembers.find((member) => member.id === activeCrew)?.name ?? "avatar"}
                        width={88}
                        height={88}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-pencil bg-white text-lg font-heading">
                        {teamMembers.find((member) => member.id === activeCrew)?.initials}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Highlight</p>
                    <p className="text-lg font-heading text-slate-900">
                      {teamMembers.find((member) => member.id === activeCrew)?.name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{crewHighlights[activeCrew]}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "todo" && (
          <TodoCalendarFullView />
        )}

        {activeTab === "news" && (
          <div className="max-w-[1100px] mx-auto">
            {/* Article Header - Clean & Minimal */}
            <header className="mb-12">
              {/* Date badge + Navigation Buttons (same row) */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Date badge */}
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent px-4 py-1.5" style={{ boxShadow: "3px 3px 0px var(--accent)" }}>
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  <span className="text-xs font-heading uppercase tracking-[0.3em] text-accent">
                    {new Date(selectedNewsDate || newsletterData.digestDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Date Navigation Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {pastDates.map((date, idx) => {
                    const isSelected = date === selectedNewsDate;
                    const isToday = idx === 0;
                    const hasSpecial = isSpecialDate(date);
                    const label = isToday ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSelectedNewsDate(date)}
                        className={`px-4 py-1.5 text-xs font-heading uppercase tracking-[0.2em] rounded-full border-2 transition-all relative ${
                          isSelected
                            ? 'border-accent bg-accent text-white'
                            : 'border-slate-300 bg-white text-slate-600 hover:border-accent'
                        }`}
                        style={{ boxShadow: isSelected ? '3px 3px 0px var(--accent)' : '2px 2px 0px rgba(45,45,45,0.3)' }}
                      >
                        {label}
                        {hasSpecial && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                  
                  {/* History Button */}
                  <a
                    href="/history"
                    className="px-4 py-1.5 text-xs font-heading uppercase tracking-[0.2em] rounded-full border-2 border-slate-300 bg-white text-slate-600 hover:border-accent hover:text-accent transition-all"
                    style={{ boxShadow: '2px 2px 0px rgba(45,45,45,0.3)' }}
                  >
                    📚 History →
                  </a>
                </div>
              </div>

              {/* Title - Reduced from 5xl to 3xl */}
              <h1 className="text-3xl font-heading font-bold text-slate-900 leading-tight mb-4">
                {loadingArticle ? 'Loading...' : currentArticle?.article?.title || 'No Article'}
              </h1>

              {/* Subtitle */}
              {currentArticle?.article?.subtitle && (
                <p className="text-lg text-slate-600 font-light mb-6">
                  {currentArticle.article.subtitle}
                </p>
              )}

              {/* Meta line */}
              <div className="flex items-center gap-4 text-sm">
                {currentArticle?.article?.author && (
                  <span className="text-slate-600">
                    By <strong className="text-slate-900">{currentArticle.article.author}</strong>
                  </span>
                )}
                {currentArticle?.metadata?.readTime && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600">{currentArticle.metadata.readTime} read</span>
                  </>
                )}
                {articleError && (
                  <span className="text-red-600">📴 {articleError}</span>
                )}
              </div>
            </header>

            {/* Main Article Content - Clean typography */}
            <article className="news-article">
              {loadingArticle ? (
                <div className="rounded-[var(--r-wobbly)] border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center">
                  <p className="text-lg text-slate-600">Loading article...</p>
                </div>
              ) : currentArticle?.article?.content ? (
                <div 
                  className="news-content"
                  dangerouslySetInnerHTML={{ __html: currentArticle.article.content }}
                />
              ) : articleError ? (
                <div className="rounded-[var(--r-wobbly)] border-2 border-dashed border-red-300 bg-red-50/50 p-12 text-center">
                  <p className="text-lg text-red-600">{articleError}</p>
                  <p className="mt-2 text-sm text-red-500">Article not found in Blob storage</p>
                  <a href="/blob-manager" className="mt-4 inline-block px-4 py-2 bg-accent text-white rounded-full text-xs uppercase tracking-wider hover:bg-accent/90">
                    Upload Article →
                  </a>
                </div>
              ) : (
                <div className="rounded-[var(--r-wobbly)] border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center">
                  <p className="text-lg text-slate-600">No content yet</p>
                  <p className="mt-2 text-sm text-slate-500">Check back tomorrow!</p>
                </div>
              )}
            </article>

            {/* Sources Section - Minimal cards */}
            {currentArticle?.article?.sources && currentArticle.article.sources.length > 0 && (
              <section className="mt-16 pt-8 border-t-[3px] border-dashed border-slate-200">
                <h2 className="text-sm font-heading uppercase tracking-[0.4em] text-slate-500 mb-6">
                  Sources
                </h2>
                <div className="space-y-3">
                  {currentArticle.article.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-[var(--r-wobbly-md)] border-2 border-slate-200 bg-white transition-all hover:border-accent hover:shadow-hard"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl" style={{ filter: "grayscale(100%)" }}>
                          {source.type === 'email' ? '📧' : '🌐'}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-accent">
                            {source.name}
                          </p>
                          {source.summary && (
                            <p className="text-sm text-slate-600 mt-0.5">
                              {source.summary}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === "finance" && (
          <FinancialWatchView />
        )}

        {activeTab === "focus" && (
          <div className="space-y-3">
            {focusRituals.map((ritual) => (
              <p
                key={ritual}
                className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-hard"
              >
                {ritual}
              </p>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
