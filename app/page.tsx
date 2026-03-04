"use client";

import { useMemo, useState } from "react";
import { Board } from "../components/board/Board";
import { Button } from "../components/ui/Button";

const tabs = [
  { id: "board", label: "Tab 1", title: "看板" },
  { id: "todo", label: "Tab 2", title: "To do + Calendar" },
  { id: "news", label: "Tab 3", title: "Daily news" },
  { id: "finance", label: "Tab 4", title: "Financial watch" },
  { id: "focus", label: "Tab 5", title: "Focus" },
];

const todoList = [
  { id: "todo-01", title: "Refine weekly sprint plan", owner: "Ops", due: "Wed" },
  { id: "todo-02", title: "Review deployment log", owner: "Dev", due: "Thu" },
  { id: "todo-03", title: "Prep customer update deck", owner: "Product", due: "Fri" },
];

const calendarItems = [
  { id: "cal-01", title: "Stand-up + blockers", time: "9:30 AM" },
  { id: "cal-02", title: "User research sync", time: "2:00 PM" },
  { id: "cal-03", title: "Investor briefing prep", time: "4:30 PM" },
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
  const tabTitle = useMemo(() => tabs.find((tab) => tab.id === activeTab)?.title ?? "", [activeTab]);

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-block border-2 border-dashed border-pencil bg-postit px-3 py-1 shadow-hardSm [border-radius:var(--r-wobbly)] -rotate-[1deg]">
            Team work tracker
          </div>
          <h1 className="mt-3 text-5xl md:text-6xl leading-[0.95] rotate-[0.4deg]">
            Kanban, but human.
          </h1>
          <p className="mt-3 text-xl md:text-2xl max-w-[640px] opacity-90">
            Drag cards. Sync in realtime. Looks like a sketchboard instead of a corporate dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => location.reload()}>
            Refresh
          </Button>
        </div>
      </header>

      <section className="mt-10 rounded-3xl border border-dashed border-pencil bg-white/70 p-5 shadow-hardMd">
        <div className="flex flex-wrap gap-3 md:gap-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-pencil bg-pencil/20 text-pencil"
                  : "border-transparent bg-white/40 text-slate-600 hover:border-pencil"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-lg font-semibold text-slate-800">{tabTitle}</p>
        </div>

        <div className="mt-6 min-h-[320px]" aria-live="polite">
          {activeTab === "board" && <Board />}

          {activeTab === "todo" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-3 text-lg font-semibold text-slate-800">To do</div>
                <ul className="space-y-3">
                  {todoList.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft"
                    >
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>{item.owner}</span>
                        <span>Due {item.due}</span>
                      </div>
                      <p className="mt-1 text-base text-slate-900">{item.title}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-3 text-lg font-semibold text-slate-800">Calendar</div>
                <ul className="space-y-3">
                  {calendarItems.map((item) => (
                    <li key={item.id} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-soft">
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.time}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "news" && (
            <ul className="space-y-4">
              {newsFeed.map((item) => (
                <li key={item.id} className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-soft">
                  <p className="text-lg font-semibold text-slate-900">{item.headline}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.source}</p>
                </li>
              ))}
            </ul>
          )}

          {activeTab === "finance" && (
            <div className="grid gap-4 md:grid-cols-3">
              {financeWatch.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm shadow-soft"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "focus" && (
            <div className="space-y-3">
              {focusRituals.map((ritual) => (
                <p key={ritual} className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-soft">
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
