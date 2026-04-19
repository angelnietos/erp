import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UiButtonComponent } from '../button/button.component';
import { UiCardComponent } from '../card/card.component';


@Component({
  selector: 'ui-detail-placeholder',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    UiButtonComponent,
    UiCardComponent,
  ],
  template: `
    <div class="placeholder-container animate-fade-in">
      <header class="page-header">
        <div class="header-main">
          <h1 class="page-title">Vista de detalle</h1>
          <div class="breadcrumb">
            <span class="active">Expediente</span>
            <span class="separator">/</span>
            <span>En preparación</span>
          </div>
        </div>
        <ui-button
          variant="ghost"
          size="md"
          (clicked)="goBack()"
          icon="arrow-left"
        >
          Volver al listado
        </ui-button>
      </header>

      <div class="feature-msg">
        <div class="glow-box">
          <lucide-icon
            name="construction"
            size="64"
            class="text-brand"
            aria-hidden="true"
          ></lucide-icon>
          <h2>Página en preparación</h2>
          <p class="intel-text">
            El detalle del registro n.º {{ id() }} aún no está disponible; estamos
            terminando esta pantalla para que puedas consultarlo con comodidad.
          </p>
          <div class="terminal-text" aria-hidden="true">
            <span>&gt; SYS: BINDING_DATA_SOURCE…</span>
            <span class="blink">_</span>
          </div>
          <ui-button variant="primary" (clicked)="goBack()">Volver atrás</ui-button>
        </div>
      </div>

      <div class="stats-preview">
        <ui-card variant="glass">
          <div class="stat-lbl">Referencia</div>
          <div class="stat-val font-mono">
            OP-{{ id()?.slice(0, 8) | uppercase }}
          </div>
        </ui-card>
        <ui-card variant="glass">
          <div class="stat-lbl">Estado</div>
          <div class="stat-val text-success">Sincronizado</div>
        </ui-card>
        <ui-card variant="glass">
          <div class="stat-lbl">Permisos</div>
          <div class="stat-val">Administrador</div>
        </ui-card>
      </div>
    </div>
  `,
  styles: [
    `
      .placeholder-container {
        padding: 0;
        max-width: var(--feature-page-max-width, 1400px);
        margin-left: auto;
        margin-right: auto;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        box-sizing: border-box;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--border-soft);
      }

      .page-title {
        font-size: 1.35rem;
        font-weight: 800;
        color: #fff;
        margin: 0 0 0.25rem 0;
        letter-spacing: -0.02em;
        font-family: var(--font-main);
      }

      .breadcrumb {
        display: flex;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: var(--text-muted);
      }
      .breadcrumb .active {
        color: var(--brand);
      }

      .feature-msg {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
      }

      .glow-box {
        background: var(--bg-secondary);
        border: 1px solid var(--border-soft);
        border-radius: var(--radius-md);
        padding: 4rem;
        max-width: 600px;
        width: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
        position: relative;
      }

      .glow-box::after {
        content: '';
        position: absolute;
        top: -1px;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--brand),
          transparent
        );
      }

      h2 {
        font-size: 1.35rem;
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.02em;
        margin: 0;
      }
      .intel-text {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.55;
        max-width: 36rem;
      }

      .terminal-text {
        background: #000;
        width: 100%;
        padding: 1rem;
        border-radius: 4px;
        color: var(--success);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        text-align: left;
        border: 1px solid rgba(52, 211, 153, 0.2);
      }

      .blink {
        animation: blink 1s infinite;
      }
      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
      }

      .stats-preview {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      .stat-lbl {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text-muted);
        margin-bottom: 8px;
        letter-spacing: 0.04em;
        text-transform: none;
      }
      .stat-val {
        font-size: 1.05rem;
        font-weight: 700;
        color: #fff;
      }

      .text-brand {
        color: var(--brand);
      }
      .text-success {
        color: var(--success);
      }

      @media (prefers-reduced-motion: reduce) {
        .blink {
          animation: none;
          opacity: 0.7;
        }
      }
    `,
  ],
})
export class DetailPlaceholderComponent {
  private route = inject(ActivatedRoute);
  id = signal<string | null>(null);

  constructor() {
    this.route.params.subscribe((params) => {
      this.id.set(params['id']);
    });
  }

  goBack() {
    window.history.back();
  }
}
