import { Injectable, signal } from '@angular/core';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'active' | 'completed' | 'cancelled' | 'draft';
  attendees: number;
  capacity: number;
  type:
    | 'conference'
    | 'workshop'
    | 'meeting'
    | 'social'
    | 'presentation'
    | 'other';
  organizer: string;
  cost: number;
  createdAt: string;
}

const SEED: EventItem[] = [
  {
    id: 'ev-concierto-2026',
    title: 'Concierto Verano 2026',
    description: 'Montaje audio, iluminación y streaming para gira de verano',
    date: '2026-07-18',
    time: '21:00',
    location: 'Auditorio Municipal',
    status: 'active',
    attendees: 0,
    capacity: 5000,
    type: 'other',
    organizer: 'Producción Josanz',
    cost: 0,
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: '1',
    title: 'Evento Corporativo ABC',
    description: 'Evento anual de networking y presentación de productos',
    date: '2024-04-15',
    time: '10:00',
    location: 'Sala de Conferencias Principal',
    status: 'active',
    attendees: 150,
    capacity: 200,
    type: 'conference',
    organizer: 'María González',
    cost: 0,
    createdAt: '2024-03-01T09:00:00Z',
  },
  {
    id: '2',
    title: 'Taller de Desarrollo Profesional',
    description: 'Sesión de formación para empleados sobre nuevas tecnologías',
    date: '2024-04-20',
    time: '14:30',
    location: 'Sala de Formación',
    status: 'active',
    attendees: 25,
    capacity: 30,
    type: 'workshop',
    organizer: 'Carlos Rodríguez',
    cost: 50,
    createdAt: '2024-03-05T14:20:00Z',
  },
  {
    id: '3',
    title: 'Presentación de Producto XYZ',
    description: 'Lanzamiento del nuevo producto de la compañía',
    date: '2024-03-28',
    time: '16:00',
    location: 'Auditorio Principal',
    status: 'completed',
    attendees: 200,
    capacity: 250,
    type: 'presentation',
    organizer: 'Ana López',
    cost: 0,
    createdAt: '2024-02-15T11:30:00Z',
  },
  {
    id: '4',
    title: 'Reunión Trimestral de Equipo',
    description: 'Revisión de objetivos y planificación del próximo trimestre',
    date: '2024-04-10',
    time: '09:00',
    location: 'Sala de Juntas Ejecutiva',
    status: 'active',
    attendees: 12,
    capacity: 15,
    type: 'meeting',
    organizer: 'Director General',
    cost: 0,
    createdAt: '2024-03-20T16:45:00Z',
  },
  {
    id: '5',
    title: 'Cena de Navidad Corporativa',
    description: 'Evento social de fin de año para empleados y familias',
    date: '2024-12-20',
    time: '20:00',
    location: 'Hotel Gran Palacio',
    status: 'draft',
    attendees: 0,
    capacity: 150,
    type: 'social',
    organizer: 'RRHH',
    cost: 75,
    createdAt: '2024-03-10T10:15:00Z',
  },
];

function newId(): string {
  return `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

@Injectable({ providedIn: 'root' })
export class EventsStateService {
  private readonly _events = signal<EventItem[]>([...SEED]);
  readonly events = this._events.asReadonly();

  getById(id: string): EventItem | undefined {
    return this._events().find((e) => e.id === id);
  }

  create(data: Omit<EventItem, 'id' | 'createdAt'>): EventItem {
    const item: EventItem = {
      ...data,
      id: newId(),
      createdAt: new Date().toISOString(),
    };
    this._events.update((list) => [item, ...list]);
    return item;
  }

  update(id: string, patch: Partial<EventItem>): EventItem | null {
    let out: EventItem | null = null;
    this._events.update((list) =>
      list.map((e) => {
        if (e.id !== id) {
          return e;
        }
        out = { ...e, ...patch };
        return out;
      }),
    );
    return out;
  }

  delete(id: string): void {
    this._events.update((list) => list.filter((e) => e.id !== id));
  }

  duplicate(source: EventItem): EventItem {
    const copy: Omit<EventItem, 'id' | 'createdAt'> = {
      ...source,
      title: `${source.title} (COPIA)`,
      attendees: 0,
    };
    return this.create(copy);
  }
}
