export type BudgetStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';

export interface BudgetItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
}

export interface Budget {
  id: string;
  clientId: string;
  total: number;
  status: BudgetStatus;
  items: BudgetItem[];
  createdAt: string;
}

export interface CreateBudgetDTO {
  clientId: string;
}

export interface AddBudgetItemDTO {
  productId: string;
  quantity: number;
  price: number;
  tax?: number;
  discount?: number;
}
