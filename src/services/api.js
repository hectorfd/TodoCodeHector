import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './database.js';

class ApiServer {
  constructor(port = 3001) {
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
        this.db.deleteTask(id);
        res.json({ message: 'Task deleted successfully' });
      } catch (error) {
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
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`API server running on port ${this.port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
    this.db.close();
  }
}

export default ApiServer;