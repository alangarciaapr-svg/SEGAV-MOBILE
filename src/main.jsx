import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { fetchOnlineState, saveOnlineState, writeLocalState, hasDatabase } from './lib/onlineStore.js';

const ROOT = document.getElementById('root');

function renderApp() {
  createRoot(ROOT).render(<App />);
}

window.__SEGAV_SYNC_SUPABASE__ = async (appData) => {
  if (!hasDatabase()) return { ok: false, mode: 'local' };
  try {
    return await saveOnlineState(appData);
  } catch (error) {
    console.warn('No se pudo sincronizar con Supabase', error);
    return { ok: false, mode: 'local', error };
  }
};

async function bootstrap() {
  if (hasDatabase()) {
    try {
      const onlineState = await fetchOnlineState();
      if (onlineState && Object.keys(onlineState).length > 0) {
        writeLocalState(onlineState);
      }
    } catch (error) {
      console.warn('Supabase no disponible, usando modo local', error);
    }
  }
  renderApp();
}

bootstrap();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
