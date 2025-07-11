export const isNumber = (value) => !isNaN(parseFloat(value));

export const isValidName = (name) => name && name.length >= 2;

export const isValidAge = (age) => age >= 12 && age <= 100;

export const hasValidGoals = (goals) => Array.isArray(goals) && goals.length > 0;
