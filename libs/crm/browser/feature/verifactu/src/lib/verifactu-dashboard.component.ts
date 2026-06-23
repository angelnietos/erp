import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-verifactu-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './verifactu-dashboard.component.html',
  styleUrl: './verifactu-dashboard.component.css',
})
export class VerifactuDashboardComponent {}
