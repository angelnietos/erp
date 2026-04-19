import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  goBack(): void {
    this.location.back();
  }

  goDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }
}
