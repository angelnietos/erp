import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: 'van' | 'truck' | 'car';
  status: 'available' | 'in_use' | 'maintenance';
  currentDriver?: string;
  insuranceExpiry: string;
  itvExpiry: string;
  capacity?: number;
  mileage?: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = '/api/vehicles';

  /** Último listado cargado (p. ej. desde flota) para hidratar detalle sin esperar. */
  private readonly listCache = new Map<string, Vehicle>();

  /** Llamar al cargar el listado para que el detalle pueda mostrar datos al instante. */
  seedListCache(vehicles: Vehicle[]): void {
    this.listCache.clear();
    for (const v of vehicles) {
      this.listCache.set(v.id, v);
    }
  }

  /** Tras crear o actualizar desde formulario: el detalle puede hidratar al instante. */
  upsertListCache(vehicle: Vehicle): void {
    this.listCache.set(vehicle.id, vehicle);
  }

  getListCached(id: string): Vehicle | undefined {
    return this.listCache.get(id);
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  getVehicle(id: string): Observable<Vehicle | undefined> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  getVehiclesByStatus(status: string): Observable<Vehicle[]> {
    if (status === 'all') {
      return this.getVehicles();
    }
    return this.http.get<Vehicle[]>(`${this.apiUrl}?status=${status}`);
  }

  searchVehicles(term: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}?search=${encodeURIComponent(term)}`);
  }

  createVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  updateVehicle(id: string, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, vehicle);
  }

  deleteVehicle(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
