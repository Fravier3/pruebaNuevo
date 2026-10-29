import { test, expect } from '@playwright/test';
test('counter, note, theme persist, offline shell and mobile layout work', async ({ page, context }) => {
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./');
  await page.getByRole('button',{name:'Aumentar contador'}).click();
  await page.getByRole('button',{name:'Aumentar contador'}).click();
  await expect(page.locator('#count')).toHaveText('2');
  await page.getByLabel('Tu nota',{exact:true}).fill('Mi próxima idea <script>');
  await page.getByRole('button',{name:'Guardar nota'}).click();
  await page.getByRole('button',{name:'Abrir ajustes'}).click();
  await page.getByLabel('Apariencia').selectOption('light');
  await page.reload();
  await expect(page.locator('#count')).toHaveText('2');
  await expect(page.getByLabel('Tu nota',{exact:true})).toHaveValue('Mi próxima idea <script>');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.getByRole('button',{name:'Reiniciar'}).click();
  await expect(page.locator('#count')).toHaveText('0');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready; if(!navigator.serviceWorker.controller) await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true}));});
  await context.setOffline(true);
  await expect(page.locator('#connection')).toHaveText('Sin conexión');
  await page.reload();
  await expect(page.getByLabel('Tu nota',{exact:true})).toHaveValue('Mi próxima idea <script>');
  await context.setOffline(false);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('a new service worker activates once, removes old caches and preserves data', async ({ page }) => {
  const { readFile, writeFile } = await import('node:fs/promises');
  const original = await readFile('dist/sw.js','utf8');
  try {
    await page.goto('./');
    await page.evaluate(async()=>{ await navigator.serviceWorker.ready; if(!navigator.serviceWorker.controller) await new Promise(r=>navigator.serviceWorker.addEventListener('controllerchange',r,{once:true})); });
    await page.getByRole('button',{name:'Aumentar contador'}).click();
    await page.getByLabel('Tu nota',{exact:true}).fill('Sobrevive la actualización');
    const oldCaches = await page.evaluate(()=>caches.keys());
    const oldWorker = await page.evaluate(()=>navigator.serviceWorker.controller.scriptURL);
    await writeFile('dist/sw.js', original.replace(/CACHE=PREFIX\+"[^"]+"/, 'CACHE=PREFIX+"rollout"'));
    await Promise.all([
      page.waitForEvent('load'),
      page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration(); await r.update();})
    ]);
    await expect(page.locator('#count')).toHaveText('1');
    await expect(page.getByLabel('Tu nota',{exact:true})).toHaveValue('Sobrevive la actualización');
    const keys=await page.evaluate(()=>caches.keys());
    expect(keys.some(k=>k === 'fran-test-rollout')).toBe(true);
    expect(keys.some(k=>oldCaches.includes(k))).toBe(false);
    expect(oldWorker).toContain('/pruebaNuevo/sw.js');
  } finally { await writeFile('dist/sw.js',original); }
});
