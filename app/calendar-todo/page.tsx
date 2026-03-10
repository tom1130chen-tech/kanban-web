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

// Generate next 3 days starting from today
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

// Generate time slots (6 AM to 10 PM)
function getTimeSlots() {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    slots.push(`${h} ${ampm}`);
  }
  return slots;
}

export default function CalendarTodoPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const next3Days = getNext3Days();
  const timeSlots = getTimeSlots();

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

  // Group events by date
  const eventsByDate = calendarEvents.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Get events for a specific day
  const getEventsForDay = (date: string) => {
    return eventsByDate[date] || [];
  };

  // Get position for an event based on time
  const getEventPosition = (time?: string) => {
    if (!time) return { top: 0, height: 40 };
    const [timeStr, ampm] = time.split(' ');
    let hour = parseInt(timeStr);
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const top = (hour - 6) * 60; // 60px per hour
    return { top, height: 50 };
  };

  return (
    <div className="min-h-screen pb-12" style={{
      backgroundColor: 'var(--bg)',
      backgroundImage: 'radial-gradient(var(--muted) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>
      {/* Header */}
      <header className="border-b-2 border-dashed border-gray-400 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-handwritten" style={{ fontFamily: 'var(--font-heading)' }}>
                📅 Calendar + To Do
              </h1>
              <p className="text-gray-600 mt-1">
                {next3Days[0].full} - {next3Days[2].full}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 160px)', minHeight: '600px' }}>
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
              <div className="flex min-h-[960px]"> {/* 16 hours * 60px = 960px */}
                {/* Time Column */}
                <div className="w-20 flex-shrink-0 border-r-2 border-dashed border-gray-200 bg-gray-50">
                  {timeSlots.map((time, idx) => (
                    <div
                      key={idx}
                      className="h-[60px] text-xs text-gray-400 text-right pr-2 pt-2"
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* 3 Day Columns */}
                <div className="flex-1 grid grid-cols-3">
                  {next3Days.map((day) => {
                    const dayEvents = getEventsForDay(day.date);
                    return (
                      <div
                        key={day.date}
                        className={`relative border-r-2 border-dashed border-gray-200 last:border-r-0 ${
                          day.isToday ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {/* Hour Lines */}
                        {timeSlots.map((_, idx) => (
                          <div
                            key={idx}
                            className="h-[60px] border-b border-dashed border-gray-100"
                          />
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
      </main>

      {/* Back to Home Link */}
      <div className="max-w-[1600px] mx-auto px-6 mt-6">
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
