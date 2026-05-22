import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../environments/environment';

@Component({
  standalone: true,
  selector: 'app-metrics-page',
  template: `
    <div class="shell">
      <header class="page-head">
        <p class="eyebrow">Observabilidad</p>
        <h1 class="title">Métricas</h1>
        <p class="lede">
          Estado de la plataforma y de los servicios (Grafana). Usa modo kiosk en la URL para una vista
          limpia embebida.
        </p>
      </header>

      @if (embedUrl) {
        <div class="frame-wrap">
          <iframe
            [title]="iframeTitle"
            class="frame"
            [src]="embedUrl"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allow="fullscreen"
          ></iframe>
        </div>
        <p class="frame-foot">
          Si no ves datos, revisa cookies de sesión de Grafana (mismo dominio) o abre el
          <a [href]="rawUrl" target="_blank" rel="noopener noreferrer">panel en otra pestaña</a>.
        </p>
      } @else {
        <div class="empty-card">
          <div class="empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v7.125c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 3 20.25v-7.125Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
              />
            </svg>
          </div>
          <h2 class="empty-title">Configura la URL de Grafana</h2>
          <p class="empty-lede">
            Añade en <code>environment</code> la propiedad <code>grafanaDashboardUrl</code> con la URL
            pública de un dashboard (por ejemplo con
            <code>?kiosk=tv&amp;theme=dark</code>).
          </p>
          <ul class="steps">
            <li>Despliega Grafana y crea un dashboard de salud (CPU, memoria, peticiones, errores).</li>
            <li>Expón el dashboard por HTTPS y copia la URL completa.</li>
            <li>
              En desarrollo: edita
              <code>apps/saas-platform/src/environments/environment.ts</code>. En producción, usa
              <code>environment.prod.ts</code> o el mecanismo de variables de tu despliegue.
            </li>
          </ul>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100%;
      font-family: var(--sp-font-sans);
      color: var(--sp-text);
    }

    .shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(1rem, 3vw, 1.75rem) clamp(1rem, 3.5vw, 2rem) clamp(2rem, 5vw, 3rem);
    }

    .page-head {
      margin-bottom: clamp(1.25rem, 3vw, 2rem);
    }

    .eyebrow {
      margin: 0 0 0.4rem;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--sp-muted);
    }

    .title {
      margin: 0 0 0.55rem;
      font-family: var(--sp-font-display);
      font-weight: 700;
      font-size: clamp(1.85rem, 4vw, 2.5rem);
      letter-spacing: 0.02em;
      line-height: 1.08;
      background: linear-gradient(92deg, #fff 0%, rgba(255, 255, 255, 0.74) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .lede {
      margin: 0;
      max-width: 46rem;
      font-size: 0.95rem;
      line-height: 1.58;
      color: var(--sp-muted);
    }

    .frame-wrap {
      position: relative;
      border-radius: var(--sp-radius-lg);
      border: 1px solid var(--sp-line);
      overflow: hidden;
      background: rgba(0, 0, 0, 0.35);
      box-shadow: var(--sp-shadow);
      min-height: min(72vh, 900px);
    }

    .frame {
      display: block;
      width: 100%;
      height: min(72vh, 900px);
      border: none;
    }

    .frame-foot {
      margin: 0.85rem 0 0;
      font-size: 0.82rem;
      color: var(--sp-muted);
      line-height: 1.45;
    }

    .frame-foot a {
      color: var(--sp-accent-secondary);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .empty-card {
      padding: clamp(1.75rem, 4vw, 2.5rem);
      border-radius: var(--sp-radius-lg);
      border: 1px dashed var(--sp-line);
      background: linear-gradient(165deg, rgba(12, 20, 40, 0.5), rgba(6, 10, 18, 0.4));
    }

    .empty-icon {
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
      color: var(--sp-accent-secondary);
      opacity: 0.85;
    }

    .empty-icon svg {
      width: 100%;
      height: 100%;
    }

    .empty-title {
      margin: 0 0 0.5rem;
      font-family: var(--sp-font-display);
      font-size: 1.35rem;
      font-weight: 700;
    }

    .empty-lede {
      margin: 0 0 1.25rem;
      font-size: 0.92rem;
      line-height: 1.55;
      color: var(--sp-muted);
      max-width: 40rem;
    }

    .steps {
      margin: 0;
      padding-left: 1.2rem;
      color: var(--sp-muted);
      font-size: 0.88rem;
      line-height: 1.6;
      max-width: 42rem;
    }

    .steps li {
      margin-bottom: 0.5rem;
    }

    code {
      font-size: 0.86em;
      padding: 0.1em 0.35em;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
  `,
})
export class MetricsPageComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly rawUrl = (environment.grafanaDashboardUrl ?? '').trim();
  readonly embedUrl: SafeResourceUrl | null = this.rawUrl
    ? this.sanitizer.bypassSecurityTrustResourceUrl(this.rawUrl)
    : null;
  readonly iframeTitle = 'Panel de métricas Grafana';
}
