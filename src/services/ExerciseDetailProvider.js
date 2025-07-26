export class ExerciseDetailProvider {
    constructor(exerciseManager, userExperience) {
        this.exerciseManager = exerciseManager;
        this.userExperience = userExperience;
    }

    getExerciseDetails(exerciseId) {
        const exercise = this.exerciseManager.exerciseDB.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return null;
        return {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            instructions: exercise.instructions || [],
            tips: exercise.tips || [],
            reps: this.getRepsForUserLevel(exercise, this.userExperience),
            muscleGroups: exercise.muscle_groups || [],
            equipment: exercise.equipment || [],
            alternatives: exercise.equipment_alternatives || [],
            variations: exercise.variations || [],
            commonMistakes: exercise.common_mistakes || [],
            difficulty: exercise.difficulty
        };
    }

    getRepsForUserLevel(exercise, userLevel) {
        const mapping = {
            'Anfänger': exercise.reps_beginner,
            'Fortgeschritten': exercise.reps_intermediate,
            'Profi': exercise.reps_advanced
        };
        return mapping[userLevel] || exercise.reps_beginner || '';
    }

    getAlternativeExercises(exerciseId, userEquipment) {
        const exercise = this.exerciseManager.exerciseDB.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return [];
        return this.exerciseManager.exerciseDB.exercises.filter(ex => {
            const shares = ex.muscle_groups?.some(m => (exercise.muscle_groups || []).includes(m));
            const hasEq = (ex.equipment || []).some(eq => userEquipment.includes(eq));
            return shares && hasEq && ex.id !== exerciseId;
        }).slice(0,3);
    }
}
