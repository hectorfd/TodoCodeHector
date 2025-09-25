import { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    columnId: 'todo',
    dueDate: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      columnId: formData.columnId,
      dueDate: formData.dueDate || null,
      priority: formData.priority
    });

    setFormData({
      title: '',
      description: '',
      columnId: 'todo',
      dueDate: '',
      priority: 'medium'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="task-form-overlay">
      <form onSubmit={handleSubmit} className="task-form">
        <h3>Nueva Tarea</h3>

        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="¿Qué necesitas hacer?"
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detalles adicionales..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="columnId">Estado</label>
            <select
              id="columnId"
              name="columnId"
              value={formData.columnId}
              onChange={handleChange}
            >
              <option value="todo">Por Hacer</option>
              <option value="in-progress">En Progreso</option>
              <option value="done">Completado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Prioridad</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate">Fecha límite</label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancelar
          </button>
          <button type="submit" className="submit-btn">
            Crear Tarea
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;