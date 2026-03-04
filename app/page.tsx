"use client";

import { useMemo, useState } from "react";
import { Board } from "../components/board/Board";
import { Button } from "../components/ui/Button";

const tabs = [
  { id: "board", label: "KANBAN", title: "Project board" },
  { id: "todo", label: "TO DO + CALENDAR", title: "Schedule & tasks" },
  { id: "news", label: "DAILY NEWS", title: "Signals & headlines" },
  { id: "finance", label: "FINANCIAL WATCH", title: "Markets & liquidity" },
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

const newsFeed = [
  { id: "news-01", headline: "Marketcraft playbook launches new analytics", source: "Future Economy" },
  { id: "news-02", headline: "Global platforms face fresh regulation push", source: "Policy Daily" },
  { id: "news-03", headline: "Urban ecosystems pivot toward AI infrastructure", source: "City Lab" },
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
  { id: "crew-01", name: "Avery", role: "Product", initials: "AV" },
  { id: "crew-02", name: "Kei", role: "Ops", initials: "KE" },
  { id: "crew-03", name: "Jules", role: "Design", initials: "JL" },
  { id: "crew-04", name: "Mira", role: "Finance", initials: "MR" },
];

const crewHighlights: Record<string, string> = {
  "crew-01": "Mapping sprint milestones and refreshing delivery notes.",
  "crew-02": "Clearing deployment logs and surfacing ops blockers.",
  "crew-03": "Sketching the next visual language for the board.",
  "crew-04": "Monitoring cash flow, liquidity signals, and runway margins.",
};

export default function Page() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [activeCrew, setActiveCrew] = useState(teamMembers[0].id);
  const tabMeta = useMemo(() => tabs.find((tab) => tab.id === activeTab), [activeTab]);

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10">
      <nav className="w-full rounded-[var(--r-wobbly-md)] border-[3px] border-dashed border-pencil bg-white/90 px-4 py-2 shadow-hard">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-[0.65rem] font-heading uppercase tracking-[0.6em] text-slate-600">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs tracking-[0.35em] transition-all ${
                  activeTab === tab.id
                    ? "border-penblue bg-penblue/20 text-penblue"
                    : "border-transparent bg-white/60 text-pencil hover:border-penblue"
                }`}
                style={{ boxShadow: activeTab === tab.id ? "4px 4px 0px #2d2d2d" : "3px 3px 0px rgba(45,45,45,0.4)" }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Current</p>
            <span className="text-sm font-heading uppercase tracking-[0.4em] text-slate-800">{tabMeta?.label}</span>
            <Button variant="secondary" type="button" onClick={() => location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </nav>

      <section className="mt-8 rounded-[var(--r-wobbly)] border-[3px] border-pencil bg-white/90 p-6 shadow-hard">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Now displaying</p>
          <h2 className="text-3xl font-heading">{tabMeta?.title}</h2>
        </div>
        <div className="mt-6 space-y-8" aria-live="polite">
          {activeTab === "board" && (
            <div className="space-y-6">
              <div className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 p-4 shadow-hard">
                <Board />
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_minmax(220px,240px)]">
                <div className="rounded-[var(--r-wobbly)] border-[3px] border-slate-200 bg-white/90 p-5 shadow-hard">
                  <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Crew</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setActiveCrew(member.id)}
                        className={`flex items-center gap-3 rounded-[var(--r-wobbly)] border-[3px] px-3 py-2 shadow-hard transition-all ${
                          activeCrew === member.id
                            ? "border-penblue bg-penblue/20"
                            : "border-pencil bg-muted/70"
                        }`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-pencil bg-white text-lg font-heading">
                          {member.initials}
                        </div>
                        <div className="text-left">
                          <p className="text-base font-heading text-slate-900">{member.name}</p>
                          <p className="text-[0.6rem] uppercase tracking-[0.4em] text-slate-500">{member.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-[var(--r-wobbly-md)] border-[3px] border-slate-200 bg-white/90 p-5 shadow-hard">
                  <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Highlight</p>
                  <p className="mt-2 text-lg font-heading text-slate-900">{teamMembers.find((member) => member.id === activeCrew)?.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{crewHighlights[activeCrew]}</p>
                </div>
              </div>
            </div>
          )}

*** End Patch
PATCH
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
            <ul className="space-y-4">
              {newsFeed.map((item) => (
                <li
                  key={item.id}
                  className="rounded-[var(--r-wobbly)] border-[3px] border-slate-200 bg-white/90 px-4 py-4 shadow-hard"
                >
                  <p className="text-xl font-heading text-slate-900">{item.headline}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.4em] text-slate-500">{item.source}</p>
                </li>
              ))}
            </ul>
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
      </section>
    </main>
  );
}
