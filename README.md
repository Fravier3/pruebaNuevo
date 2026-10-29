# Fran Test

PWA modular de referencia. App: https://fravier3.github.io/pruebaNuevo/

## Desarrollo

Node 22. `npm ci`, `npm run dev`. `npm run verify` ejecuta pruebas de almacenamiento, compila y comprueba el artefacto. `npx playwright install chromium` y `npm run test:e2e` prueban los flujos en un navegador. `npm run preview` sirve la compilación.

## Estructura

- `index.html`: punto de entrada semántico y metadatos.
- `src/main.js`, `components/`, `storage.js`, `pwa.js`, `styles/`: interfaz, estado, persistencia y ciclo de actualizaciones.
- `public/`: manifest e iconos; no colocar aquí secretos ni documentos internos.
- `scripts/`: generación del service worker versionado y validación de producción.
- `tests/`: almacenamiento y pruebas de navegador.
- `.github/workflows/deploy.yml`: npm ci, verificaciones, pruebas de navegador, subida exclusiva de dist y publicación en Pages.

## Publicación y privacidad

Vite usa `/pruebaNuevo/`, JS/CSS minificados, assets con hash y source maps desactivados. `dist` no se versiona. Solo `dist` se sube al artefacto Pages. Como el repositorio es público, todo el código fuente y la documentación del repositorio siguen siendo públicos. El JavaScript y CSS del navegador son inspeccionables: minificar no es una medida de seguridad ni vuelve privado el código.

No hay servicios externos, secretos ni backend. La nota y el contador se guardan únicamente en localStorage del origen/dispositivo. Si el almacenamiento está bloqueado, la interfaz avisa. No se sincronizan entre dispositivos.

## PWA y actualizaciones

El build genera un service worker minificado con hash de todo el artefacto y precarga completa. Una nueva versión solo se activa si se han descargado los recursos. Navegación: red primero con fallback offline. Recursos: caché de la versión. Al activar borra únicamente cachés antiguas de Fran Test. Se comprueba al abrir, volver al primer plano o con el botón de ajustes; se recarga una sola vez al cambiar de controlador. Las notas se persisten en cada entrada antes de una posible recarga. No borra localStorage.

Safari iOS: Compartir → Añadir a pantalla de inicio. Chrome Android: Instalar app o Añadir a pantalla de inicio. HTTPS requerido; GitHub Pages lo proporciona. El indicador de conexión usa navigator.onLine y no garantiza acceso a un servidor específico.

Las pruebas automatizadas no sustituyen pruebas reales de instalación y actualización en teléfonos. Cambiar `version` en package.json para la versión visible; el hash del SW cambia con cualquier recurso compilado aunque no se cambie ese número.
