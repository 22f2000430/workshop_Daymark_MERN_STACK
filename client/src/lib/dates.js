export const today = () => new Date().toLocaleDateString('en-CA');
export function addDays(value, amount) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + amount); return date.toLocaleDateString('en-CA'); }
export function weekStart(value = today()) { const date = new Date(`${value}T12:00:00`); const day = date.getDay(); return addDays(value, day === 0 ? -6 : 1 - day); }
export function formatDate(value, options = { month: 'short', day: 'numeric' }) { return new Intl.DateTimeFormat(undefined, options).format(new Date(`${value}T12:00:00`)); }
