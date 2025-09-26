
import { Calendar, Trash2, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import ConfirmModal from './ConfirmModal';
import './TaskCard.css';

const TaskCard = ({ task, onUpdate, onDelete, columns, isKanbanView = false }) => {
  const [isDark, setIsDark] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleMove = (selectedOption) => {
    onUpdate(task.id, { column_id: selectedOption.value });
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
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

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
  };

  const getRecurrenceInfo = () => {
    // Solo mostrar info de recurrencia para tareas realmente recurrentes
    if (!task.is_recurring || !task.recurrence_type || task.interval_value === null || task.interval_value === undefined) {
      return null;
    }

    const interval = task.interval_value || 1;
    const type = task.recurrence_type;

    let patternText = '';
    switch (type) {
      case 'daily':
        patternText = interval === 1 ? 'Diario' : `Cada ${interval} días`;
        break;
      case 'weekly':
        patternText = interval === 1 ? 'Semanal' : `Cada ${interval} semanas`;
        break;
      case 'monthly':
        patternText = interval === 1 ? 'Mensual' : `Cada ${interval} meses`;
        break;
      case 'yearly':
        patternText = interval === 1 ? 'Anual' : `Cada ${interval} años`;
        break;
      default:
        return null; // Si no es un tipo válido, no mostrar nada
    }

    const endDate = task.recurrence_end_date;
    const endText = endDate ? ` hasta ${formatDate(endDate)}` : '';

    return {
      pattern: patternText,
      endDate: endDate,
      fullText: `${patternText}${endText}`
    };
  };

  const getNextOccurrences = () => {
    if (!task.is_recurring || !task.recurrence_type) return [];

    const baseDate = new Date(task.created_at);
    const interval = task.interval_value || 1;
    const type = task.recurrence_type;
    const endDate = task.recurrence_end_date ? new Date(task.recurrence_end_date) : null;
    const today = new Date();

    const occurrences = [];
    let currentDate = new Date(baseDate);

    for (let i = 0; i < 5; i++) {
      switch (type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (interval * 7));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + interval);
          break;
      }

      if (endDate && currentDate > endDate) break;
      if (currentDate > today) {
        occurrences.push(new Date(currentDate));
      }
    }

    return occurrences;
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
          <button
            onClick={handleDeleteClick}
            className="delete-btn-header"
            title="Eliminar tarea"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.due_date && (
        <div className={`task-due-date ${status.type}`}>
          <Calendar size={14} />
          <span
            title={`${formatDate(task.due_date)} (${getDayName(task.due_date)})`}
            className="date-with-tooltip"
          >
            {formatDate(task.due_date)}
          </span>
          {daysUntilDue !== null && (
            <span className="days-until-due">
              {daysUntilDue === 0 ? ' (Hoy)' :
               daysUntilDue === 1 ? ' (Mañana)' :
               daysUntilDue > 1 ? ` (en ${daysUntilDue} días)` :
               ` (${Math.abs(daysUntilDue)} días vencida)`}
            </span>
          )}
        </div>
      )}

      {task.is_recurring && (
        <div
          className="recurrence-details"
          style={isDark ? {
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.4)'
          } : {}}
        >
          <div
            className="recurrence-info"
            style={isDark ? { color: '#a78bfa' } : {}}
          >
            <RotateCcw size={12} />
            <span>{getRecurrenceInfo()?.fullText || 'Tarea recurrente'}</span>
          </div>

          {getNextOccurrences().length > 0 && (
            <div className="next-occurrences">
              <span className="next-label">Próximas:</span>
              {getNextOccurrences().slice(0, 3).map((date, index) => (
                <span
                  key={index}
                  className="next-date"
                  style={isDark ? {
                    background: '#a78bfa',
                    color: 'var(--text-primary)'
                  } : {}}
                  title={`${formatDate(date)} (${getDayName(date)})`}
                >
                  {formatDate(date)}
                </span>
              ))}
              {getNextOccurrences().length > 3 && <span className="more-dates">...</span>}
            </div>
          )}
        </div>
      )}

      {!isKanbanView && (
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
            onClick={handleDeleteClick}
            className="delete-btn"
            title="Eliminar tarea"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Eliminar Tarea"
        message={`¿Estás seguro de que quieres eliminar "${task.title}"? ${task.is_recurring ? 'Esta acción eliminará permanentemente la tarea recurrente y todos sus datos.' : 'Esta acción no se puede deshacer.'}`}
      />
    </div>
  );
};

export default TaskCard;