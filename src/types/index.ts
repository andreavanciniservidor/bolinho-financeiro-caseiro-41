
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  paymentMethod: string;
  isRecurring?: boolean;
  installments?: number;
  observations?: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  plannedAmount: number;
  spentAmount: number;
  alertPercentage: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}
