import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { chromium, type Browser, type Page } from 'playwright';

const PDF_MAGIC = '%PDF';
const RENDER_TIMEOUT_MS = 90_000;

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
    let page: Page | null = null;

    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();
      page.setDefaultTimeout(RENDER_TIMEOUT_MS);

      await page.route('**/*', (route) => {
        const url = route.request().url();
        if (
          url.startsWith('data:') ||
          url.startsWith('about:') ||
          url.startsWith('blob:')
        ) {
          void route.continue();
          return;
        }
        if (
          url.includes('fonts.googleapis.com') ||
          url.includes('fonts.gstatic.com')
        ) {
          void route.abort();
          return;
        }
        void route.continue();
      });

      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: RENDER_TIMEOUT_MS,
      });

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

      const buf = Buffer.from(pdf);
      if (
        buf.length < 128 ||
        !buf.subarray(0, 5).toString('ascii').startsWith(PDF_MAGIC)
      ) {
        throw new InternalServerErrorException(
          'El motor PDF produjo un archivo inválido.',
        );
      }

      this.logger.debug(`PDF generated (${buf.length} bytes)`);
      return buf;
    } catch (error) {
      if (
        error instanceof ServiceUnavailableException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('PDF generation failed', error as Error);
      throw new ServiceUnavailableException(
        'No se pudo generar el PDF. Comprueba que Chromium/Playwright esté instalado (pnpm exec playwright install chromium).',
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
