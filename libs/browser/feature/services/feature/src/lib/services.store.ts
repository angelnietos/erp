import { Injectable, signal, computed } from '@angular/core';

export interface Service {
  id: string;
  name: string;
  description?: string;
  type:
    | 'STREAMING'
    | 'PRODUCCIÓN'
    | 'LED'
    | 'TRANSPORTE'
    | 'PERSONAL_TÉCNICO'
    | 'VIDEO_TÉCNICO';
  basePrice: number;
  hourlyRate?: number;
  isActive: boolean;
  createdAt: string;
}

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Servicio de Streaming Básico',
    description: 'Transmisión en vivo básica',
    type: 'STREAMING',
    basePrice: 500,
    hourlyRate: 50,
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Producción Audio/Video Completa',
    description: 'Producción completa de eventos',
    type: 'PRODUCCIÓN',
    basePrice: 2000,
    hourlyRate: 150,
    isActive: true,
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Pantalla LED 4x3m Exterior',
    description: 'Instalación y soporte de pantalla LED P3.9',
    type: 'LED',
    basePrice: 1200,
    hourlyRate: 0,
    isActive: true,
    createdAt: '2024-02-10',
  },
  {
    id: '4',
    name: 'Transporte Logístico Pesado',
    description: 'Camión 12t para material audiovisual',
    type: 'TRANSPORTE',
    basePrice: 300,
    hourlyRate: 40,
    isActive: true,
    createdAt: '2024-02-15',
  },
  {
    id: '5',
    name: 'Técnico de Sonido Especializado',
    description: 'Ingeniero de sonido para eventos en vivo',
    type: 'PERSONAL_TÉCNICO',
    basePrice: 400,
    hourlyRate: 60,
    isActive: true,
    createdAt: '2024-03-01',
  },
  {
    id: '6',
    name: 'Operador de Cámara y Vídeo',
    description: 'Multicámara + dirección de vídeo',
    type: 'VIDEO_TÉCNICO',
    basePrice: 350,
    hourlyRate: 55,
    isActive: false,
    createdAt: '2024-03-10',
  },
];

/**
 * ServicesStore — singleton root service that persists services state
 * across component lifecycle (navigation). Components should inject this
 * instead of holding their own state signals.
 */
@Injectable({ providedIn: 'root' })
export class ServicesStore {
  private readonly _services = signal<Service[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private _loaded = false;

  readonly services = this._services.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly activeCount = computed(
    () => this._services().filter((s) => s.isActive).length,
  );
  readonly typesCount = computed(
    () => new Set(this._services().map((s) => s.type)).size,
  );

  /** Loads data only once per session */
  load(): void {
    if (this._loaded) return;
    this._isLoading.set(true);
    setTimeout(() => {
      this._services.set(MOCK_SERVICES);
      this._isLoading.set(false);
      this._loaded = true;
    }, 400);
  }

  getById(id: string): Service | undefined {
    return this._services().find((s) => s.id === id);
  }

  add(service: Service): void {
    this._services.update((list) => [service, ...list]);
  }

  update(id: string, changes: Partial<Service>): void {
    this._services.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    );
  }

  remove(id: string): void {
    this._services.update((list) => list.filter((s) => s.id !== id));
  }

  duplicate(id: string): void {
    const original = this.getById(id);
    if (!original) return;
    const copy: Service = {
      ...original,
      id: Math.random().toString(36).substring(7),
      name: `${original.name} (COPIA)`,
      createdAt: new Date().toISOString(),
    };
    this._services.update((list) => [copy, ...list]);
  }
}
