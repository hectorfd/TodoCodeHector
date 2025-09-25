import { useState } from 'react';
import { Plus, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import './KanbanBoard.css';

const KanbanBoard = ({ tasks, columns, onCreateTask, onUpdateTask, onDeleteTask }) => {
  const [showForm, setShowForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  const handleCreateTask = async (taskData) => {
    await onCreateTask(taskData);
    setShowForm(false);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.column_id !== columnId) {
      onUpdateTask(draggedTask.id, { column_id: columnId });
    }
    setDraggedTask(null);
  };

  const getTasksByColumn = (columnId) => {
    return tasks
      .filter(task => task.column_id === columnId)
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });
  };

  const getColumnStats = (columnId) => {
    const columnTasks = getTasksByColumn(columnId);
    return {
      total: columnTasks.length,
      highPriority: columnTasks.filter(t => t.priority === 'high').length,
      overdue: columnTasks.filter(t =>
        t.due_date && new Date(t.due_date) < new Date() && t.column_id !== 'done'
      ).length
    };
  };

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h2>Tablero Kanban</h2>
        <button
          className="add-task-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          Nueva Tarea
        </button>
      </div>

      <div className="kanban-board">
        {columns.map(column => {
          const columnTasks = getTasksByColumn(column.id);
          const stats = getColumnStats(column.id);

          return (
            <div
              key={column.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div
                className="column-header"
                style={{ borderTopColor: column.color }}
              >
                <div className="column-title">
                  <span className="column-name">{column.name}</span>
                  <span className="task-count">({stats.total})</span>
                </div>

                <div className="column-stats">
                  {stats.highPriority > 0 && (
                    <span className="stat high-priority">
                      <AlertCircle size={12} />
                      {stats.highPriority}
                    </span>
                  )}
                  {stats.overdue > 0 && (
                    <span className="stat overdue">
                      <Clock size={12} />
                      {stats.overdue}
                    </span>
                  )}
                </div>
              </div>

              <div className="column-body">
                {columnTasks.length === 0 ? (
                  <div className="empty-column">
                    <p>No hay tareas aquí</p>
                    <span>Arrastra tareas o crea una nueva</span>
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <div
                      key={task.id}
                      className="kanban-task-wrapper"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <TaskCard
                        task={task}
                        onUpdate={onUpdateTask}
                        onDelete={onDeleteTask}
                      />

                      <div className="task-indicators">
                        {task.due_date && (
                          <span
                            className={`due-date ${
                              new Date(task.due_date) < new Date() && task.column_id !== 'done'
                                ? 'overdue'
                                : ''
                            }`}
                          >
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}

                        {(task.duration_hours || task.duration_minutes) && (
                          <span className="duration">
                            {task.duration_hours || 0}h {task.duration_minutes || 0}m
                          </span>
                        )}

                        {task.is_recurring && (
                          <span className="recurring">
                            <RotateCcw size={10} />
                          </span>
                        )}

                        {task.start_time && (
                          <span className="start-time">
                            <Clock size={10} />
                            {task.start_time}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="column-footer">
                <button
                  className="add-to-column-btn"
                  onClick={() => setShowForm(true)}
                >
                  <Plus size={12} />
                  Añadir tarea
                </button>
              </div>
            </div>
          );
        })}
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

export default KanbanBoard;