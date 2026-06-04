import { getStoredSupabaseConfig, saveStoredSupabaseConfig, clearStoredSupabaseConfig } from './supabaseClient.js';
import { saveOnlineState, testOnlineConnection } from './onlineStore.js';

const STATE_KEY = 'segav-mobile-state';
const ADMIN_PIN = 'SEGAV2026';

function readCurrentState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
  } catch {
    return {};
  }
}

function styleButton(button, primary = false) {
  button.style.border = '0';
  button.style.borderRadius = '14px';
  button.style.padding = '10px 12px';
  button.style.fontWeight = '900';
  button.style.cursor = 'pointer';
  button.style.background = primary ? 'linear-gradient(135deg,#0f766e,#c2410c)' : '#f1f5f9';
  button.style.color = primary ? '#fff' : '#0f172a';
}

function createInput(labelText, value = '', placeholder = '') {
  const wrap = document.createElement('label');
  wrap.style.display = 'block';
  wrap.style.marginTop = '10px';

  const label = document.createElement('div');
  label.textContent = labelText;
  label.style.fontSize = '11px';
  label.style.fontWeight = '900';
  label.style.textTransform = 'uppercase';
  label.style.color = '#64748b';

  const input = document.createElement('input');
  input.value = value || '';
  input.placeholder = placeholder;
  input.style.width = '100%';
  input.style.marginTop = '4px';
  input.style.border = '1px solid #cbd5e1';
  input.style.borderRadius = '14px';
  input.style.padding = '10px';
  input.style.fontSize = '13px';
  input.style.boxSizing = 'border-box';

  wrap.append(label, input);
  return { wrap, input };
}

function requestAdminAccess() {
  const pin = window.prompt('Menú administrador SEGAV\nIngresa el PIN de acceso:');
  return pin === ADMIN_PIN;
}

export function installSupabaseSetupPanel() {
  if (document.getElementById('segav-supabase-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'segav-supabase-panel';
  panel.style.position = 'fixed';
  panel.style.right = '14px';
  panel.style.bottom = '92px';
  panel.style.width = 'min(420px, calc(100vw - 28px))';
  panel.style.maxHeight = '72vh';
  panel.style.overflow = 'auto';
  panel.style.zIndex = '9999';
  panel.style.background = 'rgba(255,255,255,.96)';
  panel.style.border = '1px solid #e2e8f0';
  panel.style.borderRadius = '24px';
  panel.style.padding = '16px';
  panel.style.boxShadow = '0 24px 70px rgba(15,23,42,.28)';
  panel.style.backdropFilter = 'blur(18px)';
  panel.style.display = 'none';

  const config = getStoredSupabaseConfig();

  const topRow = document.createElement('div');
  topRow.style.display = 'flex';
  topRow.style.justifyContent = 'space-between';
  topRow.style.alignItems = 'center';
  topRow.style.gap = '10px';

  const title = document.createElement('h3');
  title.textContent = 'Menú secreto · Supabase';
  title.style.margin = '0';
  title.style.fontSize = '18px';
  title.style.fontWeight = '1000';
  title.style.color = '#0f172a';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Cerrar';
  styleButton(closeBtn, false);
  closeBtn.onclick = () => { panel.style.display = 'none'; };
  topRow.append(title, closeBtn);

  const help = document.createElement('p');
  help.textContent = 'Panel oculto. Acceso: tocar el logo 6 veces y luego ingresar PIN. No uses service_role ni claves secretas.';
  help.style.margin = '6px 0 10px';
  help.style.fontSize = '12px';
  help.style.color = '#64748b';

  const urlField = createInput('Project URL', config.url, 'https://xxxx.supabase.co');
  const keyField = createInput('Anon/Public key', config.key, 'eyJhbGciOi...');
  keyField.input.type = 'password';

  const status = document.createElement('div');
  status.textContent = config.url && config.key ? 'Credenciales guardadas localmente. Prueba conexión o sincroniza.' : 'Pendiente de configuración.';
  status.style.marginTop = '12px';
  status.style.padding = '10px';
  status.style.borderRadius = '14px';
  status.style.fontSize = '12px';
  status.style.fontWeight = '800';
  status.style.background = config.url && config.key ? '#ecfdf5' : '#fff7ed';
  status.style.color = config.url && config.key ? '#166534' : '#9a3412';

  const row = document.createElement('div');
  row.style.display = 'grid';
  row.style.gridTemplateColumns = '1fr 1fr';
  row.style.gap = '8px';
  row.style.marginTop = '12px';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Guardar y probar';
  styleButton(saveBtn, true);

  const syncBtn = document.createElement('button');
  syncBtn.textContent = 'Sincronizar ahora';
  styleButton(syncBtn, false);

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Borrar conexión';
  styleButton(clearBtn, false);
  clearBtn.style.gridColumn = '1 / span 2';

  saveBtn.onclick = async () => {
    saveStoredSupabaseConfig({ url: urlField.input.value, key: keyField.input.value });
    status.textContent = 'Probando conexión...';
    status.style.background = '#eff6ff';
    status.style.color = '#1d4ed8';
    const result = await testOnlineConnection();
    status.textContent = result.message;
    status.style.background = result.ok ? '#ecfdf5' : '#fef2f2';
    status.style.color = result.ok ? '#166534' : '#991b1b';
  };

  syncBtn.onclick = async () => {
    const state = readCurrentState();
    status.textContent = 'Sincronizando estado actual...';
    status.style.background = '#eff6ff';
    status.style.color = '#1d4ed8';
    try {
      const result = await saveOnlineState(state);
      status.textContent = result.ok ? 'Sincronizado con Supabase. Refresca la tabla segav_app_state.' : 'No se pudo sincronizar: Supabase no configurado.';
      status.style.background = result.ok ? '#ecfdf5' : '#fff7ed';
      status.style.color = result.ok ? '#166534' : '#9a3412';
    } catch (error) {
      status.textContent = `Error: ${error.message || error}`;
      status.style.background = '#fef2f2';
      status.style.color = '#991b1b';
    }
  };

  clearBtn.onclick = () => {
    clearStoredSupabaseConfig();
    urlField.input.value = '';
    keyField.input.value = '';
    status.textContent = 'Conexión borrada de este navegador.';
    status.style.background = '#fff7ed';
    status.style.color = '#9a3412';
  };

  row.append(saveBtn, syncBtn, clearBtn);
  panel.append(topRow, help, urlField.wrap, keyField.wrap, status, row);
  document.body.append(panel);

  const openPanel = () => {
    if (!requestAdminAccess()) return;
    panel.style.display = 'block';
  };

  let logoTapCount = 0;
  let tapTimer = null;
  document.addEventListener('click', (event) => {
    const target = event.target;
    const isLogo = target?.closest?.('.logo-card') || String(target?.alt || '').toLowerCase().includes('logo');
    if (!isLogo) return;
    logoTapCount += 1;
    window.clearTimeout(tapTimer);
    tapTimer = window.setTimeout(() => { logoTapCount = 0; }, 3500);
    if (logoTapCount >= 6) {
      logoTapCount = 0;
      openPanel();
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 's') {
      openPanel();
    }
  });
}
