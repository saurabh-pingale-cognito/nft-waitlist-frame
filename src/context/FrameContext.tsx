'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

type ScreenType = 'home' | 'success' | 'mint' | 'mintSuccess';

export interface AppState {
  screen: ScreenType;
  wallet: string;
  fid: number;
  imageUri: string;
  error: string | null;
}

export type Action =
  | { type: 'SET_SCREEN'; payload: ScreenType }
  | { type: 'SET_WALLET'; payload: string }
  | { type: 'SET_FID'; payload: number }
  | { type: 'SET_IMAGE_URI'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  screen: 'home',
  wallet: '',
  fid: 0,
  imageUri: '',
  error: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    case 'SET_WALLET':
      return { ...state, wallet: action.payload };
    case 'SET_FID':
      return { ...state, fid: action.payload };
    case 'SET_IMAGE_URI':
      return { ...state, imageUri: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const FrameContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function FrameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <FrameContext.Provider value={{ state, dispatch }}>
      {children}
    </FrameContext.Provider>
  );
}

export function useFrameContext() {
  const context = useContext(FrameContext);
  if (!context) {
    throw new Error('useFrameContext must be used within FrameProvider');
  }
  return context;
}