export const KEY = 'fran-test:state:v1';
export function normalize(value = {}) {
  return {
    count: Number.isSafeInteger(value?.count) && value.count >= 0 ? value.count : 0,
    note: typeof value?.note === 'string' ? value.note.slice(0, 5000) : '',
    theme: value?.theme === 'light' ? 'light' : 'dark',
  };
}
export function readState(storage) {
  try { return normalize(JSON.parse(storage.getItem(KEY))); }
  catch { return normalize(); }
}
export function saveState(storage, state) {
  try { storage.setItem(KEY, JSON.stringify(normalize(state))); return true; }
  catch { return false; }
}
