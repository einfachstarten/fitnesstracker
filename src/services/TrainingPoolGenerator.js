export function getTrainingTitle(type) {
  const titles = {
    push: 'Push Training',
    pull: 'Pull Training',
    legs: 'Legs Training',
    cardio: 'Cardio Session',
    upper: 'Upper Body',
    lower: 'Lower Body'
  };
  return titles[type] || 'Workout';
}

export function getTrainingIcon(type) {
  const icons = {
    push: '💪',
    pull: '🏃‍♂️',
    legs: '🦵',
    cardio: '🏃‍♂️',
    upper: '💪',
    lower: '🦵'
  };
  return icons[type] || '🏋️';
}

export function selectExercisesForType(type, userData, generator) {
  const focusMap = {
    push: ['Brust', 'Schultern', 'Trizeps'],
    pull: ['Rücken', 'Bizeps'],
    legs: ['Beine', 'Gesäß', 'Waden'],
    cardio: ['Ausdauer'],
    upper: ['Oberkörper'],
    lower: ['Unterkörper']
  };
  const focus = focusMap[type] || ['Ganzkörper'];
  const available = generator.getAvailableExercises(
    userData.equipment,
    focus,
    userData.experience
  );
  const count = generator.getExerciseCountForDuration(userData.duration);
  const filtered = available.filter(ex =>
    focus.some(f => generator.exerciseTargetsFocus(ex, f))
  );
  return generator.shuffleArray([...filtered]).slice(0, count);
}

export function generateTrainingPool(userData, generator) {
  const frequency = parseInt(userData.frequency);
  const patterns = {
    2: ['upper', 'lower'],
    3: ['push', 'pull', 'legs'],
    4: ['push', 'pull', 'legs', 'cardio'],
    5: ['push', 'pull', 'legs', 'push', 'pull'],
    6: ['push', 'pull', 'legs', 'push', 'pull', 'legs']
  };
  const pattern = patterns[frequency] || patterns[3];
  return pattern.map((type, index) => ({
    id: `${type}_${index}`,
    type,
    title: getTrainingTitle(type),
    icon: getTrainingIcon(type),
    exercises: selectExercisesForType(type, userData, generator),
    duration: userData.duration,
    difficulty: userData.experience,
    completed: false,
    completed_date: null
  }));
}
