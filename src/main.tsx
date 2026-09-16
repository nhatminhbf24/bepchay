import { StrictMode, useEffect, useReducer } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AppContext } from './state';
import { loadState, reducer, saveState } from './lib/store';
import './styles.css';

function Root() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);
  return <AppContext.Provider value={{ state, dispatch }}><HashRouter><App /></HashRouter></AppContext.Provider>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>);
