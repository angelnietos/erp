import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = '/api/fleet/vehicles';

  // Mock data for development
  private mockVehicles: Vehicle[] = [
    {
      id: '1',
      plate: '1234-BCD',
      brand: 'Mercedes',
      model: 'Sprinter 316',
      year: 2022,
      type: 'van',
      status: 'available',
      currentDriver: '',
      insuranceExpiry: '2027-06-15',
      itvExpiry: '2027-03-20',
      capacity: 1500,
      mileage: 45000,
      createdAt: '2026-01-10',
    },
    {
      id: '2',
      plate: '5678-FGH',
      brand: 'Iveco',
      model: 'Daily 35S',
      year: 2021,
      type: 'truck',
      status: 'in_use',
      currentDriver: 'Carlos Ruiz',
      insuranceExpiry: '2026-12-01',
      itvExpiry: '2026-11-15',
      capacity: 3500,
      mileage: 78000,
      createdAt: '2026-01-15',
    },
    {
      id: '3',
      plate: '9012-JKL',
      brand: 'Ford',
      model: 'Transit Custom',
      year: 2023,
      type: 'van',
      status: 'maintenance',
      currentDriver: '',
      insuranceExpiry: '2027-02-28',
      itvExpiry: '2026-08-10',
      capacity: 1200,
      mileage: 22000,
      createdAt: '2026-02-01',
    },
  ];

  getVehicles(): Observable<Vehicle[]> {
    return of(this.mockVehicles).pipe(delay(300));
  }

  getVehicle(id: string): Observable<Vehicle | undefined> {
    return of(this.mockVehicles.find(v => v.id === id)).pipe(delay(200));
  }

  getVehiclesByStatus(status: string): Observable<Vehicle[]> {
    if (status === 'all') {
      return this.getVehicles();
    }
    const filtered = this.mockVehicles.filter(v => v.status === status);
    return of(filtered).pipe(delay(200));
  }

  searchVehicles(term: string): Observable<Vehicle[]> {
    const searchTerm = term.toLowerCase();
    const results = this.mockVehicles.filter(v =>
      v.plate.toLowerCase().includes(searchTerm) ||
      v.brand.toLowerCase().includes(searchTerm) ||
      v.model.toLowerCase().includes(searchTerm) ||
      (v.currentDriver && v.currentDriver.toLowerCase().includes(searchTerm))
    );
    return of(results).pipe(delay(200));
  }

  createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt'>): Observable<Vehicle> {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: this.generateId(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.mockVehicles = [...this.mockVehicles, newVehicle];
    return of(newVehicle).pipe(delay(300));
  }

  updateVehicle(id: string, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    const index = this.mockVehicles.findIndex(v => v.id === id);
    if (index >= 0) {
      this.mockVehicles[index] = {
        ...this.mockVehicles[index],
        ...vehicle,
      };
      return of(this.mockVehicles[index]).pipe(delay(300));
    }
    throw new Error('Vehicle not found');
  }

  deleteVehicle(id: string): Observable<boolean> {
    const index = this.mockVehicles.findIndex(v => v.id === id);
    if (index >= 0) {
      this.mockVehicles = this.mockVehicles.filter(v => v.id !== id);
      return of(true).pipe(delay(300));
    }
    return of(false);
  }

  private generateId(): string {
    return 'veh-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
}
