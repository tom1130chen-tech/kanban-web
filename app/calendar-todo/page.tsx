"use client";

import { useEffect, useState } from "react";

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

interface PageData {
  calendarEvents: CalendarEvent[];
  todos: TodoItem[];
  lastUpdated: string;
}

export default function CalendarTodoPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/calendar-todo")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundColor: 'var(--bg)',
        backgroundImage: 'radial-gradient(var(--muted) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        <div className="text-center">
          <div className="text-2xl font-handwritten mb-2">Loading...</div>
          <p className="text-gray-600">Fetching your calendar and todos</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundColor: 'var(--bg)',
        backgroundImage: 'radial-gradient(var(--muted) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        <div className="text-center p-8 bg-white rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-lg border-2 border-dashed border-gray-400">
          <div className="text-2xl font-handwritten mb-2 text-red-500">Oops!</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { calendarEvents, todos, lastUpdated } = data;

  // Group calendar events by date
  const eventsByDate = calendarEvents.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="min-h-screen pb-12" style={{
      backgroundColor: 'var(--bg)',
      backgroundImage: 'radial-gradient(var(--muted) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>
      {/* Header */}
      <header className="border-b-2 border-dashed border-gray-400 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-handwritten" style={{ fontFamily: 'var(--font-heading)' }}>
                📅 Calendar + To Do
              </h1>
              <p className="text-gray-600 mt-1">Your week at a glance</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Calendar - Left 2/3 */}
          <div className="col-span-2 bg-white rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-xl border-2 border-dashed border-gray-400 p-6 overflow-auto">
            <h2 className="text-xl font-handwritten mb-6 flex items-center gap-2">
              <span>📆</span> This Week&apos;s Calendar
            </h2>
            
            {sortedDates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500">No events this week</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((date) => {
                  const dateObj = new Date(date);
                  const isToday = date === new Date().toISOString().split('T')[0];
                  return (
                    <div key={date}>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-handwritten" style={{ fontFamily: 'var(--font-heading)' }}>
                          {dateObj.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </h3>
                        {isToday && (
                          <span className="px-3 py-1 bg-[var(--accent)] text-white text-xs rounded-full font-medium">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {eventsByDate[date].map((event) => (
                          <div
                            key={event.id}
                            className="group flex items-start gap-4 p-4 rounded-[225px_18px_255px_18px/18px_255px_18px_225px] border-2 border-dashed border-gray-300 hover:border-[var(--blue)] hover:bg-blue-50 transition-all cursor-pointer"
                          >
                            {event.time && (
                              <div className="flex-shrink-0 w-20 text-center">
                                <div className="text-lg font-bold text-[var(--blue)]">{event.time}</div>
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-handwritten text-lg text-gray-900">{event.title}</div>
                              {event.description && (
                                <div className="text-sm text-gray-500 mt-2">{event.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* To Do - Right 1/3 */}
          <div className="bg-white rounded-[255px_15px_225px_15px/15px_225px_15px_255px] shadow-xl border-2 border-dashed border-gray-400 p-6 overflow-auto">
            <h2 className="text-xl font-handwritten mb-6 flex items-center gap-2">
              <span>✅</span> To Do
            </h2>
            
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
                            Added by {todo.source}
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
      </main>

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[var(--blue)] hover:underline font-handwritten"
        >
          ← Back to Kanban Board
        </a>
      </div>
    </div>
  );
}
