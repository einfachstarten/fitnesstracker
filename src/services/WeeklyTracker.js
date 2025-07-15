export class WeeklyTracker {
  constructor(weeklyDataManager) {
    this.weeklyDataManager = weeklyDataManager;
  }

  migrateToWeeklySystem(userData) {
    this.weeklyDataManager.migrateToWeeklySystem(userData);
  }

  updateWeekCompletion(weekString) {
    const week = weekString || this.weeklyDataManager.data.currentWeek;
    this.weeklyDataManager.updateWeekCompletion(week);
  }

  getTodayWorkout() {
    return this.weeklyDataManager.getTodayWorkout();
  }

  getLastWorkout() {
    return this.weeklyDataManager.getLastWorkout();
  }
}
