import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, X, Palette } from 'lucide-react';
import './ColumnEditor.css';

const ColumnEditor = ({ columns, onCreateColumn, onUpdateColumn, onDeleteColumn, onReorderColumns, onClose }) => {
  const [editingColumn, setEditingColumn] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1'
  });

  const colors = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#84cc16', '#f97316'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const columnData = {
      name: formData.name.trim(),
      color: formData.color,
      order_index: columns.length
    };

    if (editingColumn) {
      await onUpdateColumn(editingColumn.id, columnData);
    } else {
      await onCreateColumn(columnData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#6366f1' });
    setEditingColumn(null);
    setShowForm(false);
  };

  const handleEdit = (column) => {
    setFormData({
      name: column.name,
      color: column.color
    });
    setEditingColumn(column);
    setShowForm(true);
  };

  const handleDelete = async (column) => {
    if (confirm(`¿Eliminar la columna "${column.name}"?`)) {
      try {
        await onDeleteColumn(column.id);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleDragStart = (e, column) => {
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn.id === targetColumn.id) return;

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn.id);
    const targetIndex = columns.findIndex(col => col.id === targetColumn.id);

    const newColumns = [...columns];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);

    const columnOrders = newColumns.map((col, index) => ({
      id: col.id,
      order_index: index
    }));

    onReorderColumns(columnOrders);
    setDraggedColumn(null);
  };

  return (
    <div className="column-editor-overlay">
      <div className="column-editor">
        <div className="editor-header">
          <h3>Gestionar Columnas</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="columns-list">
          {columns.map(column => (
            <div
              key={column.id}
              className={`column-item ${draggedColumn?.id === column.id ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, column)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column)}
            >
              <div className="column-drag-handle">
                <GripVertical size={16} />
              </div>

              <div
                className="column-color-indicator"
                style={{ backgroundColor: column.color }}
              />

              <span className="column-name">{column.name}</span>

              <div className="column-actions">
                <button
                  onClick={() => handleEdit(column)}
                  className="edit-btn"
                  title="Editar columna"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(column)}
                  className="delete-btn"
                  title="Eliminar columna"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="add-column-btn"
          >
            <Plus size={16} />
            Nueva Columna
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="column-form">
            <div className="form-group">
              <label htmlFor="columnName">Nombre</label>
              <input
                type="text"
                id="columnName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre de la columna"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="custom-color"
                  title="Color personalizado"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancelar
              </button>
              <button type="submit" className="submit-btn">
                {editingColumn ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ColumnEditor;