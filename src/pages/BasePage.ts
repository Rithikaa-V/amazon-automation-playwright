import type { Page } from '@playwright/test';
import { Header } from '../components/Header';
import { handleBotChallenge } from '../utils/botCheck';

export abstract class BasePage {
  readonly header: Header;

  constructor(readonly page: Page) {
    this.header = new Header(page);
  }

  protected async open(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await handleBotChallenge(this.page);
  }
}
