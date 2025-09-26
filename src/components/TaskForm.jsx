import { useState } from 'react';
import Select from 'react-select';
import './TaskForm.css';

const TaskForm = ({ onSubmit, onCancel, columns }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    columnId: columns.length > 0 ? columns[0].id : 'todo',
    dueDate: '',
    priority: 'medium'
  });

  const columnOptions = columns.map(column => ({
    value: column.id,
    label: column.name
  }));

  const priorityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' }
  ];

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'var(--bg-primary)',
      borderColor: state.isFocused ? 'var(--primary-color)' : 'var(--border-color)',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'var(--primary-color)'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--primary-color)'
        : state.isFocused
          ? 'var(--bg-tertiary)'
          : 'transparent',
      color: state.isSelected ? 'white' : 'var(--text-primary)',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--primary-color)' : 'var(--bg-tertiary)'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text-primary)'
    })
  };

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
            <Select
              options={columnOptions}
              value={columnOptions.find(option => option.value === formData.columnId)}
              onChange={(selectedOption) => setFormData(prev => ({ ...prev, columnId: selectedOption.value }))}
              styles={customStyles}
              placeholder="Seleccionar estado..."
              isSearchable={false}
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Prioridad</label>
            <Select
              options={priorityOptions}
              value={priorityOptions.find(option => option.value === formData.priority)}
              onChange={(selectedOption) => setFormData(prev => ({ ...prev, priority: selectedOption.value }))}
              styles={customStyles}
              placeholder="Seleccionar prioridad..."
              isSearchable={false}
            />
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