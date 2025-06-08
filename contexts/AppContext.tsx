import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, EMI, User, MonthlyStats, CategoryStats } from '@/types';

interface AppState {
  user: User | null;
  transactions: Transaction[];
  categories: Category[];
  emis: EMI[];
  isLoading: boolean;
  monthlyStats: MonthlyStats;
  categoryStats: CategoryStats[];
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'SET_EMIS'; payload: EMI[] }
  | { type: 'ADD_EMI'; payload: EMI }
  | { type: 'UPDATE_EMI'; payload: EMI }
  | { type: 'SET_MONTHLY_STATS'; payload: MonthlyStats }
  | { type: 'SET_CATEGORY_STATS'; payload: CategoryStats[] };

const initialState: AppState = {
  user: null,
  transactions: [],
  categories: [],
  emis: [],
  isLoading: true,
  monthlyStats: {
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    budgetUsed: 0,
    transactionCount: 0,
  },
  categoryStats: [],
};

const defaultCategories: Category[] = [
  { id: '1', name: 'Food & Dining', type: 'expense', color: '#EF4444', icon: 'utensils' },
  { id: '2', name: 'Transportation', type: 'expense', color: '#3B82F6', icon: 'car' },
  { id: '3', name: 'Shopping', type: 'expense', color: '#8B5CF6', icon: 'shopping-bag' },
  { id: '4', name: 'Entertainment', type: 'expense', color: '#F59E0B', icon: 'tv' },
  { id: '5', name: 'Bills & Utilities', type: 'expense', color: '#3B82F6', icon: 'receipt' },
  { id: '6', name: 'Healthcare', type: 'expense', color: '#EF4444', icon: 'heart' },
  { id: '7', name: 'Education', type: 'expense', color: '#6366F1', icon: 'book' },
  { id: '8', name: 'Salary', type: 'income', color: '#3B82F6', icon: 'briefcase' },
  { id: '9', name: 'Freelance', type: 'income', color: '#2563EB', icon: 'laptop' },
  { id: '10', name: 'Investment', type: 'income', color: '#1D4ED8', icon: 'trending-up' },
];

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'SET_EMIS':
      return { ...state, emis: action.payload };
    case 'ADD_EMI':
      return { ...state, emis: [...state.emis, action.payload] };
    case 'UPDATE_EMI':
      return {
        ...state,
        emis: state.emis.map(e => (e.id === action.payload.id ? action.payload : e)),
      };
    case 'SET_MONTHLY_STATS':
      return { ...state, monthlyStats: action.payload };
    case 'SET_CATEGORY_STATS':
      return { ...state, categoryStats: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addEMI: (emi: Omit<EMI, 'id'>) => void;
  updateEMI: (emi: EMI) => void;
  calculateStats: () => void;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [state.transactions]);

  const loadData = async () => {
    try {
      const [userData, transactionsData, categoriesData, emisData] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('transactions'),
        AsyncStorage.getItem('categories'),
        AsyncStorage.getItem('emis'),
      ]);

      if (userData) {
        dispatch({ type: 'SET_USER', payload: JSON.parse(userData) });
      } else {
        // Set default user
        const defaultUser: User = {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          currency: 'USD',
          monthlyBudget: 3000,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'SET_USER', payload: defaultUser });
        await AsyncStorage.setItem('user', JSON.stringify(defaultUser));
      }

      if (transactionsData) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: JSON.parse(transactionsData) });
      }

      if (categoriesData) {
        dispatch({ type: 'SET_CATEGORIES', payload: JSON.parse(categoriesData) });
      } else {
        dispatch({ type: 'SET_CATEGORIES', payload: defaultCategories });
        await AsyncStorage.setItem('categories', JSON.stringify(defaultCategories));
      }

      if (emisData) {
        dispatch({ type: 'SET_EMIS', payload: JSON.parse(emisData) });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const transaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    
    const updatedTransactions = [transaction, ...state.transactions];
    await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const updateTransaction = async (transaction: Transaction) => {
    const updatedTransaction = { ...transaction, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
    
    const updatedTransactions = state.transactions.map(t =>
      t.id === transaction.id ? updatedTransaction : t
    );
    await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const deleteTransaction = async (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    
    const updatedTransactions = state.transactions.filter(t => t.id !== id);
    await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const addEMI = async (emiData: Omit<EMI, 'id'>) => {
    const emi: EMI = {
      ...emiData,
      id: Date.now().toString(),
    };

    dispatch({ type: 'ADD_EMI', payload: emi });
    
    const updatedEMIs = [...state.emis, emi];
    await AsyncStorage.setItem('emis', JSON.stringify(updatedEMIs));
  };

  const updateEMI = async (emi: EMI) => {
    dispatch({ type: 'UPDATE_EMI', payload: emi });
    
    const updatedEMIs = state.emis.map(e => (e.id === emi.id ? emi : e));
    await AsyncStorage.setItem('emis', JSON.stringify(updatedEMIs));
  };

  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = state.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const budgetUsed = state.user ? (totalExpenses / state.user.monthlyBudget) * 100 : 0;

    const monthlyStats: MonthlyStats = {
      totalIncome,
      totalExpenses,
      netSavings,
      budgetUsed,
      transactionCount: currentMonthTransactions.length,
    };

    dispatch({ type: 'SET_MONTHLY_STATS', payload: monthlyStats });

    // Calculate category stats
    const expensesByCategory = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const categoryStats: CategoryStats[] = Object.entries(expensesByCategory).map(([category, amount]) => {
      const categoryInfo = state.categories.find(c => c.name === category);
      return {
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: categoryInfo?.color || '#6B7280',
        transactionCount: currentMonthTransactions.filter(t => t.category === category).length,
      };
    }).sort((a, b) => b.amount - a.amount);

    dispatch({ type: 'SET_CATEGORY_STATS', payload: categoryStats });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addEMI,
        updateEMI,
        calculateStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};