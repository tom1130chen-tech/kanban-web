#!/usr/bin/env python3
"""
Kanban Board Data Manager
- Update project status
- Move tasks between columns
- Save to JSON for Blob upload
"""

import json
import os
from datetime import datetime

KANBAN_FILE = "/Users/tomchen/.openclaw/workspace-chat/kanban-board/data/kanban.json"

def load_kanban():
    """Load kanban data from file"""
    if os.path.exists(KANBAN_FILE):
        with open(KANBAN_FILE, 'r') as f:
            return json.load(f)
    return None

def save_kanban(data):
    """Save kanban data to file"""
    data['lastUpdated'] = datetime.now().isoformat()
    with open(KANBAN_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved to {KANBAN_FILE}")

def add_task(column_id, task_title, project, assignee, priority="medium"):
    """Add a task to a column"""
    data = load_kanban()
    if not data:
        print("❌ No kanban data found")
        return
    
    for column in data['columns']:
        if column['id'] == column_id:
            task_id = f"t{len(str(datetime.now().timestamp()))}"
            task = {
                "id": task_id,
                "title": task_title,
                "project": project,
                "assignee": assignee,
                "priority": priority
            }
            column['tasks'].append(task)
            print(f"✅ Added task: {task_title}")
            save_kanban(data)
            return
    
    print(f"❌ Column {column_id} not found")

def move_task(task_id, to_column_id):
    """Move a task to a different column"""
    data = load_kanban()
    if not data:
        print("❌ No kanban data found")
        return
    
    # Find and remove task from current column
    task = None
    for column in data['columns']:
        for i, t in enumerate(column['tasks']):
            if t['id'] == task_id:
                task = column['tasks'].pop(i)
                break
    
    if not task:
        print(f"❌ Task {task_id} not found")
        return
    
    # Add task to new column
    for column in data['columns']:
        if column['id'] == to_column_id:
            column['tasks'].append(task)
            print(f"✅ Moved task to {to_column_id}")
            save_kanban(data)
            return
    
    print(f"❌ Column {to_column_id} not found")

def update_project_progress(project_id, progress):
    """Update project progress percentage"""
    data = load_kanban()
    if not data:
        print("❌ No kanban data found")
        return
    
    for project in data['projects']:
        if project['id'] == project_id:
            project['progress'] = progress
            if progress >= 100:
                project['status'] = 'Completed'
            elif progress >= 50:
                project['status'] = 'In Progress'
            else:
                project['status'] = 'Planning'
            print(f"✅ Updated {project['name']} to {progress}%")
            save_kanban(data)
            return
    
    print(f"❌ Project {project_id} not found")

def show_summary():
    """Show kanban summary"""
    data = load_kanban()
    if not data:
        print("❌ No kanban data found")
        return
    
    print("\n📊 Kanban Board Summary")
    print("=" * 50)
    print(f"\n📁 Projects ({len(data['projects'])}):")
    for proj in data['projects']:
        print(f"   - {proj['name']}: {proj['progress']}% ({proj['status']})")
    
    print(f"\n📋 Columns ({len(data['columns'])}):")
    for col in data['columns']:
        print(f"   - {col['name']}: {len(col['tasks'])} tasks")
    
    print(f"\n🕐 Last Updated: {data['lastUpdated']}")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        show_summary()
    else:
        command = sys.argv[1]
        
        if command == "summary":
            show_summary()
        elif command == "add" and len(sys.argv) >= 6:
            add_task(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif command == "move" and len(sys.argv) >= 4:
            move_task(sys.argv[2], sys.argv[3])
        elif command == "progress" and len(sys.argv) >= 4:
            update_project_progress(sys.argv[2], int(sys.argv[3]))
        else:
            print("Usage:")
            print("  python3 kanban-manager.py summary")
            print("  python3 kanban-manager.py add <column_id> <task_title> <project> <assignee>")
            print("  python3 kanban-manager.py move <task_id> <to_column_id>")
            print("  python3 kanban-manager.py progress <project_id> <percentage>")
