
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: {
    id: string;
    name: string;
    color: string;
    type: 'income' | 'expense';
  };
  category_id?: string;
  payment_method: string;
  installments?: number;
  installment_number?: number;
  is_recurring?: boolean;
  observations?: string;
  tags?: string[];
  user_id: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  parent_transaction_id?: string;
  recurrence_rule?: any;
}

export interface Budget {
  id: string;
  name: string;
  category_id?: string;
  category?: string;
  planned_amount: number;
  spent_amount: number;
  alert_percentage: number;
  is_active: boolean;
  user_id: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  user_id?: string;
  organization_id?: string;
  created_at?: string;
  is_active?: boolean;
  icon?: string;
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

export interface UserPreferences {
  id: string;
  user_id: string;
  theme?: string;
  language?: string;
  currency?: string;
  date_format?: string;
  number_format?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    budget_alerts: boolean;
  };
  created_at: string;
  updated_at: string;
}
