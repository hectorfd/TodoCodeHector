import { useState } from 'react';
import Select from 'react-select';
import './TaskForm.css';

const TaskForm = ({ onSubmit, onCancel, columns, defaultColumnId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    columnId: defaultColumnId || (columns.length > 0 ? columns[0].id : 'todo'),
    dueDate: '',
    priority: 'medium',
    isRecurring: false,
    recurrenceType: 'daily',
    recurrenceInterval: 1,
    recurrenceEndDate: ''
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

  const recurrenceOptions = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'yearly', label: 'Anual' }
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
      priority: formData.priority,
      isRecurring: formData.isRecurring,
      recurrenceType: formData.isRecurring ? formData.recurrenceType : null,
      recurrenceInterval: formData.isRecurring ? formData.recurrenceInterval : null,
      recurrenceEndDate: formData.isRecurring && formData.recurrenceEndDate ? formData.recurrenceEndDate : null
    });

    setFormData({
      title: '',
      description: '',
      columnId: columns.length > 0 ? columns[0].id : 'todo',
      dueDate: '',
      priority: 'medium',
      isRecurring: false,
      recurrenceType: 'daily',
      recurrenceInterval: 1,
      recurrenceEndDate: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getIntervalLabel = () => {
    const interval = parseInt(formData.recurrenceInterval);
    switch (formData.recurrenceType) {
      case 'daily':
        return interval === 1 ? 'día' : 'días';
      case 'weekly':
        return interval === 1 ? 'semana' : 'semanas';
      case 'monthly':
        return interval === 1 ? 'mes' : 'meses';
      case 'yearly':
        return interval === 1 ? 'año' : 'años';
      default:
        return 'días';
    }
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

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
            />
            Tarea recurrente
          </label>
        </div>

        {formData.isRecurring && (
          <div className="recurrence-options">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recurrenceType">Frecuencia</label>
                <Select
                  options={recurrenceOptions}
                  value={recurrenceOptions.find(option => option.value === formData.recurrenceType)}
                  onChange={(selectedOption) => setFormData(prev => ({ ...prev, recurrenceType: selectedOption.value }))}
                  styles={customStyles}
                  placeholder="Seleccionar frecuencia..."
                  isSearchable={false}
                />
              </div>

              <div className="form-group">
                <label htmlFor="recurrenceInterval">
                  Cada {formData.recurrenceInterval} {getIntervalLabel()}
                </label>
                <input
                  type="number"
                  id="recurrenceInterval"
                  name="recurrenceInterval"
                  value={formData.recurrenceInterval}
                  onChange={handleChange}
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="recurrenceEndDate">Terminar el (opcional)</label>
              <input
                type="date"
                id="recurrenceEndDate"
                name="recurrenceEndDate"
                value={formData.recurrenceEndDate}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

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