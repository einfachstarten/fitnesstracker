export class WorkoutPlanGenerator {
  constructor(exerciseDatabase) {
    this.exerciseDatabase = exerciseDatabase;
  }

  generatePlan(userData) {
    const { frequency, equipment, focus, duration, experience, goals } = userData;

    const availableExercises = this.getAvailableExercises(equipment, focus, experience);
    const split = this.determineSplit(parseInt(frequency), focus);

    return this.createWeeklyPlan(split, availableExercises, duration, experience, goals);
  }

  getAvailableExercises(equipment, focus, experience) {
    let exercises = [];

    equipment.forEach(eq => {
      const category = this.mapEquipmentToCategory(eq);
      if (this.exerciseDatabase[category]) {
        exercises = exercises.concat(
          this.exerciseDatabase[category]
            .filter(ex => this.matchesFocus(ex, focus))
            .filter(ex => this.matchesExperience(ex.schwierigkeit, experience))
            .map(ex => ({ ...ex, category }))
        );
      }
    });

    return exercises;
  }

  determineSplit(trainingDays, focus) {
    if (focus.includes('Ganzk\u00f6rper')) {
      return Array(trainingDays).fill(['Ganzk\u00f6rper']);
    }

    const splitPatterns = {
      2: [['Oberk\u00f6rper'], ['Unterk\u00f6rper']],
      3: [['Brust', 'Trizeps'], ['R\u00fccken', 'Bizeps'], ['Unterk\u00f6rper']],
      4: [['Brust', 'Trizeps'], ['R\u00fccken', 'Bizeps'], ['Unterk\u00f6rper'], ['Schultern']],
      5: [['Brust', 'Trizeps'], ['R\u00fccken', 'Bizeps'], ['Unterk\u00f6rper'], ['Schultern'], ['Arme']]
    };

    return splitPatterns[trainingDays] || splitPatterns[3];
  }

  createWeeklyPlan(split, exercises, duration, experience, goals) {
    const plan = {};

    split.forEach((dayFocus, index) => {
      const dayName = `Tag ${index + 1}`;
      const dayExercises = this.selectExercisesForDay(exercises, dayFocus, duration);

      plan[dayName] = {
        title: this.getDayTitle(dayFocus),
        exercises: dayExercises.map(ex => `${ex.name}: ${this.getRepScheme(experience, goals)}`),
        exercise_details: dayExercises,
        duration: duration,
        focus: dayFocus.join(', '),
        difficulty: experience
      };
    });

    return plan;
  }

  selectExercisesForDay(exercises, dayFocus, duration) {
    const filtered = exercises.filter(ex =>
      dayFocus.some(focus => this.exerciseTargetsFocus(ex, focus))
    );

    const exerciseCount = this.getExerciseCountForDuration(duration);
    return this.shuffleArray([...filtered]).slice(0, exerciseCount);
  }

  // Helper methods
  mapEquipmentToCategory(equipment) {
    const mapping = {
      'Eigengewicht': 'Eigengewicht',
      'Kurzhanteln': 'Kurzhanteln',
      'Langhanteln': 'Langhanteln',
      'Gym-Ger\u00e4te': 'Gym-Ger\u00e4te'
    };
    return mapping[equipment];
  }

  matchesFocus(exercise, focusAreas) {
    return focusAreas.some(focus =>
      this.exerciseTargetsFocus(exercise, focus)
    );
  }

  exerciseTargetsFocus(exercise, focus) {
    const focusMapping = {
      'Oberk\u00f6rper': ['Brust', 'R\u00fccken', 'Schultern', 'Trizeps', 'Bizeps'],
      'Unterk\u00f6rper': ['Beine', 'Ges\u00e4\u00df', 'Waden'],
      'Core': ['Bauch', 'Rumpf'],
      'Ganzk\u00f6rper': ['Brust', 'R\u00fccken', 'Schultern', 'Beine', 'Ges\u00e4\u00df', 'Bauch']
    };

    const targetMuscles = focusMapping[focus] || [focus];
    return exercise.muskelgruppen.some(muscle =>
      targetMuscles.some(target => muscle.includes(target))
    );
  }

  matchesExperience(exerciseDifficulty, userExperience) {
    const levels = { 'Anf\u00e4nger': 1, 'Fortgeschritten': 2, 'Profi': 3 };
    return levels[exerciseDifficulty] <= levels[userExperience];
  }

  getExerciseCountForDuration(duration) {
    const counts = { '30min': 4, '45min': 6, '60min': 8, '90min': 10 };
    return counts[duration] || 6;
  }

  getDayTitle(dayFocus) {
    const titles = {
      'Ganzk\u00f6rper': '\ud83d\udcaa Ganzk\u00f6rper Training',
      'Oberk\u00f6rper': '\ud83c\udfcb\ufe0f Oberk\u00f6rper Training',
      'Unterk\u00f6rper': '\ud83e\uddb5 Bein Training',
      'Brust': '\ud83d\udcaa Brust & Trizeps',
      'R\u00fccken': '\ud83d\udd19 R\u00fccken & Bizeps',
      'Schultern': '\ud83e\udd38 Schulter Training'
    };

    for (const [key, title] of Object.entries(titles)) {
      if (dayFocus.includes(key)) return title;
    }
    return '\ud83c\udfcb\ufe0f Training';
  }

  getRepScheme(experience, goals) {
    if (goals.includes('Muskelaufbau')) {
      const schemes = { 'Anf\u00e4nger': '2x8-10', 'Fortgeschritten': '3x8-12', 'Profi': '4x6-10' };
      return schemes[experience];
    }
    if (goals.includes('Kraft')) {
      const schemes = { 'Anf\u00e4nger': '3x5-6', 'Fortgeschritten': '3x3-5', 'Profi': '5x3-5' };
      return schemes[experience];
    }
    if (goals.includes('Ausdauer')) return '3x15-20';
    return '3x8-12';
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
