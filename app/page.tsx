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

// Todo + Calendar Tab Component
function TodoCalendarTab() {
  const [data, setData] = useState<{ calendarEvents: CalendarEvent[]; todos: TodoItem[] } | null>(null);
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-slate-800">To Do</div>
          <a
            href="/calendar-todo"
            className="text-xs font-heading uppercase tracking-[0.3em] text-[var(--accent)] hover:underline"
          >
            View All →
          </a>
        </div>
        <ul className="space-y-3">
          {todos.length === 0 ? (
            <li className="text-center py-8 text-slate-400">
              No tasks yet. Ask Chat to add some!
            </li>
          ) : (
            todos.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 px-4 py-3 shadow-hard"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 ${
                    item.completed ? "border-gray-400 bg-gray-400" : "border-slate-400"
                  }`} />
                  <div className="flex-1">
                    <p className={`text-base ${item.completed ? "text-slate-400 line-through" : "text-slate-900"}`}>
                      {item.title}
                    </p>
                    {item.source && (
                      <p className="text-xs text-slate-400 mt-1">via {item.source}</p>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-slate-800">Calendar</div>
          <a
            href="/calendar-todo"
            className="text-xs font-heading uppercase tracking-[0.3em] text-[var(--accent)] hover:underline"
          >
            Full View →
          </a>
        </div>
        <ul className="space-y-3">
          {calendarEvents.length === 0 ? (
            <li className="text-center py-8 text-slate-400">
              No events this week
            </li>
          ) : (
            calendarEvents.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 px-4 py-3 shadow-hard"
              >
                <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {item.time && (
                    <p className="text-xs uppercase tracking-[0.4em] text-[var(--blue)]">{item.time}</p>
                  )}
                  {item.date && (
                    <p className="text-xs text-slate-500">
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
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
        const res = await fetch('/api/blob?prefix=newsletter/');
        const data = await res.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Extract dates from blob file paths
          const dates = data.data
            .filter((f: any) => f.pathname.startsWith('newsletter/'))
            .map((f: any) => f.pathname.replace('newsletter/', '').replace('.json', ''))
            .sort((a: string, b: string) => b.localeCompare(a)); // Sort newest first
          
          setAvailableDates(dates);
          
          // Set default to latest article
          if (dates.length > 0) {
            const latestDate = dates[0];
            setSelectedNewsDate(latestDate);
          }
        }
      } catch (error) {
        console.error('Failed to check available articles:', error);
      }
    }
    
    checkAvailableArticles();
  }, []);

  // Load news for selected date from Blob
  useEffect(() => {
    async function loadNewsForDate(date: string) {
      setLoadingArticle(true);
      setArticleError(null);
      
      try {
        // Try to load special article first if date has one
        let pathname = `newsletter/${date}.json`;
        
        // Check if special article exists for this date
        if (isSpecialDate(date)) {
          const specialPathname = `newsletter/${date}-special.json`;
          try {
            const specialRes = await fetch(`/api/blob?pathname=${encodeURIComponent(specialPathname)}`);
            const specialData = await specialRes.json();
            
            if (specialData.success && specialData.data?.body) {
              const article = JSON.parse(specialData.data.body);
              setCurrentArticle(article);
              setLoadingArticle(false);
              return;
            }
          } catch (e) {
            // Fall through to regular article
          }
        }
        
        // Try to load regular article
        const res = await fetch(`/api/blob?pathname=${encodeURIComponent(pathname)}`);
        const data = await res.json();
        
        if (data.success && data.data?.body) {
          // Successfully loaded from Blob
          const article = JSON.parse(data.data.body);
          setCurrentArticle(article);
        } else {
          // Fallback to local data if it's today's date and no Blob data
          if (date === newsletterData.digestDate) {
            setCurrentArticle(newsletterData);
          } else {
            setArticleError(`No article found for ${date}`);
            setCurrentArticle(null);
          }
        }
      } catch (error) {
        console.error('Failed to load news:', error);
        // Fallback to local data for today
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
                onClick={() => setActiveTab(tab.id)}
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
          <TodoCalendarTab />
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
          <div className="grid gap-4 md:grid-cols-3">
            {financeWatch.map((item) => (
              <div
                key={item.id}
                className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 p-4 shadow-hard"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
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
