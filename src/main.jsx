import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { saveOnlineState, hasDatabase } from './lib/onlineStore.js';
import { installSupabaseSetupPanel } from './lib/supabaseSetupPanel.js';

const root = document.getElementById('root');

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Sincronizacion segura: se ejecuta solo despues de montar la app.
// Si Supabase no esta configurado, la app sigue funcionando localmente.
window.__SEGAV_SYNC_SUPABASE__ = async (appData) => {
  if (!hasDatabase()) return { ok: false, mode: 'local', reason: 'Supabase no configurado' };
  try {
    return await saveOnlineState(appData);
  } catch (error) {
    console.warn('No se pudo sincronizar con Supabase', error);
    return { ok: false, mode: 'local', error };
  }
};

setTimeout(() => {
  installSupabaseSetupPanel();
}, 500);
