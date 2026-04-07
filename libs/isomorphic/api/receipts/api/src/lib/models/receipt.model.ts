export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod = 'BANK_TRANSFER' | 'CASH' | 'CARD' | 'CHECK';

export interface Receipt {
  id: string;
  invoiceId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReceiptDTO {
  tenantId: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface UpdateReceiptDTO {
  amount?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  dueDate?: string;
  notes?: string;
}

export interface PaymentReminder {
  id: string;
  receiptId: string;
  sentAt: string;
  reminderType: 'FIRST' | 'SECOND' | 'FINAL';
  status: 'SENT' | 'FAILED';
}
