/**
 * Calendar Template Component
 * 
 * Pre-built template - just pass data, no re-rendering logic needed
 * Usage: <CalendarTemplate days={next3Days} events={calendarEvents} />
 */

export function CalendarTemplate({ days, events }) {
  const timeSlots = getTimeSlots();
  const eventsByDate = groupEventsByDate(events);

  return `
    <div class="grid grid-cols-3 border-b-2 border-dashed border-gray-300">
      ${days.map(day => renderDayHeader(day)).join('')}
    </div>
    
    <div class="flex-1 overflow-auto relative">
      <div class="flex min-h-[960px]">
        <!-- Time Column -->
        <div class="w-20 flex-shrink-0 border-r-2 border-dashed border-gray-200 bg-gray-50">
          ${timeSlots.map(time => `
            <div class="h-[60px] text-xs text-gray-400 text-right pr-2 pt-2">${time}</div>
          `).join('')}
        </div>
        
        <!-- Day Columns -->
        <div class="flex-1 grid grid-cols-3">
          ${days.map(day => renderDayColumn(day, eventsByDate[day.date] || [])).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderDayHeader(day) {
  return `
    <div class="p-4 text-center border-r-2 border-dashed border-gray-200 last:border-r-0 ${day.isToday ? 'bg-[var(--accent)]/10' : ''}">
      <div class="text-sm font-handwritten text-gray-500 uppercase tracking-wide">
        ${day.display.split(',')[0]}
      </div>
      <div class="text-2xl font-bold mt-1 ${day.isToday ? 'text-[var(--accent)]' : 'text-gray-900'}">
        ${day.display.split(',')[1]}
      </div>
    </div>
  `;
}

function renderDayColumn(day, dayEvents) {
  return `
    <div class="relative border-r-2 border-dashed border-gray-200 last:border-r-0 ${day.isToday ? 'bg-blue-50/30' : ''}">
      <!-- Hour Lines -->
      ${getTimeSlots().map(() => '<div class="h-[60px] border-b border-dashed border-gray-100" />').join('')}
      
      <!-- Events -->
      ${dayEvents.map(event => renderEvent(event)).join('')}
    </div>
  `;
}

function renderEvent(event) {
  const { top, height } = getEventPosition(event.time);
  const bgColor = 'rgba(45, 93, 161, 0.1)';
  const borderColor = 'var(--blue)';
  
  return `
    <div class="absolute left-1 right-1 p-2 rounded-[18px] border-2 border-dashed cursor-pointer transition-all hover:shadow-lg"
         style="top: ${top}px; height: ${height}px; background-color: ${bgColor}; border-color: ${borderColor};">
      <div class="font-handwritten text-sm text-gray-900 truncate">${event.title}</div>
      ${event.time ? `<div class="text-xs text-gray-500 mt-0.5">${event.time}</div>` : ''}
      ${event.description ? `<div class="text-xs text-gray-400 mt-1 truncate">${event.description}</div>` : ''}
    </div>
  `;
}

function getTimeSlots() {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    slots.push(`${h} ${ampm}`);
  }
  return slots;
}

function groupEventsByDate(events) {
  return events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});
}

function getEventPosition(time) {
  if (!time) return { top: 0, height: 40 };
  const [timeStr, ampm] = time.split(' ');
  let hour = parseInt(timeStr);
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  
  const top = (hour - 6) * 60;
  return { top, height: 50 };
}
