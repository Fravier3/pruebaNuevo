import './styles/main.css';
import { layout } from './components/layout.js';
import { readState, saveState } from './storage.js';
import { setupPwa } from './pwa.js';

const $ = (id) => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { /* Private or blocked storage. */ }
let state = readState(storage);
document.documentElement.dataset.theme = state.theme;
document.getElementById('app').innerHTML = layout(__APP_VERSION__);
let toastTimer;
function notify(message) {
  $('feedback').textContent = message;
  $('feedback').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('feedback').hidden = true; }, 3500);
}
function persist() {
  const saved = saveState(storage, state);
  if (!saved) notify('No se pudo guardar en este dispositivo. Revisa el espacio o los permisos del navegador.');
  return saved;
}
function render() {
  $('count').textContent = state.count.toLocaleString('es-PR');
  $('note-length').textContent = `${state.note.length} / 5000`;
  $('theme').value = state.theme;
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('meta[name="theme-color"]').content = state.theme === 'dark' ? '#0a1020' : '#f1f5fc';
}
$('note').value = state.note;
render();
$('increment').addEventListener('click', () => {
  if (state.count === Number.MAX_SAFE_INTEGER) return notify('Llegaste al límite del contador. Puedes reiniciarlo.');
  state.count++; persist(); render();
});
$('reset').addEventListener('click', () => { state.count = 0; persist(); render(); notify('Contador reiniciado'); });
$('note').addEventListener('input', () => {
  state.note = $('note').value;
  $('note-status').textContent = persist() ? 'GUARDADA EN ESTE DISPOSITIVO' : 'NO SE PUDO GUARDAR';
  render();
});
$('note-form').addEventListener('submit', (event) => { event.preventDefault(); if (persist()) notify('Tu nota está guardada'); });
$('theme').addEventListener('change', () => { state.theme = $('theme').value; persist(); render(); });
$('settings-toggle').addEventListener('click', () => {
  $('settings').hidden = !$('settings').hidden;
  $('settings-toggle').setAttribute('aria-expanded', String(!$('settings').hidden));
  if (!$('settings').hidden) $('settings').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
function connection() {
  $('connection').textContent = navigator.onLine ? 'En línea' : 'Sin conexión';
  $('connection').classList.toggle('offline', !navigator.onLine);
}
window.addEventListener('online', connection);
window.addEventListener('offline', connection);
window.addEventListener('storage', (event) => {
  if (event.key !== 'fran-test:state:v1') return;
  state = readState(storage); $('note').value = state.note; render();
});
connection();
setupPwa($, notify);
