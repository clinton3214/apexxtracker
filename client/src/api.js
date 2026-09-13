const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchGoals = async () => {
  const res = await fetch(`${API_URL}/goals`);
  if (!res.ok) throw new Error('Failed to fetch goals');
  return res.json();
};

export const createGoal = async (goalData) => {
  const res = await fetch(`${API_URL}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goalData)
  });
  if (!res.ok) throw new Error('Failed to create goal');
  return res.json();
};

export const deleteGoal = async (id) => {
  const res = await fetch(`${API_URL}/goals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete goal');
  return res.json();
};

export const updateGoal = async (id, updates) => {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update goal');
  return res.json();
};

export const fetchTasks = async () => {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

export const createTask = async (taskData) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
};

export const updateTask = async (id, updates) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

export const deleteTask = async (id) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
};

export const fetchLogs = async () => {
  const res = await fetch(`${API_URL}/logs`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
};

export const createLogs = async (entries, note, date) => {
  const res = await fetch(`${API_URL}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries, note, date })
  });
  if (!res.ok) throw new Error('Failed to create logs');
  return res.json();
};
