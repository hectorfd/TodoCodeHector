import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import './CalendarView.css';

const CalendarView = ({ tasks, columns, onCreateTask, onUpdateTask, onDeleteTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const generateRecurringInstances = (task) => {
    if (!task.is_recurring || !task.recurrence_type || task.column_id === 'done') return [];

    const instances = [];
    const baseDate = new Date(task.created_at);
    const interval = task.interval_value || 1;
    const endDate = task.recurrence_end_date ? new Date(task.recurrence_end_date) :
                   new Date(currentYear + 1, currentMonth, 1);

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    let currentIterationDate = new Date(baseDate);

    for (let i = 0; i < 100; i++) {
      switch (task.recurrence_type) {
        case 'daily':
          currentIterationDate = new Date(baseDate.getTime() + (i * interval * 24 * 60 * 60 * 1000));
          break;
        case 'weekly':
          currentIterationDate = new Date(baseDate.getTime() + (i * interval * 7 * 24 * 60 * 60 * 1000));
          break;
        case 'monthly':
          currentIterationDate = new Date(baseDate);
          currentIterationDate.setMonth(baseDate.getMonth() + (i * interval));
          break;
        case 'yearly':
          currentIterationDate = new Date(baseDate);
          currentIterationDate.setFullYear(baseDate.getFullYear() + (i * interval));
          break;
      }

      if (currentIterationDate > endDate) break;
      if (currentIterationDate < monthStart) continue;
      if (currentIterationDate > monthEnd) break;

      instances.push({
        ...task,
        id: `${task.id}-recurrence-${i}`,
        due_date: currentIterationDate.toISOString().split('T')[0],
        isRecurringInstance: true,
        originalTaskId: task.id
      });
    }

    return instances;
  };

  const getTasksForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];

    const regularTasks = tasks.filter(task =>
      task.due_date === dateString && task.column_id !== 'done'
    );

    const recurringInstances = tasks
      .filter(task => task.is_recurring && task.column_id !== 'done')
      .flatMap(task => generateRecurringInstances(task))
      .filter(instance => instance.due_date === dateString);

    return [...regularTasks, ...recurringInstances];
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleCreateTask = async (taskData) => {
    const taskWithDate = {
      ...taskData,
      dueDate: selectedDate?.toISOString().split('T')[0] || null
    };
    await onCreateTask(taskWithDate);
    setShowForm(false);
    setSelectedDate(null);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDate = new Date(currentYear, currentMonth, 0 - (firstDayOfWeek - 1 - i));
      days.push(
        <div key={`prev-${i}`} className="calendar-day other-month">
          <span className="day-number">{prevMonthDate.getDate()}</span>
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const tasksForDate = getTasksForDate(date);

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          <span className="day-number">{day}</span>
          <div className="day-tasks">
            {tasksForDate.slice(0, 3).map((task, index) => (
              <div
                key={task.id}
                className={`mini-task ${task.isRecurringInstance ? 'recurring' : ''}`}
                style={{ borderLeftColor: task.priority === 'high' ? '#ef4444' :
                                       task.priority === 'medium' ? '#f59e0b' : '#10b981' }}
                title={task.title}
              >
                <span className="mini-task-title">{task.title}</span>
                {task.isRecurringInstance && <span className="recurring-indicator">↻</span>}
              </div>
            ))}
            {tasksForDate.length > 3 && (
              <div className="more-tasks">+{tasksForDate.length - 3} más</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={goToPreviousMonth} className="nav-button">
            <ChevronLeft size={20} />
          </button>
          <h2 className="month-year">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button onClick={goToNextMonth} className="nav-button">
            <ChevronRight size={20} />
          </button>
        </div>

        <button onClick={goToToday} className="today-button">
          <CalendarIcon size={16} />
          Hoy
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {renderCalendarDays()}
        </div>
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setSelectedDate(null);
          }}
          columns={columns}
        />
      )}
    </div>
  );
};

export default CalendarView;