import { useState } from 'react';
import { Kanban, List, Download, Sun, Moon, Settings } from 'lucide-react';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import ColumnEditor from './components/ColumnEditor';
import { useTasks } from './hooks/useTasks';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('kanban');
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const {
    tasks, columns, loading,
    createTask, updateTask, deleteTask,
    createColumn, updateColumn, deleteColumn, reorderColumns,
    exportData
  } = useTasks();
  const { theme, toggleTheme } = useTheme();

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tareas-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando tareas...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-left">
          <h1>Todo Kanban</h1>
          <div className="view-switcher">
            <button
              className={currentView === 'kanban' ? 'active' : ''}
              onClick={() => setCurrentView('kanban')}
            >
              <Kanban size={16} />
              Kanban
            </button>
            <button
              className={currentView === 'list' ? 'active' : ''}
              onClick={() => setCurrentView('list')}
            >
              <List size={16} />
              Lista
            </button>
          </div>
        </div>

        <div className="nav-right">
          <button
            onClick={() => setShowColumnEditor(true)}
            className="settings-btn"
            title="Gestionar columnas"
          >
            <Settings size={16} />
            Columnas
          </button>
          <button onClick={toggleTheme} className="theme-btn" title="Cambiar tema">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={handleExport} className="export-btn">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </nav>

      <main className="app-main">
        {currentView === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            columns={columns}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        ) : (
          <TaskList
            tasks={tasks}
            columns={columns}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        )}
      </main>

      {showColumnEditor && (
        <ColumnEditor
          columns={columns}
          onCreateColumn={createColumn}
          onUpdateColumn={updateColumn}
          onDeleteColumn={deleteColumn}
          onReorderColumns={reorderColumns}
          onClose={() => setShowColumnEditor(false)}
        />
      )}
    </div>
  );
}

export default App
