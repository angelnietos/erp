import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

export interface AiInsight {
  id: string;
  botId: string;
  feature: string;
  title: string;
  summary: string;
  priority: string;
  metrics?: Record<string, string | number>;
  createdAt: string;
}

@Component({
  selector: 'josanz-ai-insights',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-[1.5rem] w-full max-w-[1400px] mx-auto box-border pt-24 min-h-screen">
      <header class="flex justify-between items-end mb-8 border-b border-border/40 pb-4">
        <div>
          <nav class="flex text-[0.75rem] font-[800] uppercase tracking-wider text-muted-foreground mb-4">
            <span>Sistema</span>
            <span class="mx-2">/</span>
            <span class="text-foreground">AI Insights</span>
          </nav>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <lucide-icon name="sparkles" class="w-5 h-5 text-primary"></lucide-icon>
            </div>
            <h1 class="text-[clamp(1.5rem,2vw,2rem)] font-display font-medium tracking-tight m-0 text-foreground">
              Centro de Insights AI
            </h1>
          </div>
          <p class="text-sm text-muted-foreground mt-2 max-w-2xl">
            Sugerencias, patrones y conclusiones de negocio abstraídas de forma autónoma por los asistentes de Inteligencia Artificial del ERP.
          </p>
        </div>
      </header>

      <div *ngIf="loading()" class="py-12 flex justify-center text-muted-foreground">
        Cargando insights...
      </div>

      <div *ngIf="!loading() && insights().length === 0" class="py-24 text-center border border-dashed border-border/60 rounded-2xl bg-card/20">
        <lucide-icon name="brain-circuit" class="w-12 h-12 text-muted-foreground/50 mx-auto mb-4"></lucide-icon>
        <h3 class="text-lg font-medium text-foreground mb-2">No hay Insights registrados</h3>
        <p class="text-muted-foreground max-w-md mx-auto text-sm">
          Aún no hay sugerencias de la IA. Pídele al Orquestador o a los Bots Especialistas que analicen tus datos y guarden descubrimientos.
        </p>
      </div>

      <div *ngIf="!loading() && insights().length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div *ngFor="let insight of insights()" 
             class="group relative flex flex-col p-6 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
          
          <div class="flex justify-between items-start mb-4">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide"
                  [ngClass]="{
                    'bg-red-500/10 text-red-500 border border-red-500/20': insight.priority === 'HIGH',
                    'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20': insight.priority === 'MEDIUM',
                    'bg-blue-500/10 text-blue-500 border border-blue-500/20': insight.priority === 'LOW'
                  }">
              {{ insight.priority }} PRIORIDAD
            </span>
            <div class="flex gap-2 items-center text-xs text-muted-foreground">
              <span class="px-2 py-1 bg-secondary rounded-lg">{{ insight.feature }}</span>
            </div>
          </div>

          <h3 class="text-lg font-medium text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
            {{ insight.title }}
          </h3>
          
          <p class="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
            {{ insight.summary }}
          </p>

          <div *ngIf="insight.metrics && hasKeys(insight.metrics)" class="mt-auto mb-6 p-4 bg-secondary/50 rounded-xl space-y-2">
            <div *ngFor="let key of getKeys(insight.metrics)" class="flex justify-between text-sm">
              <span class="text-muted-foreground">{{ key }}</span>
              <span class="font-medium font-mono text-foreground">{{ insight.metrics[key] }}</span>
            </div>
          </div>

          <div class="mt-auto pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <div class="flex items-center gap-1.5">
               <lucide-icon name="brain-circuit" class="w-3.5 h-3.5"></lucide-icon>
               <span>Bot: {{ insight.botId }}</span>
            </div>
            <span>{{ insight.createdAt | date:'short' }}</span>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AiInsightsComponent implements OnInit {
  private http = inject(HttpClient);
  
  insights = signal<AiInsight[]>([]);
  loading = signal(true);

  async ngOnInit() {
    await this.loadInsights();
  }

  async loadInsights() {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.http.get<AiInsight[]>('/api/ai-insights'));
      this.insights.set(data);
    } catch(e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  hasKeys(obj: Record<string, string | number> | null | undefined): boolean {
    return !!obj && Object.keys(obj).length > 0;
  }

  getKeys(obj: Record<string, string | number> | null | undefined): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
