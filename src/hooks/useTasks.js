import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchColumns = async () => {
    try {
      const response = await fetch(`${API_BASE}/columns`);
      const data = await response.json();
      setColumns(data);
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const newTask = await response.json();
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const createColumn = async (columnData) => {
    try {
      const response = await fetch(`${API_BASE}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(columnData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newColumn = await response.json();
      setColumns(prev => [...prev, newColumn].sort((a, b) => a.order_index - b.order_index));
      return newColumn;
    } catch (error) {
      console.error('Error creating column:', error);
      throw error;
    }
  };

  const updateColumn = async (id, updates) => {
    try {
      await fetch(`${API_BASE}/columns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setColumns(prev => prev.map(column =>
        column.id === id ? { ...column, ...updates } : column
      ));
    } catch (error) {
      console.error('Error updating column:', error);
    }
  };

  const deleteColumn = async (id) => {
    try {
      await fetch(`${API_BASE}/columns/${id}`, { method: 'DELETE' });
      setColumns(prev => prev.filter(column => column.id !== id));
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const reorderColumns = async (columnOrders) => {
    try {
      await fetch(`${API_BASE}/columns/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnOrders })
      });
      setColumns(prev => prev.map(column => {
        const newOrder = columnOrders.find(order => order.id === column.id);
        return newOrder ? { ...column, order_index: newOrder.order_index } : column;
      }).sort((a, b) => a.order_index - b.order_index));
    } catch (error) {
      console.error('Error reordering columns:', error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`${API_BASE}/export`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  useEffect(() => {
    fetchColumns();
    fetchTasks();
  }, []);

  return {
    tasks,
    columns,
    loading,
    createTask,
    updateTask,
    deleteTask,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    exportData,
    refetch: () => {
      fetchColumns();
      fetchTasks();
    }
  };
};