import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { fetchOnlineState, saveOnlineState, writeLocalState, hasDatabase } from './lib/onlineStore.js';

const ROOT = document.getElementById('root');
const STATE_KEY = 'segav-mobile-state';

function renderApp() {
  createRoot(ROOT).render(<App />);
}

function installOnlineSync() {
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key, value) => {
    originalSetItem(key, value);
    if (key === STATE_KEY && hasDatabase) {
      try {
        const parsed = JSON.parse(value);
        saveOnlineState(parsed).catch((error) => console.warn('No se pudo sincronizar con Supabase', error));
      } catch (error) {
        console.warn('Estado local no sincronizable', error);
      }
    }
  };
}

async function bootstrap() {
  installOnlineSync();
  if (hasDatabase) {
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
