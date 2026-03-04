"use client";

import { useMemo, useState } from "react";
import { Board } from "../components/board/Board";
import { Button } from "../components/ui/Button";

const tabs = [
  { id: "board", label: "Kanban", title: "Project board" },
  { id: "todo", label: "To do + Calendar", title: "Schedule & tasks" },
  { id: "news", label: "Daily News", title: "Signals & headlines" },
  { id: "finance", label: "Financial Watch", title: "Markets & liquidity" },
  { id: "focus", label: "Focus", title: "Deep work rituals" },
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

export default function Page() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const tabMeta = useMemo(() => tabs.find((tab) => tab.id === activeTab), [activeTab]);

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-12">
      <header className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="inline-block border-[3px] border-pencil bg-postit px-4 py-1 shadow-hardSm [border-radius:var(--r-wobbly)] -rotate-[1deg]">
            Team work tracker
          </div>
          <h1 className="mt-4 text-5xl font-heading leading-[1.05]">Project board, reimagined.</h1>
          <p className="mt-2 max-w-xl text-lg text-slate-700">
            Tabs keep your mission clear. Tap into every mode—Kanban, daily priorities, signal feeds—without
            leaving the same sketchy digital desk.
          </p>
        </div>

        <Button variant="secondary" type="button" onClick={() => location.reload()}>
          Refresh
        </Button>
      </header>

      <nav className="mt-8 rounded-[var(--r-wobbly)] border-[3px] border-dashed border-pencil bg-white/80 px-5 py-4 shadow-hard">
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-full border px-3 py-1 transition-all ${
                activeTab === tab.id
                  ? "border-pencil bg-pencil/30 text-pencil"
                  : "border-transparent bg-white/40 text-slate-600 hover:border-pencil"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="mt-10 rounded-[var(--r-wobbly)] border-[3px] border-solid border-pencil bg-white/90 p-6 shadow-hard">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Current tab</p>
          <h2 className="text-3xl font-heading">{tabMeta?.title}</h2>
        </div>
        <p className="mt-3 text-lg text-slate-600">{tabMeta?.title} lives in this canvas.</p>

        <div className="mt-6 min-h-[360px]" aria-live="polite">
          {activeTab === "board" && <Board />}

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
