import { v4 as uuidv4 } from 'uuid';

export class RecurrenceGenerator {
  static generateRecurringTasks(parentTask, recurrence) {
    const tasks = [];
    const startDate = new Date(parentTask.dueDate || parentTask.createdAt);
    let currentDate = new Date(startDate);
    let occurrenceCount = 0;

    while (this.shouldGenerateNext(currentDate, recurrence, occurrenceCount)) {
      const newTask = {
        ...parentTask,
        id: uuidv4(),
        parentTaskId: parentTask.id,
        dueDate: new Date(currentDate),
        isRecurring: false,
        createdAt: new Date()
      };

      tasks.push(newTask);
      currentDate = this.getNextDate(currentDate, recurrence);
      occurrenceCount++;
    }

    return tasks;
  }

  static shouldGenerateNext(currentDate, recurrence, occurrenceCount) {
    const now = new Date();

    if (currentDate <= now) return false;

    if (recurrence.endDate && currentDate > new Date(recurrence.endDate)) {
      return false;
    }

    if (recurrence.maxOccurrences && occurrenceCount >= recurrence.maxOccurrences) {
      return false;
    }

    return true;
  }

  static getNextDate(currentDate, recurrence) {
    const nextDate = new Date(currentDate);

    switch (recurrence.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + (recurrence.interval || 1));
        break;

      case 'weekly':
        if (recurrence.daysOfWeek) {
          const daysOfWeek = JSON.parse(recurrence.daysOfWeek);
          nextDate = this.getNextWeeklyDate(nextDate, daysOfWeek, recurrence.interval);
        } else {
          nextDate.setDate(nextDate.getDate() + (7 * (recurrence.interval || 1)));
        }
        break;

      case 'monthly':
        if (recurrence.daysOfMonth) {
          const daysOfMonth = JSON.parse(recurrence.daysOfMonth);
          nextDate = this.getNextMonthlyDate(nextDate, daysOfMonth, recurrence.interval);
        } else {
          nextDate.setMonth(nextDate.getMonth() + (recurrence.interval || 1));
        }
        break;

      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + (recurrence.interval || 1));
        break;

      case 'custom':
        break;
    }

    return nextDate;
  }

  static getNextWeeklyDate(currentDate, daysOfWeek, interval = 1) {
    const nextDate = new Date(currentDate);
    const currentDay = nextDate.getDay();

    let nextDay = daysOfWeek.find(day => day > currentDay);

    if (nextDay !== undefined) {
      nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
    } else {
      const firstDay = Math.min(...daysOfWeek);
      nextDate.setDate(nextDate.getDate() + (7 * interval) - currentDay + firstDay);
    }

    return nextDate;
  }

  static getNextMonthlyDate(currentDate, daysOfMonth, interval = 1) {
    const nextDate = new Date(currentDate);
    const currentDay = nextDate.getDate();

    let nextDay = daysOfMonth.find(day => day > currentDay);

    if (nextDay !== undefined) {
      nextDate.setDate(nextDay);
    } else {
      nextDate.setMonth(nextDate.getMonth() + interval);
      nextDate.setDate(Math.min(...daysOfMonth));
    }

    return nextDate;
  }

  static parseRecurrencePattern(pattern) {
    const patterns = {
      'viernes-mensual': {
        type: 'monthly',
        daysOfWeek: JSON.stringify([5]),
        interval: 1
      },
      'ultimo-viernes': {
        type: 'custom',
        pattern: 'last-friday-of-month'
      }
    };

    return patterns[pattern] || null;
  }

  static createRecurrenceFromText(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('cada día') || lowerText.includes('diario')) {
      return { type: 'daily', interval: 1 };
    }

    if (lowerText.includes('cada semana') || lowerText.includes('semanal')) {
      return { type: 'weekly', interval: 1 };
    }

    if (lowerText.includes('cada mes') || lowerText.includes('mensual')) {
      return { type: 'monthly', interval: 1 };
    }

    if (lowerText.includes('cada año') || lowerText.includes('anual')) {
      return { type: 'yearly', interval: 1 };
    }

    if (lowerText.includes('viernes')) {
      return {
        type: 'weekly',
        daysOfWeek: JSON.stringify([5]),
        interval: 1
      };
    }

    return null;
  }
}