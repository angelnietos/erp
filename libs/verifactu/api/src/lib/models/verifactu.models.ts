export interface VerifactuInvoicePayload {
	idempotencyKey?: string;
	series?: string;
	customerNif: string;
	total: number;
	lines: Array<{ description: string; quantity: number; unitPrice: number; taxRate: number }>;
}

export interface EnqueueInvoiceResponse {
	queueItemId: string;
	status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
}

export interface VerifactuRecord {
	id: string;
	series: string;
	number: number;
	customerNif: string;
	total: number;
	status: 'DRAFT' | 'SENT' | 'ERROR';
	createdAt: string;
}

