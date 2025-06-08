export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
  budget?: number;
}

export interface EMI {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  tenure: number; // in months
  monthlyAmount: number;
  startDate: string;
  nextDueDate: string;
  totalPaid: number;
  remainingAmount: number;
  status: 'active' | 'completed' | 'defaulted';
}

export interface User {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  currency: string;
  monthlyBudget: number;
  createdAt: string;
  avatar?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  budgetUsed: number;
  transactionCount: number;
}

export interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  transactionCount: number;
}

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  monthlyBudget: number;
  members: FamilyMember[];
  budget: FamilyBudget;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface FamilyBudget {
  monthly: number;
  spent: number;
  categories: FamilyBudgetCategory[];
}

export interface FamilyBudgetCategory {
  name: string;
  budget: number;
  spent: number;
  color: string;
}

export interface FamilyTransaction extends Transaction {
  familyGroupId: string;
  addedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface FamilyInvitation {
  id: string;
  familyGroupId: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email?: string;
  mobile?: string;
  name: string;
  avatar?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  createdAt: string;
}

export interface RegistrationData {
  email?: string;
  mobile?: string;
  name: string;
  pin: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}