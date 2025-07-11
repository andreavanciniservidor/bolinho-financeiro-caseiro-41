
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

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  current_organization_id?: string;
  created_at: string;
  updated_at: string;
}
