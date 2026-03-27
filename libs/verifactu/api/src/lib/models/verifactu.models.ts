export interface VerifactuEnqueueRequest {
	invoiceId: string;
	tenantId: string;
}

export interface EnqueueInvoiceResponse {
	queueItemId: string;
	status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
}

export interface VerifactuRecord {
	id: string;
	series?: string;
	number?: number;
	customerNif?: string;
	total?: number;
	status: 'DRAFT' | 'SENT' | 'ERROR' | string;
	createdAt: string;
}

