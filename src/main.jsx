import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './signature-mobile.css';
import { saveOnlineState, hasDatabase } from './lib/onlineStore.js';
import { installSupabaseSetupPanel } from './lib/supabaseSetupPanel.js';
import { installEppInventoryButton } from './lib/eppInventoryButton.js';
import { installContractsAnexosModule } from './lib/contractsAnexosModule.js';

const root = document.getElementById('root');

function installMobileZoomLock() {
  let lastTouchEnd = 0;

  const prevent = (event) => event.preventDefault();
  document.addEventListener('gesturestart', prevent, { passive: false });
  document.addEventListener('gesturechange', prevent, { passive: false });
  document.addEventListener('gestureend', prevent, { passive: false });

  document.addEventListener('touchmove', (event) => {
    if (event.touches && event.touches.length > 1) event.preventDefault();
  }, { passive: false });

  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 320) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener('wheel', (event) => {
    if (event.ctrlKey) event.preventDefault();
  }, { passive: false });

  document.addEventListener('keydown', (event) => {
    const isZoomKey = event.ctrlKey && ['+', '-', '=', '0'].includes(event.key);
    if (isZoomKey) event.preventDefault();
  }, { passive: false });
}

installMobileZoomLock();

function installServiceWorkerUpdateGuard() {
  if (!('serviceWorker' in navigator)) return;

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update();
    } catch (error) {
      console.warn('No se pudo actualizar el service worker', error);
    }
  });
}

installServiceWorkerUpdateGuard();

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
  installEppInventoryButton();
  installContractsAnexosModule();
}, 500);
