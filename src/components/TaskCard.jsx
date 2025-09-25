
import './TaskCard.css';

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const handleMove = (newColumnId) => {
    onUpdate(task.id, { column_id: newColumnId });
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
          📅 {formatDate(task.due_date)}
        </div>
      )}

      <div className="task-actions">
        <select
          value={task.column_id}
          onChange={(e) => handleMove(e.target.value)}
          className="move-select"
        >
          <option value="todo">Por Hacer</option>
          <option value="in-progress">En Progreso</option>
          <option value="done">Completado</option>
        </select>

        <button
          onClick={() => onDelete(task.id)}
          className="delete-btn"
          title="Eliminar tarea"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default TaskCard;