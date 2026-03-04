"use client";

import { useMemo, useState } from "react";
import { Board } from "../components/board/Board";

const tabDefinitions = [
  { id: "board", label: "Kanban" },
  { id: "todo", label: "To do + Calendar" },
  { id: "news", label: "Daily News" },
  { id: "finance", label: "Financial Watch" },
  { id: "focus", label: "Focus" },
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
  const [activeTab, setActiveTab] = useState(tabDefinitions[0].id);
  const activeLabel = useMemo(() => tabDefinitions.find((tab) => tab.id === activeTab)?.label ?? "", [
    activeTab,
  ]);

  return (
    <div className="industrial-stage">
      <nav className="industrial-nav">
        <div className="industrial-logo">Operation Grid</div>
        <div className="industrial-tabs">
          {tabDefinitions.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`industrial-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="industrial-action" onClick={() => location.reload()}>
          REFRESH
        </button>
      </nav>

      <main className="industrial-panel-grid">
        <section className="industrial-panel">
          <header className="industrial-panel-header">
            <div>
              <p className="industrial-kicker">Current view</p>
              <h1 className="industrial-title">{activeLabel}</h1>
            </div>
            <p className="industrial-subcopy">Structured tabs keep the mission focused.</p>
          </header>

          <div className="industrial-panel-body">
            {activeTab === "board" && <Board />}

            {activeTab === "todo" && (
              <div className="industrial-columns">
                <article className="industrial-card">
                  <p className="industrial-card-label">To do</p>
                  <ul>
                    {todoList.map((item) => (
                      <li key={item.id}>
                        <span className="industrial-card-title">{item.title}</span>
                        <span className="industrial-card-meta">{item.owner} · Due {item.due}</span>
                      </li>
                    ))}
                  </ul>
                </article>
                <article className="industrial-card">
                  <p className="industrial-card-label">Calendar</p>
                  <ul>
                    {calendarItems.map((item) => (
                      <li key={item.id}>
                        <span className="industrial-card-title">{item.title}</span>
                        <span className="industrial-card-meta">{item.time}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            )}

            {activeTab === "news" && (
              <div className="industrial-grid">
                {newsFeed.map((item) => (
                  <article key={item.id} className="industrial-card">
                    <p className="industrial-card-title">{item.headline}</p>
                    <p className="industrial-card-meta">{item.source}</p>
                  </article>
                ))}
              </div>
            )}

            {activeTab === "finance" && (
              <div className="industrial-grid">
                {financeWatch.map((item) => (
                  <article key={item.id} className="industrial-card">
                    <p className="industrial-card-label text-xs uppercase">{item.label}</p>
                    <p className="industrial-card-title text-2xl">{item.value}</p>
                    <p className="industrial-card-meta">{item.detail}</p>
                  </article>
                ))}
              </div>
            )}

            {activeTab === "focus" && (
              <div className="industrial-grid">
                {focusRituals.map((ritual) => (
                  <article key={ritual} className="industrial-card">
                    <p className="industrial-card-title">{ritual}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
