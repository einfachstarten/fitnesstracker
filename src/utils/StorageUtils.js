export const load = (key, fallback = null) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

export const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
