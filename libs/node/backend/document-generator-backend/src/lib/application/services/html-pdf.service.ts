import {
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { chromium, type Browser } from 'playwright';

@Injectable()
export class HtmlPdfService implements OnModuleDestroy {
  private readonly logger = new Logger(HtmlPdfService.name);
  private browserPromise: Promise<Browser> | null = null;

  private async getBrowser(): Promise<Browser> {
    if (!this.browserPromise) {
      this.browserPromise = chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browserPromise;
  }

  async renderHtmlToPdf(html: string): Promise<Buffer> {
    let browser: Browser | null = null;
    let page = null;

    try {
      browser = await this.getBrowser();
      page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                }),
            ),
        );
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        preferCSSPageSize: true,
      });

      return Buffer.from(pdf);
    } catch (error) {
      this.logger.error('PDF generation failed', error as Error);
      throw new ServiceUnavailableException(
        'No se pudo generar el PDF. Comprueba que Chromium/Playwright esté instalado en el servidor.',
      );
    } finally {
      if (page) {
        await page.close().catch(() => undefined);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browserPromise) {
      const browser = await this.browserPromise;
      await browser.close().catch(() => undefined);
      this.browserPromise = null;
    }
  }
}
