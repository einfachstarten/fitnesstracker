import { load, save } from '../utils/StorageUtils.js';

export class WeeklyDataManager {
  constructor() {
    try {
      console.log('WeeklyDataManager constructor started');
      this.data = this.loadFromStorage();
      console.log('WeeklyDataManager constructor completed');
    } catch (error) {
      console.error('WeeklyDataManager constructor failed:', error);
      throw error;
    }
  }

  getCurrentWeek() {
    return this.getISOWeek(new Date());
  }

  getWeekData(weekString) {
    if (!this.data.weeks[weekString]) {
      this.createWeek(weekString);
    }
    return this.data.weeks[weekString];
  }

  createWeek(weekString) {
    const bounds = this.getWeekBounds(weekString);
    this.data.weeks[weekString] = {
      startDate: bounds.start.toISOString().split('T')[0],
      endDate: bounds.end.toISOString().split('T')[0],
      target: this.data.weeklyGoal,
      completed: 0,
      workouts: [],
      isWeekCompleted: false
    };
    this.saveToStorage();
  }

  addWorkout(date, planDay, exercises) {
    const weekString = this.getISOWeek(new Date(date));
    const weekData = this.getWeekData(weekString);

    const workout = {
      id: `workout_${Date.now()}`,
      date: date,
      planDay: planDay,
      exercises: exercises,
      completedExercises: [],
      isCompleted: false,
      timestamp: new Date().toISOString()
    };

    weekData.workouts.push(workout);
    this.saveToStorage();
    return workout;
  }

  completeWorkout(workoutId) {
    for (const weekData of Object.values(this.data.weeks)) {
      const workout = weekData.workouts.find(w => w.id === workoutId);
      if (workout && !workout.isCompleted) {
        workout.isCompleted = true;
        weekData.completed++;

        if (weekData.completed >= weekData.target) {
          weekData.isWeekCompleted = true;
        }

        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  getWorkoutForDate(date) {
    const weekString = this.getISOWeek(new Date(date));
    const weekData = this.data.weeks[weekString];
    return weekData?.workouts.find(w => w.date === date);
  }

  // ISO Week utilities
  getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  getWeekBounds(weekString) {
    const [year, week] = weekString.split('-W').map(Number);
    const jan4 = new Date(year, 0, 4);
    const weekStart = new Date(jan4.getTime() + (week - 1) * 7 * 86400000);
    weekStart.setDate(weekStart.getDate() - (jan4.getDay() + 6) % 7);
    return {
      start: weekStart,
      end: new Date(weekStart.getTime() + 6 * 86400000)
    };
  }

  getPreviousWeek(weekString = this.data.currentWeek) {
    const [year, week] = weekString.split('-W').map(Number);
    const prev = week - 1;
    if (prev <= 0) {
      return `${year - 1}-W52`;
    }
    return `${year}-W${String(prev).padStart(2, '0')}`;
  }

  getNextWeek(weekString = this.data.currentWeek) {
    const [year, week] = weekString.split('-W').map(Number);
    const next = week + 1;
    if (next > 52) {
      return `${year + 1}-W01`;
    }
    return `${year}-W${String(next).padStart(2, '0')}`;
  }

  migrateToWeeklySystem(userData) {
    if (load('weeklyTrainingData')) return;
    const currentWeek = this.getISOWeek(new Date());
    const bounds = this.getWeekBounds(currentWeek);
    this.data = {
      weeklyGoal: parseInt(userData.frequency),
      currentWeek,
      weeks: {
        [currentWeek]: {
          startDate: bounds.start.toISOString().split('T')[0],
          endDate: bounds.end.toISOString().split('T')[0],
          target: parseInt(userData.frequency),
          completed: 0,
          workouts: [],
          isWeekCompleted: false
        }
      }
    };
    this.saveToStorage();
  }

  updateWeekCompletion(weekString) {
    const weekData = this.getWeekData(weekString);
    weekData.isWeekCompleted = weekData.completed >= weekData.target;
    this.saveToStorage();
  }

  getTodayWorkout() {
    const today = new Date().toISOString().split('T')[0];
    return this.getWorkoutForDate(today);
  }

  getLastWorkout() {
    const weeks = Object.keys(this.data.weeks).sort().reverse();
    for (const week of weeks) {
      const workouts = this.data.weeks[week].workouts.slice().reverse();
      const last = workouts.find(w => w.isCompleted);
      if (last) return last;
    }
    return null;
  }

  loadFromStorage() {
    try {
      return load('weeklyTrainingData', {
        weeklyGoal: 3,
        currentWeek: this.getCurrentWeek(),
        weeks: {}
      });
    } catch (err) {
      console.warn('Failed to load weeklyTrainingData', err);
      return {
        weeklyGoal: 3,
        currentWeek: this.getCurrentWeek(),
        weeks: {}
      };
    }
  }

  saveToStorage() {
    try {
      save('weeklyTrainingData', this.data);
    } catch (err) {
      console.warn('Failed to save weeklyTrainingData', err);
    }
  }
}
