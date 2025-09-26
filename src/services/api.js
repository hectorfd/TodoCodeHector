import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './database.js';

class ApiServer {
  constructor(port = 3002) {
    this.app = express();
    this.port = port;
    this.db = new DatabaseService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/api/columns', (req, res) => {
      try {
        const columns = this.db.getAllColumns();
        res.json(columns);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/columns', (req, res) => {
      try {
        const columnData = req.body;
        const column = {
          id: uuidv4(),
          name: columnData.name,
          color: columnData.color || '#6366f1',
          order_index: columnData.order_index || 0
        };

        this.db.createColumn(column);
        res.status(201).json(column);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.put('/api/columns/:id', (req, res) => {
      try {
        const { id } = req.params;
        this.db.updateColumn(id, req.body);
        res.json({ message: 'Column updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.delete('/api/columns/:id', (req, res) => {
      try {
        const { id } = req.params;
        this.db.deleteColumn(id);
        res.json({ message: 'Column deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.put('/api/columns/reorder', (req, res) => {
      try {
        const { columnOrders } = req.body;
        this.db.reorderColumns(columnOrders);
        res.json({ message: 'Columns reordered successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/tasks', (req, res) => {
      try {
        const tasks = this.db.getAllTasks();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/tasks', (req, res) => {
      try {
        const taskData = req.body;
        const task = {
          id: uuidv4(),
          title: taskData.title,
          description: taskData.description || null,
          columnId: taskData.columnId || 'todo',
          dueDate: taskData.dueDate || null,
          priority: taskData.priority || 'medium',
          durationHours: taskData.durationHours || null,
          durationMinutes: taskData.durationMinutes || null,
          startTime: taskData.startTime || null,
          endTime: taskData.endTime || null,
          isRecurring: taskData.isRecurring || false
        };

        console.log('Creating task:', task);
        this.db.createTask(task);

        if (taskData.isRecurring && taskData.recurrenceType && taskData.recurrenceType !== 'undefined') {
          const recurrence = {
            id: uuidv4(),
            taskId: task.id,
            type: taskData.recurrenceType,
            interval: taskData.recurrenceInterval || 1,
            endDate: taskData.recurrenceEndDate || null
          };
          console.log('Creating recurrence:', recurrence);
          this.db.createRecurrence(recurrence);
        }

        res.status(201).json(task);
      } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.put('/api/tasks/:id', (req, res) => {
      try {
        const { id } = req.params;
        this.db.updateTask(id, req.body);
        res.json({ message: 'Task updated successfully' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.delete('/api/tasks/:id', (req, res) => {
      try {
        const { id } = req.params;
        console.log('🔥 FUERZA BRUTA: Eliminando tarea con ID:', id);
        const result = this.db.deleteTask(id);
        console.log('✅ ÉXITO: Tarea eliminada:', result);
        res.json({
          message: 'Task deleted successfully',
          changes: result.changes,
          success: true
        });
      } catch (error) {
        console.error('❌ FALLO ELIMINANDO TAREA:', error);
        res.status(500).json({
          error: error.message,
          success: false,
          taskId: req.params.id
        });
      }
    });

    this.app.delete('/api/tasks/:id/recurring', (req, res) => {
      try {
        const { id } = req.params;
        console.log('Attempting to delete recurring task with ID:', id);
        const result = this.db.deleteRecurringTask(id);
        console.log('Recurring delete result:', result);
        res.json({ message: 'Recurring task deleted successfully' });
      } catch (error) {
        console.error('Error deleting recurring task:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/tasks/generate-recurring', (req, res) => {
      try {
        const generatedTasks = this.generateRecurringTasks();
        res.json({
          message: `Generated ${generatedTasks} recurring tasks`,
          count: generatedTasks
        });
      } catch (error) {
        console.error('Error generating recurring tasks:', error);
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/export', (req, res) => {
      try {
        const columns = this.db.getAllColumns();
        const tasks = this.db.getAllTasks();
        const exportData = {
          columns,
          tasks,
          exportDate: new Date().toISOString()
        };
        res.json(exportData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/debug/database', (req, res) => {
      try {
        console.log('🔍 INSPECCIONANDO BASE DE DATOS...');

        const tasks = this.db.db.prepare('SELECT * FROM tasks').all();
        const recurrence = this.db.db.prepare('SELECT * FROM task_recurrence').all();

        console.log('📋 TASKS EN DB:', tasks.length);
        console.log('🔄 RECURRENCE EN DB:', recurrence.length);

        res.json({
          totalTasks: tasks.length,
          totalRecurrence: recurrence.length,
          tasks: tasks.map(t => ({ id: t.id, title: t.title, is_recurring: t.is_recurring })),
          recurrence: recurrence.map(r => ({ task_id: r.task_id, type: r.recurrence_type })),
          raw: { tasks, recurrence }
        });
      } catch (error) {
        console.error('❌ ERROR inspeccionando DB:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 API server running on port ${this.port}`);
      console.log(`🔍 Debug endpoint: http://localhost:${this.port}/api/debug/database`);
    });
  }

  generateRecurringTasks() {
    const recurringTasks = this.db.getRecurringTasks();
    let generatedCount = 0;
    const today = new Date();

    recurringTasks.forEach(task => {
      if (!task.recurrence) return;

      const lastCreated = task.last_generated ? new Date(task.last_generated) : new Date(task.created_at);
      const nextDue = this.calculateNextDueDate(lastCreated, task.recurrence);

      if (nextDue <= today) {
        const shouldGenerate = !task.recurrence.end_date ||
                              new Date(task.recurrence.end_date) >= nextDue;

        if (shouldGenerate) {
          const newTask = {
            id: uuidv4(),
            title: task.title,
            description: task.description,
            columnId: task.column_id,
            dueDate: nextDue.toISOString().split('T')[0],
            priority: task.priority,
            durationHours: task.duration_hours,
            durationMinutes: task.duration_minutes,
            startTime: task.start_time,
            endTime: task.end_time,
            isRecurring: false,
            parentTaskId: task.id
          };

          this.db.createTask(newTask);
          this.db.updateTask(task.id, { last_generated: today.toISOString() });
          generatedCount++;
        }
      }
    });

    return generatedCount;
  }

  calculateNextDueDate(lastDate, recurrence) {
    const nextDate = new Date(lastDate);
    const interval = recurrence.interval_value || 1;

    switch (recurrence.recurrence_type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (interval * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    return nextDate;
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
    this.db.close();
  }
}

export default ApiServer;