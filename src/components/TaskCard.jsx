
import { Calendar, Trash2 } from 'lucide-react';
import Select from 'react-select';
import './TaskCard.css';

const TaskCard = ({ task, onUpdate, onDelete }) => {
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

  const columnOptions = [
    { value: 'todo', label: 'Por Hacer' },
    { value: 'in-progress', label: 'En Progreso' },
    { value: 'done', label: 'Completado' }
  ];

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

  return (
    <div className="task-card">
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div
          className="priority-indicator"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {task.due_date && (
        <div className="task-due-date">
          <Calendar size={14} />
          {formatDate(task.due_date)}
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