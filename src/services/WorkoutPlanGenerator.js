import { ExerciseManager } from './ExerciseManager.js';

export class WorkoutPlanGenerator {
    constructor() {
        this.exerciseManager = new ExerciseManager();
    }

    // Compatibility wrapper for older code paths
    async generatePlan(userData) {
        return this.generateTrainingPool(userData);
    }

    async generateTrainingPool(userData) {
        await this.exerciseManager.loadExercises();
        const { equipment, frequency, experience } = userData;
        const trainingDays = parseInt(frequency);

        const splitPatterns = {
            2: ['push', 'pull'],
            3: ['push', 'pull', 'legs'],
            4: ['push', 'pull', 'legs', 'cardio'],
            5: ['push', 'pull', 'legs', 'push', 'pull'],
            6: ['push', 'pull', 'legs', 'push', 'pull', 'legs']
        };

        const pattern = splitPatterns[trainingDays] || splitPatterns[3];
        const pool = [];

        pattern.forEach((category, index) => {
            const catExercises = this.exerciseManager.getExercisesByCategory(category, equipment);
            const filtered = this.filterByExperience(catExercises, experience);
            const count = this.getExerciseCount(experience, category);
            const selected = this.shuffleArray(filtered).slice(0, count);
            pool.push({
                id: `${category}_${index}`,
                type: category,
                title: this.getCategoryTitle(category),
                icon: this.getCategoryIcon(category),
                exercises: selected,
                duration: userData.duration,
                difficulty: experience,
                completed: false,
                completed_date: null
            });
        });

        return pool;
    }

    filterByExperience(exercises, level) {
        const map = {
            'Anfänger': ['Anfänger'],
            'Fortgeschritten': ['Anfänger', 'Fortgeschritten'],
            'Profi': ['Anfänger', 'Fortgeschritten', 'Profi']
        };
        const allowed = map[level] || ['Anfänger'];
        return exercises.filter(ex => allowed.includes(ex.difficulty));
    }

    getExerciseCount(experience, category) {
        const base = {
            'Anfänger': { push: 5, pull: 5, legs: 6, core: 4, cardio: 3 },
            'Fortgeschritten': { push: 6, pull: 6, legs: 7, core: 5, cardio: 4 },
            'Profi': { push: 7, pull: 7, legs: 8, core: 6, cardio: 5 }
        };
        return base[experience]?.[category] || 6;
    }

    getCategoryTitle(category) {
        const titles = {
            push: 'Push Training',
            pull: 'Pull Training',
            legs: 'Legs Training',
            core: 'Core Training',
            cardio: 'Cardio Training'
        };
        return titles[category] || `${category} Training`;
    }

    getCategoryIcon(category) {
        const icons = {
            push: '💪',
            pull: '🏃‍♂️',
            legs: '🦵',
            core: '🔥',
            cardio: '❤️'
        };
        return icons[category] || '🏋️';
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
