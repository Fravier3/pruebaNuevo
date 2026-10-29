import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? files(`${dir}/${e.name}`) : `${dir}/${e.name}`))).flat();
}
const paths = (await files('dist')).filter(p => !p.endsWith('/sw.js')).sort();
const hash = createHash('sha256');
for (const path of paths) hash.update(await readFile(path));
const version = hash.digest('hex').slice(0, 16);
const urls = paths.map(p => '/pruebaNuevo/' + p.slice(5));
const template = await readFile('src/sw-template.js', 'utf8');
const { transform } = await import('esbuild');
const result = await transform(template.replace('__CACHE_VERSION__', version).replace('__PRECACHE_URLS__', JSON.stringify(urls)), { minify: true, legalComments: 'none', target: 'es2020' });
await writeFile('dist/sw.js', result.code);
