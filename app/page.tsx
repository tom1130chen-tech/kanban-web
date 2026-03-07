"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Board, type BoardStatus } from "../components/board/Board";
import { Button } from "../components/ui/Button";

const tabs = [
  { id: "board", label: "KANBAN", title: "Project board" },
  { id: "todo", label: "TO DO + CALENDAR", title: "Schedule + tasks" },
  { id: "news", label: "DAILY NEWS", title: "Signals + headlines" },
  { id: "finance", label: "FINANCIAL WATCH", title: "Markets + liquidity" },
  { id: "focus", label: "FOCUS", title: "Rituals" },
];

const todoList = [
  { id: "todo-01", title: "Refine weekly sprint plan", owner: "Ops", due: "Wed" },
  { id: "todo-02", title: "Review deployment log", owner: "Dev", due: "Thu" },
  { id: "todo-03", title: "Prep customer update deck", owner: "Product", due: "Fri" },
];

const calendarItems = [
  { id: "cal-01", title: "Stand-up + blockers", time: "09:30" },
  { id: "cal-02", title: "Research sync", time: "14:00" },
  { id: "cal-03", title: "Investor prep", time: "16:30" },
];

// Newsletter digest data - auto-updated daily by cron job
import newsletterData from "../data/newsletter-digest.json";

const newsFeed = newsletterData.items || [];

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
  { id: "crew-02", name: "Chat", role: "Admin", initials: "CH" },
  { id: "crew-03", name: "Claw", role: "Coder", initials: "CL" },
  { id: "crew-04", name: "Gem", role: "Art", initials: "GM" },
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
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [activeCrew, setActiveCrew] = useState(teamMembers[0].id);
  const [boardStatus, setBoardStatus] = useState<BoardStatus>("synced");
  const tabMeta = useMemo(() => tabs.find((tab) => tab.id === activeTab), [activeTab]);

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
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-3 text-lg font-semibold text-slate-800">To do</div>
              <ul className="space-y-3">
                {todoList.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 px-4 py-3 shadow-hard"
                  >
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{item.owner}</span>
                      <span>Due {item.due}</span>
                    </div>
                    <p className="mt-2 text-base text-slate-900">{item.title}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-3 text-lg font-semibold text-slate-800">Calendar</div>
              <ul className="space-y-3">
                {calendarItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 px-4 py-3 shadow-hard"
                  >
                    <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{item.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="space-y-6">
            {/* Article Header */}
            <header className="border-b-[3px] border-pencil pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Daily Newsletter</p>
                  <h1 className="mt-2 text-4xl font-heading leading-tight text-slate-900">
                    {newsletterData.article?.title || `Digest — ${new Date(newsletterData.digestDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </h1>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Published</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {newsletterData.lastUpdated 
                      ? new Date(newsletterData.lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              {/* Sources count */}
              {newsletterData.article?.sources && (
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="text-slate-600">
                    <strong className="text-slate-900">{newsletterData.article.sources.length}</strong> sources curated
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">
                    <strong className="text-slate-900">{newsletterData.article.sources.filter(s => s.type === 'email').length}</strong> newsletters
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">
                    <strong className="text-slate-900">{newsletterData.article.sources.filter(s => s.type === 'article').length}</strong> articles
                  </span>
                </div>
              )}
            </header>

            {/* Main Article Content */}
            <article className="prose prose-slate max-w-none">
              {newsletterData.article?.content ? (
                <div 
                  className="text-base leading-loose text-slate-800"
                  dangerouslySetInnerHTML={{ __html: newsletterData.article.content }}
                />
              ) : (
                <div className="rounded-[var(--r-wobbly)] border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center">
                  <p className="text-lg text-slate-600">No content yet</p>
                  <p className="mt-2 text-sm text-slate-500">Check back tomorrow!</p>
                </div>
              )}
            </article>

            {/* Sources Section */}
            {newsletterData.article?.sources && newsletterData.article.sources.length > 0 && (
              <section className="rounded-[var(--r-wobbly)] border-[3px] border-dashed border-pencil bg-white/70 p-6">
                <h2 className="mb-4 flex items-center gap-3 text-xl font-heading text-slate-900">
                  <span>📚</span>
                  Sources
                  <span className="flex-1 border-t-2 border-dashed border-slate-300"></span>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {newsletterData.article.sources.length} total
                  </span>
                </h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {newsletterData.article.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-[var(--r-wobbly-md)] border-2 border-slate-200 bg-white/90 p-3 transition-all hover:border-accent hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {source.type === 'email' ? '📧' : '🌐'}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-accent">
                            {source.name}
                          </p>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                            {source.type === 'email' ? 'Newsletter' : 'Article'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-accent transition-transform group-hover:translate-x-1">
                        Visit →
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Article Footer */}
            <footer className="border-t-[3px] border-pencil pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Compiled automatically from your subscribed newsletters and sources.
                </p>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  {newsletterData.digestDate}
                </p>
              </div>
            </footer>
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
