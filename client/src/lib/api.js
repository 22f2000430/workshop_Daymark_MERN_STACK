const apiOrigin = import.meta.env.VITE_API_ORIGIN || '';

async function request(path, options = {}) {
  const response = await fetch(`${apiOrigin}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(body.error?.message || 'Request failed'); error.fields = body.error?.fields; throw error; }
  return body.data;
}
export const api = {
  me: () => request('/api/auth/me'),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  subjects: () => request('/api/subjects'),
  createSubject: (data) => request('/api/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id, data) => request(`/api/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  tasks: (query = '') => request(`/api/tasks${query}`),
  createTask: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
  focus: (data) => request('/api/focus-sessions', { method: 'POST', body: JSON.stringify(data) }),
  weekly: (weekStart) => request(`/api/analytics/weekly?weekStart=${weekStart}`)
};
