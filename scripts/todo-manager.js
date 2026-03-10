#!/usr/bin/env node

/**
 * Todo Manager for Chat Agent
 * 
 * Usage:
 *   node scripts/todo-manager.js add "Task description"
 *   node scripts/todo-manager.js complete "Task ID"
 *   node scripts/todo-manager.js list
 *   node scripts/todo-manager.js remove "Task ID"
 */

const fs = require('fs').promises;
const path = require('path');

const TODOS_FILE = path.join(__dirname, '..', 'data', 'todos.json');

function generateId() {
  return `todo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

async function loadTodos() {
  try {
    const data = await fs.readFile(TODOS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function saveTodos(todos) {
  await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
}

async function addTodo(title, options = {}) {
  const todos = await loadTodos();
  const newTodo = {
    id: generateId(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    source: 'chat',
    ...options,
  };
  todos.push(newTodo);
  await saveTodos(todos);
  console.log(`✅ Added todo: "${title}" (ID: ${newTodo.id})`);
  return newTodo;
}

async function completeTodo(todoId) {
  const todos = await loadTodos();
  const todo = todos.find(t => t.id === todoId || t.title.toLowerCase().includes(todoId.toLowerCase()));
  if (!todo) {
    console.log(`❌ Todo not found: ${todoId}`);
    return null;
  }
  todo.completed = true;
  await saveTodos(todos);
  console.log(`✅ Completed: "${todo.title}"`);
  return todo;
}

async function listTodos() {
  const todos = await loadTodos();
  console.log(`\n📋 Todos (${todos.length} total):\n`);
  
  const pending = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);
  
  if (pending.length > 0) {
    console.log('⏳ Pending:');
    pending.forEach(t => {
      console.log(`  ☐ [${t.id}] ${t.title}`);
    });
    console.log('');
  }
  
  if (completed.length > 0) {
    console.log('✅ Completed:');
    completed.forEach(t => {
      console.log(`  ✓ [${t.id}] ${t.title}`);
    });
  }
  
  return todos;
}

async function removeTodo(todoId) {
  const todos = await loadTodos();
  const filtered = todos.filter(t => t.id !== todoId);
  if (filtered.length === todos.length) {
    console.log(`❌ Todo not found: ${todoId}`);
    return false;
  }
  await saveTodos(filtered);
  console.log(`✅ Removed todo: ${todoId}`);
  return true;
}

// CLI interface
async function main() {
  const [command, ...args] = process.argv.slice(2);
  const arg = args.join(' ');
  
  switch (command) {
    case 'add':
      await addTodo(arg);
      break;
    case 'complete':
      await completeTodo(arg);
      break;
    case 'list':
      await listTodos();
      break;
    case 'remove':
      await removeTodo(arg);
      break;
    default:
      console.log('Usage:');
      console.log('  node todo-manager.js add "Task description"');
      console.log('  node todo-manager.js complete "Task ID"');
      console.log('  node todo-manager.js list');
      console.log('  node todo-manager.js remove "Task ID"');
  }
}

main().catch(console.error);
