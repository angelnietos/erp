import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-verifactu-dashboard',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './verifactu-dashboard.component.html',
  styleUrl: './verifactu-dashboard.component.css',
})
export class VerifactuDashboardComponent {}
