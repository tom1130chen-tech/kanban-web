/**
 * Todo List Template Component
 * 
 * Pre-built template - just pass data
 * Usage: <TodoTemplate todos={todos} />
 */

export function TodoTemplate({ todos }) {
  if (!todos || todos.length === 0) {
    return renderEmptyState();
  }

  return `
    <div class="space-y-3">
      ${todos.map(todo => renderTodoItem(todo)).join('')}
    </div>
  `;
}

function renderTodoItem(todo) {
  const completedClass = todo.completed
    ? "bg-gray-100 border-gray-300 border-dashed"
    : "bg-white border-gray-400 border-dashed hover:border-[var(--accent)] hover:shadow-md cursor-pointer";

  const textClass = todo.completed
    ? "text-gray-500 line-through"
    : "text-gray-900 font-handwritten";

  const checkboxClass = todo.completed
    ? "border-gray-400 bg-gray-400"
    : "border-gray-400 group-hover:border-[var(--accent)]";

  return `
    <div class="group p-4 rounded-[225px_18px_255px_18px/18px_255px_18px_225px] border-2 transition-all ${completedClass}">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${checkboxClass}">
          ${todo.completed ? renderCheckmark() : ''}
        </div>
        <div class="flex-1">
          <div class="text-sm ${textClass}">
            ${escapeHtml(todo.title)}
          </div>
          ${todo.source ? `
            <div class="text-xs text-gray-400 mt-1">
              via ${escapeHtml(todo.source)}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderCheckmark() {
  return `
    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
    </svg>
  `;
}

function renderEmptyState() {
  return `
    <div class="text-center py-12">
      <div class="text-4xl mb-4">📝</div>
      <p class="text-gray-500">No tasks yet</p>
      <p class="text-sm text-gray-400 mt-2">Ask Chat to add some!</p>
    </div>
  `;
}

function escapeHtml(text) {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  // Fallback for server-side
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
