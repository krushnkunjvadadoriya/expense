import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme, Theme, ThemeColors } from '@/types';

interface ThemeState {
  colorScheme: ColorScheme;
  theme: Theme;
  isLoading: boolean;
}

type ThemeAction =
  | { type: 'SET_COLOR_SCHEME'; payload: ColorScheme }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_THEME' };

const lightColors: ThemeColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  primary: '#4facfe',
  primaryLight: '#EFF6FF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  card: '#334155',
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textTertiary: '#94A3B8',
  primary: '#4facfe',
  primaryLight: '#1E293B',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#475569',
  borderLight: '#334155',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

const createTheme = (colorScheme: ColorScheme): Theme => ({
  colors: colorScheme === 'light' ? lightColors : darkColors,
  isDark: colorScheme === 'dark',
});

const initialState: ThemeState = {
  colorScheme: 'light',
  theme: createTheme('light'),
  isLoading: true,
};

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_COLOR_SCHEME':
      return {
        ...state,
        colorScheme: action.payload,
        theme: createTheme(action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_THEME':
      const newColorScheme = state.colorScheme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        colorScheme: newColorScheme,
        theme: createTheme(newColorScheme),
      };
    default:
      return state;
  }
}

const ThemeContext = createContext<{
  state: ThemeState;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      saveTheme();
    }
  }, [state.colorScheme, state.isLoading]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('colorScheme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        dispatch({ type: 'SET_COLOR_SCHEME', payload: savedTheme as ColorScheme });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveTheme = async () => {
    try {
      await AsyncStorage.setItem('colorScheme', state.colorScheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setColorScheme = (scheme: ColorScheme) => {
    dispatch({ type: 'SET_COLOR_SCHEME', payload: scheme });
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  return (
    <ThemeContext.Provider
      value={{
        state,
        setColorScheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};