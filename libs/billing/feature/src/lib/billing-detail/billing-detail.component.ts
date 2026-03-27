import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-billing-detail',
  standalone: true,
  template: ` <p>Billing detail works.</p> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingDetailComponent {}

