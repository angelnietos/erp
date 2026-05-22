import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Contenedor sin UI para rutas hijas `/users/availability` y `/users/availability/request`. */
@Component({
  selector: 'lib-availability-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AvailabilityShellComponent {}
