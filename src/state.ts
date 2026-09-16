import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { AppState } from './types';
import type { StateAction } from './lib/store';

export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<StateAction> } | null>(null);

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('AppContext is missing');
  return value;
}

