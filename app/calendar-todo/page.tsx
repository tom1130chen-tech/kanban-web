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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading calendar and todos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Calendar + To Do</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6" style={{ height: "calc(100vh - 140px)" }}>
          {/* Calendar - Left 2/3 */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week&apos;s Calendar</h2>
            
            {sortedDates.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No events this week</div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((date) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="space-y-2">
                      {eventsByDate[date].map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          {event.time && (
                            <div className="text-sm font-medium text-gray-700 min-w-[60px]">
                              {event.time}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{event.title}</div>
                            {event.description && (
                              <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* To Do - Right 1/3 */}
          <div className="w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">To Do</h2>
            
            {todos.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No tasks yet</div>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`p-3 rounded-md border transition-colors ${
                      todo.completed
                        ? "bg-gray-50 border-gray-200"
                        : "bg-white border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        readOnly
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div
                          className={`text-sm ${
                            todo.completed ? "text-gray-500 line-through" : "text-gray-900"
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
    </div>
  );
}
