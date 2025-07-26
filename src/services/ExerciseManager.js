export class ExerciseManager {
    constructor() {
        this.exerciseDB = null;
    }

    async loadExercises() {
        if (this.exerciseDB) return; // avoid reloading
        const response = await fetch('./exercises.json');
        this.exerciseDB = await response.json();
    }

    getExercisesByEquipment(userEquipment) {
        if (!this.exerciseDB) return [];
        const all = this.exerciseDB.exercises || [];
        return all.filter(exercise => {
            const hasEquipment = (exercise.equipment || []).some(eq => userEquipment.includes(eq));
            const hasAlt = (exercise.equipment_alternatives || []).some(eq => userEquipment.includes(eq));
            return hasEquipment || hasAlt;
        });
    }

    getExercisesByCategory(category, userEquipment) {
        const available = this.getExercisesByEquipment(userEquipment);
        return available.filter(ex => ex.category === category);
    }
}
