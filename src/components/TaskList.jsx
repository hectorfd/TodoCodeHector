import { useState } from 'react';
import { Plus, Clock, RotateCcw, Calendar } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import './TaskList.css';

const TaskList = ({ tasks, columns, onCreateTask, onUpdateTask, onDeleteTask }) => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  const handleCreateTask = async (taskData) => {
    await onCreateTask(taskData);
    setShowForm(false);
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (filter !== 'all') {
      filtered = filtered.filter(task => task.column_id === filter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  };

  const formatDuration = (hours, minutes) => {
    if (!hours && !minutes) return '';
    const parts = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    return parts.join(' ');
  };

  const getTaskStats = () => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.column_id === 'todo').length,
      inProgress: tasks.filter(t => t.column_id === 'in-progress').length,
      completed: tasks.filter(t => t.column_id === 'done').length
    };
  };

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <div className="header-left">
          <h2>Lista de Tareas</h2>
          <div className="task-stats">
            <span className="stat">Total: {stats.total}</span>
            <span className="stat pending">Pendientes: {stats.pending}</span>
            <span className="stat progress">En Progreso: {stats.inProgress}</span>
            <span className="stat completed">Completadas: {stats.completed}</span>
          </div>
        </div>

        <button
          className="add-task-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          Nueva Tarea
        </button>
      </div>

      <div className="task-list-controls">
        <div className="filters">
          <label>Filtrar:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="todo">Por Hacer</option>
            <option value="in-progress">En Progreso</option>
            <option value="done">Completadas</option>
          </select>
        </div>

        <div className="sorting">
          <label>Ordenar:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Fecha Creación</option>
            <option value="due_date">Fecha Límite</option>
            <option value="priority">Prioridad</option>
            <option value="title">Título</option>
          </select>
        </div>
      </div>

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No hay tareas que mostrar</p>
            <button onClick={() => setShowForm(true)}>
              <Plus size={16} />
              Crear tu primera tarea
            </button>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="task-list-item">
              <TaskCard
                task={task}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />

              <div className="task-metadata">
                {(task.duration_hours || task.duration_minutes) && (
                  <span className="duration">
                    <Clock size={12} />
                    {formatDuration(task.duration_hours, task.duration_minutes)}
                  </span>
                )}

                {task.start_time && task.end_time && (
                  <span className="schedule">
                    <Clock size={12} />
                    {task.start_time} - {task.end_time}
                  </span>
                )}

                {task.is_recurring && (
                  <span className="recurring">
                    <RotateCcw size={12} />
                    Recurrente
                  </span>
                )}

                <span className="created">
                  <Calendar size={12} />
                  Creada: {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default TaskList;