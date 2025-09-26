
import { useState, useEffect, useRef } from 'react';
import { Plus, AlertCircle, Clock, RotateCcw, ArrowRight } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import './KanbanBoard.css';

const KanbanBoard = ({ tasks, columns, onCreateTask, onUpdateTask, onDeleteTask }) => {
  const [showForm, setShowForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const columnsRef = useRef([]);

  const handleCreateTask = async (taskData) => {
    try {
      console.log('🎯 KanbanBoard: Creando tarea...', taskData);
      await onCreateTask(taskData);
      console.log('✅ KanbanBoard: Tarea creada exitosamente');
      setShowForm(false);
      setSelectedColumn(null);
    } catch (error) {
      console.error('❌ KanbanBoard: Error creando tarea:', error);
      alert('Error creando la tarea: ' + error.message);
    }
  };

  const handleAddToColumn = (columnId) => {
    setSelectedColumn(columnId);
    setShowForm(true);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';

    const taskElement = e.target.closest('.kanban-task-wrapper');
    if (taskElement) {
      taskElement.classList.add('dragging');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && draggedTask.column_id !== columnId) {
      onUpdateTask(draggedTask.id, { column_id: columnId });
    }
    setDraggedTask(null);

    document.querySelectorAll('.kanban-task-wrapper.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    document.querySelectorAll('.column-body.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
    e.currentTarget.classList.remove('drag-over');
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

  const equalizeColumnHeights = () => {
    if (columnsRef.current.length === 0) return;

    // Resetear alturas primero
    columnsRef.current.forEach(column => {
      if (column) {
        const columnBody = column.querySelector('.column-body');
        if (columnBody) {
          columnBody.style.minHeight = 'auto';
        }
      }
    });

    // Calcular altura máxima después de un pequeño delay para que se renderice
    setTimeout(() => {
      let maxHeight = 0;
      columnsRef.current.forEach(column => {
        if (column) {
          const columnBody = column.querySelector('.column-body');
          if (columnBody) {
            const height = columnBody.scrollHeight;
            maxHeight = Math.max(maxHeight, height);
          }
        }
      });
      if (maxHeight > 0) {
        columnsRef.current.forEach(column => {
          if (column) {
            const columnBody = column.querySelector('.column-body');
            if (columnBody) {
              columnBody.style.minHeight = `${maxHeight}px`;
            }
          }
        });
      }
    }, 10);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      equalizeColumnHeights();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [tasks, columns]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      equalizeColumnHeights();
    });

    const currentColumns = columnsRef.current.filter(col => col);
    currentColumns.forEach(column => {
      resizeObserver.observe(column);
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
        {columns.map((column, index) => {
          const columnTasks = getTasksByColumn(column.id);
          const stats = getColumnStats(column.id);
          const isLastColumn = index === columns.length - 1;

          return (
            <div
              key={column.id}
              ref={el => columnsRef.current[index] = el}
              className="kanban-column"
              onMouseEnter={() => setHoveredColumn(column.id)}
              onMouseLeave={() => setHoveredColumn(null)}
            >
              <div
                className="column-header"
                style={{ borderTopColor: column.color }}
              >
                <div className="column-title">
                  <span className="column-name">{column.name}</span>
                  <span className="task-count">({stats.total})</span>
                </div>

              </div>

              <div
                className="column-body"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {columnTasks.length === 0 ? (
                  <div
                    className="empty-column"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <p>No hay tareas aquí</p>
                    <span>Arrastra tareas o crea una nueva</span>
                  </div>
                ) : (
                  <div className="tasks-container">
                    {columnTasks.map(task => (
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
                          columns={columns}
                          isKanbanView={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

                {hoveredColumn === column.id && (
                  <button
                    className="floating-add-btn"
                    onClick={() => handleAddToColumn(column.id)}
                    title={`Añadir tarea a ${column.name}`}
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
          );
        })}
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
          columns={columns}
          defaultColumnId={selectedColumn}
        />
      )}
    </div>
  );
};

export default KanbanBoard;