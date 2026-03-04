"use client";

import { useMemo, useState } from "react";
import { Board } from "../components/board/Board";

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
    <div className="comic-stage">
      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5">
        <section className="comic-panel px-6 py-8">
          <div className="comic-explosion" aria-hidden="true" />
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase text-slate-500">retro operations board</p>
              <h1 className="text-4xl font-black text-slate-900 md:text-6xl">Teams, tabs, and hyper focus.</h1>
              <p className="mt-2 text-lg text-slate-600 md:max-w-xl">
                A playful hero space inspired by 1960s comic books. Navigate between the notebook, your daily
                priorities, and signal-rich news streaks.
              </p>
            </div>

            <button
              type="button"
              onClick={() => location.reload()}
              className="comic-tab-button active"
            >
              Refresh
            </button>
          </header>
        </section>

        <section className="comic-panel px-6 py-8">
          <div className="flex flex-wrap gap-3 md:gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`comic-tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="comic-header-title">{tabTitle}</p>
          </div>

          <div className="mt-6 min-h-[320px]">
            {activeTab === "board" && <Board />}

            {activeTab === "todo" && (
              <div className="comic-grid md:grid-cols-2">
                <div className="comic-card p-5">
                  <p className="text-sm uppercase text-slate-500">To do</p>
                  <ul className="mt-4 space-y-3">
                    {todoList.map((item) => (
                      <li key={item.id}>
                        <p className="text-base font-bold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.owner} · Due {item.due}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="comic-card p-5">
                  <p className="text-sm uppercase text-slate-500">Calendar</p>
                  <ul className="mt-4 space-y-3">
                    {calendarItems.map((item) => (
                      <li key={item.id}>
                        <p className="text-base font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.time}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "news" && (
              <div className="comic-grid">
                {newsFeed.map((item) => (
                  <article key={item.id} className="comic-card p-5">
                    <p className="text-lg font-bold text-slate-900">{item.headline}</p>
                    <p className="text-xs uppercase text-slate-500">{item.source}</p>
                  </article>
                ))}
              </div>
            )}

            {activeTab === "finance" && (
              <div className="comic-grid md:grid-cols-3">
                {financeWatch.map((item) => (
                  <div key={item.id} className="comic-card p-4">
                    <p className="text-xs uppercase text-slate-500">{item.label}</p>
                    <p className="text-2xl font-black text-slate-900">{item.value}</p>
                    <p className="text-xs text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "focus" && (
              <div className="comic-grid">
                {focusRituals.map((ritual) => (
                  <div key={ritual} className="comic-card p-5">
                    <p className="text-base font-bold text-slate-900">{ritual}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
