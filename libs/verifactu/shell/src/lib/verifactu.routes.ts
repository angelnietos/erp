import { Route } from '@angular/router';
import { VERIFACTU_API_BASE_URL } from '@josanz-erp/verifactu-api';

export const verifactuRoutes: Route[] = [
	{
		path: '',
		loadComponent: () =>
			import('@josanz-erp/verifactu-feature').then((m) => m.VerifactuDashboardComponent),
		providers: [
			{
				provide: VERIFACTU_API_BASE_URL,
				useValue: 'http://localhost:3100/api',
			},
		],
	},
];

