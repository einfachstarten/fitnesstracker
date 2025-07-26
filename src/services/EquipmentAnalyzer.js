import { ExerciseManager } from './ExerciseManager.js';

export class EquipmentAnalyzer {
    constructor(exerciseManager) {
        this.exerciseManager = exerciseManager;
    }

    analyzeEquipmentCoverage(userEquipment) {
        const allExercises = this.exerciseManager.exerciseDB.exercises;
        const available = this.exerciseManager.getExercisesByEquipment(userEquipment);
        return {
            total_exercises: allExercises.length,
            available_exercises: available.length,
            coverage_percentage: (available.length / allExercises.length) * 100,
            missing_equipment: this.findMissingEquipment(userEquipment),
            category_coverage: this.analyzeCategoryCoverage(userEquipment)
        };
    }

    findMissingEquipment(userEquipment) {
        const allEquipment = Object.keys(this.exerciseManager.exerciseDB.equipment_mapping || {});
        return allEquipment.filter(eq => !userEquipment.includes(eq));
    }

    analyzeCategoryCoverage(userEquipment) {
        const categories = ['push', 'pull', 'legs', 'core', 'cardio'];
        const result = {};
        categories.forEach(cat => {
            const catExercises = this.exerciseManager.getExercisesByCategory(cat, userEquipment);
            result[cat] = {
                available: catExercises.length,
                sufficient: catExercises.length >= 5
            };
        });
        return result;
    }

    suggestEquipmentAdditions(userEquipment, maxSuggestions = 3) {
        const missing = this.findMissingEquipment(userEquipment);
        const suggestions = [];
        missing.forEach(eq => {
            const mapping = this.exerciseManager.exerciseDB.equipment_mapping?.[eq];
            if (mapping) {
                const unlocked = mapping.exercises.length;
                if (unlocked >= 3) {
                    suggestions.push({
                        equipment: eq,
                        exercises_unlocked: unlocked,
                        categories: mapping.categories,
                        impact_score: unlocked * mapping.categories.length
                    });
                }
            }
        });
        return suggestions.sort((a, b) => b.impact_score - a.impact_score).slice(0, maxSuggestions);
    }
}
