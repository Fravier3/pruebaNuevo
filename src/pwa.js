export function setupPwa($, notify) {
  let registration;
  let reloading = false;
  const hadController = Boolean(navigator.serviceWorker?.controller);
  const status = (text) => { $('update-status').textContent = text; };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloading) { reloading = true; location.reload(); }
    });
    const watch = (reg) => {
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) status('Nueva versión lista. Actualizando…');
        });
      });
    };
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL, updateViaCache: 'none' })
      .then((reg) => { registration = reg; watch(reg); return reg.update(); })
      .catch(() => status('No se pudo comprobar la versión. Se intentará al volver a abrir.'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration?.update().catch(() => {});
    });
  } else status('Este navegador no permite el modo sin conexión.');
  $('check-update').addEventListener('click', async () => {
    if (!navigator.onLine) return status('Conéctate a internet para buscar actualizaciones.');
    if (!registration) return status('Las actualizaciones aún no están disponibles. Vuelve a abrir la app.');
    status('Buscando actualizaciones…');
    try { await registration.update(); if (!registration.installing) status('Tienes la versión más reciente disponible.'); }
    catch { status('No se pudo comprobar. Inténtalo de nuevo.'); }
  });
  let prompt;
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); prompt = event; $('install').hidden = false; });
  $('install').addEventListener('click', async () => {
    if (!prompt) return;
    await prompt.prompt(); await prompt.userChoice; prompt = null; $('install').hidden = true;
  });
  window.addEventListener('appinstalled', () => { $('install').hidden = true; notify('Fran Test ya está instalada'); });
}
