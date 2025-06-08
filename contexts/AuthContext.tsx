import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, AuthState, RegistrationData } from '@/types';

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  setupPin: (pin: string, userData: Omit<RegistrationData, 'pin'>) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  resetPin: (contact: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<void>;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const userPin = await AsyncStorage.getItem('userPin');
      
      if (userData && userPin) {
        const user = JSON.parse(userData);
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setupPin = async (pin: string, userData: Omit<RegistrationData, 'pin'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Create a new user account
      const newUser: AuthUser = {
        id: Date.now().toString(),
        email: userData.email,
        mobile: userData.mobile,
        name: userData.name,
        isEmailVerified: !!userData.email,
        isMobileVerified: !!userData.mobile,
        createdAt: new Date().toISOString(),
      };

      // Store PIN securely (in production, use proper encryption)
      await AsyncStorage.setItem('userPin', pin);
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));

      dispatch({ type: 'SET_USER', payload: newUser });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to setup PIN' });
      throw error;
    }
  };

  const verifyPin = async (pin: string) => {
    try {
      const storedPin = await AsyncStorage.getItem('userPin');
      return storedPin === pin;
    } catch (error) {
      throw new Error('Failed to verify PIN');
    }
  };

  const resetPin = async (contact: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Mock API call for PIN reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send reset instructions' });
      throw error;
    }
  };

  const changePin = async (oldPin: string, newPin: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const storedPin = await AsyncStorage.getItem('userPin');
      
      if (storedPin !== oldPin) {
        throw new Error('Current PIN is incorrect');
      }

      // Update PIN
      await AsyncStorage.setItem('userPin', newPin);
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to change PIN' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userPin');
      await AsyncStorage.removeItem('userData');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        setupPin,
        verifyPin,
        resetPin,
        changePin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};