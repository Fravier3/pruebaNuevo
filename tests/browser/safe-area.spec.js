import { test, expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';

for (const device of [
  { name: 'portrait', width: 390, height: 844, top: 59, bottom: 34, left: 0, right: 0 },
  { name: 'landscape', width: 844, height: 390, top: 0, bottom: 21, left: 59, right: 59 },
]) {
  test(`header actions remain outside simulated system areas in ${device.name}`, async ({ page }) => {
    await page.setViewportSize({ width: device.width, height: device.height });
    await page.goto('./');
    const cssName = (await readdir('dist/assets')).find(name => name.endsWith('.css'));
    const css = await readFile(`dist/assets/${cssName}`, 'utf8');
    // Desktop emulation does not expose iOS status-bar insets.
    // Substitute positive insets in the real built stylesheet to exercise layout.
    await page.addStyleTag({ content: css.replace(
      /env\(safe-area-inset-(top|bottom|left|right)(?:,\s*0px)?\)/g,
      (_, edge) => `${device[edge]}px`,
    ) });
    const settings = page.getByRole('button', { name: 'Abrir ajustes' });
    const brand = page.getByRole('link', { name: 'Fran Test, inicio' });
    for (const control of [settings, brand]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box.y).toBeGreaterThanOrEqual(device.top);
      expect(box.x).toBeGreaterThanOrEqual(device.left);
      expect(box.x + box.width).toBeLessThanOrEqual(device.width - device.right);
    }
    await settings.click();
    await expect(page.getByRole('heading', { name: 'Ajustes', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
