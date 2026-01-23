import { Page } from '@playwright/test';

export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>(resolve => {
      let totalHeight = 0;
      const distance = 300; // Slower scroll distance
      const maxScrolls = 40; // Increased scrolls for visibility
      let scrolls = 0;

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++;

        if (totalHeight >= scrollHeight || scrolls >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 300); // Slower interval
    });
  });
}
