import { Route } from '@angular/router';

export const verifactuRoutes: Route[] = [
	{
		path: '',
		loadComponent: () =>
			import('@josanz-erp/verifactu-feature').then((m) => m.ErpVerifactuEntryComponent),
	},
];

