import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',use:{baseURL:'http://127.0.0.1:4173/pruebaNuevo/'},webServer:{command:'npm run preview -- --port 4173',url:'http://127.0.0.1:4173/pruebaNuevo/',reuseExistingServer:!process.env.CI}});
