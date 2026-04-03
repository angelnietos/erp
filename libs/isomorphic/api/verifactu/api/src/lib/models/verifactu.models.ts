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
	invoiceId: string;
	/** Nº factura ERP cuando viene de la relación con `Invoice`. */
	reference?: string;
	series?: string;
	number?: number;
	customerNif?: string;
	customerName?: string;
	total?: number;
	status: 'DRAFT' | 'SENT' | 'ERROR' | string;
	verifactuStatus?: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
	createdAt: string;
	updatedAt?: string;
	aeatReference?: string;
	qrCode?: string;
}

export interface VerifactuInvoiceDetail {
	id: string;
	invoiceId: string;
	series: string;
	number: number;
	issueDate: string;
	customerNif: string;
	customerName: string;
	subtotal: number;
	taxAmount: number;
	total: number;
	status: string;
	verifactuStatus: string;
	createdAt: string;
	aeatReference?: string;
	qrCode?: string;
	hashChain?: {
		currentHash: string;
		previousHash?: string;
	};
}

export interface SubmitToVerifactuResponse {
	success: boolean;
	queueItemId?: string;
	message?: string;
	aeatReference?: string;
}

