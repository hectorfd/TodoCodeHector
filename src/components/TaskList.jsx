import { useState } from 'react';
import { Plus, Clock, RotateCcw, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import Select from 'react-select';
import TaskForm from './TaskForm';
import './TaskList.css';

const TaskList = ({ tasks, columns, onCreateTask, onUpdateTask, onDeleteTask }) => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    ...columns.map(column => ({
      value: column.id,
      label: column.name
    }))
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Fecha Creación' },
    { value: 'due_date', label: 'Fecha Límite' },
    { value: 'priority', label: 'Prioridad' },
    { value: 'title', label: 'Título' }
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'var(--bg-primary)',
      borderColor: 'var(--border-color)',
      minHeight: '40px',
      minWidth: '150px',
      fontSize: '14px',
      '&:hover': {
        borderColor: 'var(--primary-color)'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      fontSize: '14px',
      zIndex: 9999
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--primary-color)'
        : state.isFocused
          ? 'var(--bg-tertiary)'
          : 'transparent',
      color: state.isSelected ? 'white' : 'var(--text-primary)',
      fontSize: '14px'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text-primary)',
      fontSize: '14px'
    })
  };

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

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[priority] || colors.medium;
  };

  const getColumnColor = (columnId) => {
    const column = columns.find(c => c.id === columnId);
    return column?.color || '#6b7280';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTasks = getFilteredTasks();
  const stats = getTaskStats();

  // Debug: verificar si llegan las fechas
  if (filteredTasks.length > 0) {
    console.log('PRIMERA TAREA:', filteredTasks[0]);
  }

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
          <Select
            options={filterOptions}
            value={filterOptions.find(option => option.value === filter)}
            onChange={(selectedOption) => setFilter(selectedOption.value)}
            styles={customStyles}
            isSearchable={false}
            menuPortalTarget={document.body}
          />
        </div>

        <div className="sorting">
          <label>Ordenar:</label>
          <Select
            options={sortOptions}
            value={sortOptions.find(option => option.value === sortBy)}
            onChange={(selectedOption) => setSortBy(selectedOption.value)}
            styles={customStyles}
            isSearchable={false}
            menuPortalTarget={document.body}
          />
        </div>
      </div>

      <div className="tasks-table">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No hay tareas que mostrar</p>
            <button onClick={() => setShowForm(true)}>
              <Plus size={16} />
              Crear tu primera tarea
            </button>
          </div>
        ) : (
          <div className="table-container">
            <div className="table-header">
              <div className="col-priority">•</div>
              <div className="col-title">Tarea</div>
              <div className="col-status">Estado</div>
              <div className="col-due">Fecha Límite</div>
              <div className="col-meta">Detalles</div>
              <div className="col-actions">Acciones</div>
            </div>

            <div className="table-body">
              {filteredTasks.map(task => (
                <div key={task.id} className={`table-row ${isOverdue(task.due_date) ? 'overdue' : ''}`}>
                  <div className="col-priority">
                    <div
                      className="priority-dot"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                      title={`Prioridad: ${task.priority}`}
                    />
                  </div>

                  <div className="col-title">
                    <div className="task-title-container">
                      <span className="task-title">{task.title}</span>
                      {task.is_recurring && (
                        <RotateCcw size={14} className="recurring-icon" title="Tarea recurrente" />
                      )}
                      {isOverdue(task.due_date) && (
                        <AlertTriangle size={14} className="overdue-icon" title="Vencida" />
                      )}
                    </div>
                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}
                  </div>

                  <div className="col-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getColumnColor(task.column_id) }}
                    >
                      {columns.find(c => c.id === task.column_id)?.name || 'Sin estado'}
                    </span>
                  </div>

                  <div className="col-due">
                    {task.due_date ? (
                      <span className={isOverdue(task.due_date) ? 'overdue-date' : ''}>
                        {formatDate(task.due_date)}
                      </span>
                    ) : (
                      <span className="no-date">Sin fecha</span>
                    )}
                  </div>

                  <div className="col-meta">
                    <div className="meta-items">
                      {(task.duration_hours || task.duration_minutes) && (
                        <span className="meta-item">
                          <Clock size={12} />
                          {formatDuration(task.duration_hours, task.duration_minutes)}
                        </span>
                      )}

                      {task.start_time && task.end_time && (
                        <span className="meta-item">
                          <Clock size={12} />
                          {task.start_time}-{task.end_time}
                        </span>
                      )}

                      <span className="meta-item created-date">
                        <Calendar size={12} />
                        {formatDate(task.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="col-actions">
                    <Select
                      options={columns.map(col => ({ value: col.id, label: col.name }))}
                      value={columns.find(col => col.id === task.column_id) ?
                        { value: task.column_id, label: columns.find(col => col.id === task.column_id).name } :
                        null}
                      onChange={(selected) => onUpdateTask(task.id, { column_id: selected.value })}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '32px',
                          fontSize: '12px',
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border-color)',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: 'var(--bg-secondary)',
                          fontSize: '12px',
                          zIndex: 9999
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? 'var(--primary-color)' :
                                         state.isFocused ? 'var(--bg-tertiary)' : 'transparent',
                          color: state.isSelected ? 'white' : 'var(--text-primary)',
                          fontSize: '12px'
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: 'var(--text-primary)',
                          fontSize: '12px'
                        })
                      }}
                      isSearchable={false}
                      className="status-select"
                      menuPortalTarget={document.body}
                    />

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="delete-btn"
                      title="Eliminar tarea"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
          columns={columns}
        />
      )}
    </div>
  );
};

export default TaskList;