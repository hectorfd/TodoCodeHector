
import { Calendar, Trash2, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import Select from 'react-select';
import './TaskCard.css';

const TaskCard = ({ task, onUpdate, onDelete, columns }) => {
  const handleMove = (selectedOption) => {
    onUpdate(task.id, { column_id: selectedOption.value });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[priority] || colors.medium;
  };

  const getTaskStatus = () => {
    const now = new Date();
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const isCompleted = task.column_id === 'done';

    if (isCompleted) return { type: 'completed', label: 'Completada', color: '#10b981' };
    if (dueDate && dueDate < now) return { type: 'overdue', label: 'Vencida', color: '#ef4444' };
    if (dueDate && dueDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
      return { type: 'due-soon', label: 'Vence hoy', color: '#f59e0b' };
    }
    if (task.is_recurring) return { type: 'recurring', label: 'Recurrente', color: '#8b5cf6' };
    return { type: 'normal', label: 'Normal', color: '#6b7280' };
  };

  const getDaysUntilDue = () => {
    if (!task.due_date) return null;
    const now = new Date();
    const dueDate = new Date(task.due_date);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columnOptions = columns.map(column => ({
    value: column.id,
    label: column.name
  }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'var(--bg-primary)',
      borderColor: 'var(--border-color)',
      minHeight: '32px',
      fontSize: '12px',
      '&:hover': {
        borderColor: 'var(--primary-color)'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      fontSize: '12px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--primary-color)'
        : state.isFocused
          ? 'var(--bg-tertiary)'
          : 'transparent',
      color: state.isSelected ? 'white' : 'var(--text-primary)',
      fontSize: '12px',
      padding: '6px 12px'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text-primary)',
      fontSize: '12px'
    })
  };

  const status = getTaskStatus();
  const daysUntilDue = getDaysUntilDue();

  return (
    <div className={`task-card ${status.type}`}>
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-indicators">
          <div
            className="priority-indicator"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
            title={`Prioridad: ${task.priority}`}
          />
          {status.type !== 'normal' && (
            <div
              className={`status-badge ${status.type}`}
              style={{ backgroundColor: status.color }}
              title={status.label}
            >
              {status.type === 'overdue' && <AlertTriangle size={10} />}
              {status.type === 'due-soon' && <Clock size={10} />}
              {status.type === 'recurring' && <RotateCcw size={10} />}
              {status.type === 'completed' && '✓'}
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.due_date && (
        <div className={`task-due-date ${status.type}`}>
          <Calendar size={14} />
          <span>{formatDate(task.due_date)}</span>
          {daysUntilDue !== null && (
            <span className="days-until-due">
              {daysUntilDue === 0 && ' (Hoy)'}
              {daysUntilDue === 1 && ' (Mañana)'}
              {daysUntilDue > 1 && ` (en ${daysUntilDue} días)`}
              {daysUntilDue < 0 && ` (${Math.abs(daysUntilDue)} días vencida)`}
            </span>
          )}
        </div>
      )}

      {task.is_recurring && (
        <div className="recurrence-info">
          <RotateCcw size={12} />
          <span>Tarea recurrente</span>
        </div>
      )}

      <div className="task-actions">
        <Select
          options={columnOptions}
          value={columnOptions.find(option => option.value === task.column_id)}
          onChange={handleMove}
          styles={customStyles}
          isSearchable={false}
          className="move-select"
        />

        <button
          onClick={() => onDelete(task.id)}
          className="delete-btn"
          title="Eliminar tarea"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;