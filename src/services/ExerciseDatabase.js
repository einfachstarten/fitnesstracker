export class ExerciseDatabase {
  constructor(data) {
    this.data = data || {};
  }

  getAll() {
    return this.data;
  }
}
