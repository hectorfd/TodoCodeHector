import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseService {
  constructor() {
    const dbPath = path.join(__dirname, '../../data/tasks.db');
    this.db = new Database(dbPath);
    this.initTables();
  }

  initTables() {
    const createTables = `
      CREATE TABLE IF NOT EXISTS columns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        order_index INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        column_id TEXT,
        due_date DATETIME,
        completed_at DATETIME,
        duration_hours INTEGER,
        duration_minutes INTEGER,
        start_time TEXT,
        end_time TEXT,
        priority TEXT DEFAULT 'medium',
        is_recurring BOOLEAN DEFAULT 0,
        parent_task_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (column_id) REFERENCES columns (id)
      );

      CREATE TABLE IF NOT EXISTS task_recurrence (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        recurrence_type TEXT NOT NULL,
        interval_value INTEGER DEFAULT 1,
        days_of_week TEXT,
        days_of_month TEXT,
        end_date DATETIME,
        max_occurrences INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      );

      CREATE TABLE IF NOT EXISTS custom_fields (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        field_name TEXT,
        field_value TEXT,
        field_type TEXT DEFAULT 'text',
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        filename TEXT,
        file_path TEXT,
        file_size INTEGER,
        mime_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id)
      );
    `;

    this.db.exec(createTables);
    this.seedDefaultColumns();
  }

  seedDefaultColumns() {
    const existingColumns = this.db.prepare('SELECT COUNT(*) as count FROM columns').get();

    if (existingColumns.count === 0) {
      const insertColumn = this.db.prepare(`
        INSERT INTO columns (id, name, color, order_index)
        VALUES (?, ?, ?, ?)
      `);

      const defaultColumns = [
        { id: 'todo', name: 'Por Hacer', color: '#6366f1', order: 0 },
        { id: 'in-progress', name: 'En Progreso', color: '#f59e0b', order: 1 },
        { id: 'done', name: 'Completado', color: '#10b981', order: 2 }
      ];

      defaultColumns.forEach(col => {
        insertColumn.run(col.id, col.name, col.color, col.order);
      });
    }
  }

  getAllColumns() {
    return this.db.prepare('SELECT * FROM columns ORDER BY order_index').all();
  }

  createColumn(column) {
    const stmt = this.db.prepare(`
      INSERT INTO columns (id, name, color, order_index)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(column.id, column.name, column.color, column.order_index);
  }

  updateColumn(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE columns SET ${fields} WHERE id = ?`);
    return stmt.run(...values, id);
  }

  deleteColumn(id) {
    const hasTasksStmt = this.db.prepare('SELECT COUNT(*) as count FROM tasks WHERE column_id = ?');
    const taskCount = hasTasksStmt.get(id);

    if (taskCount.count > 0) {
      throw new Error('No se puede eliminar una columna que contiene tareas');
    }

    return this.db.prepare('DELETE FROM columns WHERE id = ?').run(id);
  }

  reorderColumns(columnOrders) {
    const updateStmt = this.db.prepare('UPDATE columns SET order_index = ? WHERE id = ?');
    const transaction = this.db.transaction((orders) => {
      for (const { id, order_index } of orders) {
        updateStmt.run(order_index, id);
      }
    });
    return transaction(columnOrders);
  }

  getAllTasks() {
    return this.db.prepare(`
      SELECT t.*, c.name as column_name, c.color as column_color
      FROM tasks t
      LEFT JOIN columns c ON t.column_id = c.id
      ORDER BY t.created_at DESC
    `).all();
  }

  createTask(task) {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, title, description, column_id, due_date, duration_hours,
        duration_minutes, start_time, end_time, priority, is_recurring, parent_task_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      task.id, task.title, task.description, task.columnId, task.dueDate,
      task.durationHours || null, task.durationMinutes || null,
      task.startTime || null, task.endTime || null, task.priority,
      task.isRecurring || 0, task.parentTaskId || null
    );
  }

  createRecurrence(recurrence) {
    const stmt = this.db.prepare(`
      INSERT INTO task_recurrence (id, task_id, recurrence_type, interval_value,
        days_of_week, days_of_month, end_date, max_occurrences)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      recurrence.id, recurrence.taskId, recurrence.type, recurrence.interval,
      recurrence.daysOfWeek, recurrence.daysOfMonth, recurrence.endDate, recurrence.maxOccurrences
    );
  }

  completeTask(taskId) {
    const stmt = this.db.prepare(`
      UPDATE tasks SET column_id = 'done', completed_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(taskId);
  }

  getTaskWithRecurrence(taskId) {
    const task = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (task && task.is_recurring) {
      const recurrence = this.db.prepare('SELECT * FROM task_recurrence WHERE task_id = ?').get(taskId);
      task.recurrence = recurrence;
    }
    return task;
  }

  updateTask(id, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE tasks SET ${fields} WHERE id = ?`);
    return stmt.run(...values, id);
  }

  deleteTask(id) {
    return this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  }

  close() {
    this.db.close();
  }
}

export default DatabaseService;