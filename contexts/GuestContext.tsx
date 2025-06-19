import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

interface GuestState {
  transactionCount: number;
  appOpenCount: number;
  firstOpenDate: string | null;
  shouldShowRegistrationPrompt: boolean;
  hasSeenRegistrationPrompt: boolean;
  lastPromptDate: string | null;
}

type GuestAction =
  | { type: 'INCREMENT_TRANSACTION_COUNT' }
  | { type: 'INCREMENT_APP_OPEN_COUNT' }
  | { type: 'SET_FIRST_OPEN_DATE'; payload: string }
  | { type: 'SET_REGISTRATION_PROMPT_SHOWN' }
  | { type: 'DISMISS_REGISTRATION_PROMPT' }
  | { type: 'RESET_GUEST_DATA' }
  | { type: 'LOAD_GUEST_STATE'; payload: Partial<GuestState> }
  | { type: 'UPDATE_PROMPT_STATUS'; payload: boolean };

const initialState: GuestState = {
  transactionCount: 0,
  appOpenCount: 0,
  firstOpenDate: null,
  shouldShowRegistrationPrompt: false,
  hasSeenRegistrationPrompt: false,
  lastPromptDate: null,
};

// Logic to determine if registration prompt should be shown
function shouldShowPrompt(state: GuestState, isAuthenticated: boolean): boolean {
  if (isAuthenticated || state.hasSeenRegistrationPrompt) {
    return false;
  }

  // Don't show prompt too frequently
  if (state.lastPromptDate) {
    const lastPrompt = new Date(state.lastPromptDate);
    const daysSinceLastPrompt = (Date.now() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastPrompt < 2) {
      return false;
    }
  }

  // Show prompt after 5 transactions
  if (state.transactionCount >= 5) {
    return true;
  }

  // Show prompt after 3 app opens
  if (state.appOpenCount >= 3) {
    return true;
  }

  return false;
}

function guestReducer(state: GuestState, action: GuestAction): GuestState {
  switch (action.type) {
    case 'INCREMENT_TRANSACTION_COUNT':
      const newTransactionCount = state.transactionCount + 1;
      return {
        ...state,
        transactionCount: newTransactionCount,
      };
    case 'INCREMENT_APP_OPEN_COUNT':
      const newAppOpenCount = state.appOpenCount + 1;
      return {
        ...state,
        appOpenCount: newAppOpenCount,
      };
    case 'SET_FIRST_OPEN_DATE':
      return { ...state, firstOpenDate: action.payload };
    case 'SET_REGISTRATION_PROMPT_SHOWN':
      return {
        ...state,
        hasSeenRegistrationPrompt: true,
        shouldShowRegistrationPrompt: false,
        lastPromptDate: new Date().toISOString(),
      };
    case 'DISMISS_REGISTRATION_PROMPT':
      return {
        ...state,
        shouldShowRegistrationPrompt: false,
        lastPromptDate: new Date().toISOString(),
      };
    case 'RESET_GUEST_DATA':
      return initialState;
    case 'LOAD_GUEST_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_PROMPT_STATUS':
      return {
        ...state,
        shouldShowRegistrationPrompt: action.payload,
      };
    default:
      return state;
  }
}

const GuestContext = createContext<{
  state: GuestState;
  dispatch: React.Dispatch<GuestAction>;
  incrementTransactionCount: () => void;
  incrementAppOpenCount: () => void;
  markRegistrationPromptShown: () => void;
  dismissRegistrationPrompt: () => void;
  isGuest: boolean;
} | null>(null);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(guestReducer, initialState);
  const { state: authState } = useAuth();

  // Derive guest status from authentication state
  const isGuest = !authState.isAuthenticated;

  useEffect(() => {
    loadGuestState();
  }, []);

  useEffect(() => {
    saveGuestState();
  }, [state]);

  // Update prompt status when authentication or guest state changes
  useEffect(() => {
    const shouldShow = shouldShowPrompt(state, authState.isAuthenticated);
    if (shouldShow !== state.shouldShowRegistrationPrompt) {
      dispatch({ type: 'UPDATE_PROMPT_STATUS', payload: shouldShow });
    }
  }, [state.transactionCount, state.appOpenCount, state.hasSeenRegistrationPrompt, authState.isAuthenticated]);

  const loadGuestState = async () => {
    try {
      const guestData = await AsyncStorage.getItem('guestState');
      if (guestData) {
        const parsedData = JSON.parse(guestData);
        dispatch({ type: 'LOAD_GUEST_STATE', payload: parsedData });
      } else {
        // First time opening the app
        const now = new Date().toISOString();
        dispatch({ type: 'SET_FIRST_OPEN_DATE', payload: now });
        dispatch({ type: 'INCREMENT_APP_OPEN_COUNT' });
      }
    } catch (error) {
      console.error('Error loading guest state:', error);
    }
  };

  const saveGuestState = async () => {
    try {
      await AsyncStorage.setItem('guestState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving guest state:', error);
    }
  };

  const incrementTransactionCount = () => {
    dispatch({ type: 'INCREMENT_TRANSACTION_COUNT' });
  };

  const incrementAppOpenCount = () => {
    dispatch({ type: 'INCREMENT_APP_OPEN_COUNT' });
  };

  const markRegistrationPromptShown = () => {
    dispatch({ type: 'SET_REGISTRATION_PROMPT_SHOWN' });
  };

  const dismissRegistrationPrompt = () => {
    dispatch({ type: 'DISMISS_REGISTRATION_PROMPT' });
  };

  return (
    <GuestContext.Provider
      value={{
        state,
        dispatch,
        incrementTransactionCount,
        incrementAppOpenCount,
        markRegistrationPromptShown,
        dismissRegistrationPrompt,
        isGuest,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};