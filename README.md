# Todo Kanban App

Aplicación personal de tareas con vista lista y tablero Kanban personalizable.

## Stack Tecnológico
- **Frontend**: React + Vite
- **Backend**: Node.js + Express (dentro de Electron)
- **Base de Datos**: SQLite (better-sqlite3)
- **Desktop**: Electron
- **UI**: Material-UI

## Funcionalidades Implementadas
- [x] Proyecto React base creado
- [x] Configuración SQLite + API REST
- [x] Estructura de base de datos con recurrencia
- [x] CRUD básico de tareas
- [x] Componentes TaskCard y TaskForm
- [x] Sistema de fechas robusto
- [x] Vista lista de tareas con filtros y estadísticas
- [x] Vista tablero Kanban con drag & drop
- [x] Iconos Lucide React profesionales
- [x] Modo oscuro/claro completamente funcional
- [x] Exportar JSON con fecha automática
- [x] Navegación fluida entre vistas
- [x] Columnas personalizables
- [x] Sistema de tareas recurrentes
- [x] React-select componentes mejorados
- [x] Vista calendario inteligente
- [x] Drag & drop optimizado con feedback visual
- [x] Headers de columnas con forma de flecha
- [x] Botones flotantes en hover de columnas
- [x] Render en tiempo real de tareas nuevas
- [ ] Campos personalizados (URLs, notas)
- [ ] Soporte para imágenes
- [ ] Empaquetado Electron

## Sistema de Fechas y Recurrencia
- **created_at**: Fecha de creación
- **due_date**: Fecha límite
- **completed_at**: Fecha de finalización
- **duration_hours/minutes**: Duración estimada
- **start_time/end_time**: Horario específico
- **Recurrencia**: Diaria, semanal, mensual, anual
- **Ejemplos**: "Reuniones viernes 19, 26 sep + 3, 10 oct"

## Base de Datos
```sql
-- Tablas creadas
tasks (con fechas y duración)
task_recurrence (patrones de repetición)
columns, attachments, custom_fields
```

## Estructura del Proyecto
```
src/
├── components/     # Componentes React
├── services/       # API calls y lógica BD
├── hooks/          # Custom hooks
└── utils/          # Utilidades
```

## Comandos
```bash
npm run start       # Ejecutar backend + frontend
npm run dev         # Solo frontend (desarrollo)
npm run server      # Solo backend API
npm run build       # Build para producción
npm run electron    # Ejecutar como app desktop (pendiente)
```

## Acceso a la Aplicación
- **Frontend**: http://localhost:5175
- **Backend API**: http://localhost:3001
- **Base de datos**: ./data/tasks.db

## Funcionalidades Actuales
- ✨ **Crear tareas** con título, descripción, fechas
- 🎯 **Vista Kanban** con drag & drop entre columnas
- 📋 **Vista Lista** con filtros y ordenamiento
- 📅 **Vista Calendario** inteligente con recurrencias
- 🌙 **Modo oscuro/claro** con persistencia
- 📊 **Estadísticas** de tareas por estado
- 📤 **Exportar** todas las tareas a JSON
- 🔄 **Tareas recurrentes** (diario, semanal, mensual, anual)
- 🎨 **Columnas personalizables** con drag & drop
- ⚡ **Render en tiempo real** sin refrescar página
- 🎛️ **React-select** componentes profesionales

## Próximos Pasos
1. Instalar SQLite y dependencias
2. Crear estructura de BD
3. Implementar CRUD básico
