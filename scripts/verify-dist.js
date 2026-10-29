import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
async function walk(dir) { return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(`${dir}/${e.name}`):`${dir}/${e.name}`))).flat(); }
const files = await walk('dist');
assert(files.every(p => !/\.(map|md|ts)$/.test(p) && !/(package|vite\.config|\.env)/.test(p)));
const html = await readFile('dist/index.html','utf8');
assert(!html.includes('/src/') && html.includes('/pruebaNuevo/assets/'));
const manifest = JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.scope,'/pruebaNuevo/');
for(const icon of manifest.icons) assert(files.includes(`dist/${icon.src}`));
const sw = await readFile('dist/sw.js','utf8');
assert(!sw.includes('__PRECACHE_URLS__') && sw.includes('skipWaiting'));
console.log('Production verified: scoped PWA, icons, compiled assets, no source maps or development files.');
