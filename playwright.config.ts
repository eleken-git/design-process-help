import { defineConfig } from '@playwright/test';

/**
 * Playwright: перевірка практичного застосунку, презентації і 3D-епізодів.
 * Запуск: npm run test:e2e   (сервери стартують самі, якщо ще не запущені)
 */
export default defineConfig({
  testDir: 'tests',
  timeout: 180_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    browserName: 'chromium',
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    // автоплей без жесту — щоб тести музики в 3D-плеєрі могли перевірити, що трек реально грає
    launchOptions: { args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--force-color-profile=srgb', '--autoplay-policy=no-user-gesture-required'] },
  },
  webServer: [
    { command: 'node scripts/serve-docs.mjs 8765', url: 'http://127.0.0.1:8765/3d/', reuseExistingServer: true, timeout: 30_000 },
    { command: 'npm run dev -- --port 5173 --strictPort --host 127.0.0.1', url: 'http://127.0.0.1:5173/', reuseExistingServer: true, timeout: 60_000 },
  ],
});
