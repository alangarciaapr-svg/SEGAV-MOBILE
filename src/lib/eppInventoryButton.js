import { generateEppInventoryPdf } from './eppInventoryPdf.js';

const STATE_KEY = 'segav-mobile-state';

function readEppRows() {
  try {
    const state = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    return Array.isArray(state.epp) ? state.epp : [];
  } catch {
    return [];
  }
}

function makeButton() {
  const btn = document.createElement('button');
  btn.id = 'segav-epp-inventory-pdf-btn';
  btn.type = 'button';
  btn.textContent = 'PDF inventario EPP';
  btn.style.border = '0';
  btn.style.borderRadius = '18px';
  btn.style.padding = '10px 14px';
  btn.style.fontSize = '13px';
  btn.style.fontWeight = '900';
  btn.style.color = '#fff';
  btn.style.background = 'linear-gradient(135deg,#0f766e,#14b8a6)';
  btn.style.boxShadow = '0 12px 26px rgba(15,118,110,.22)';
  btn.style.cursor = 'pointer';
  btn.onclick = () => {
    const rows = readEppRows();
    generateEppInventoryPdf(rows);
  };
  return btn;
}

function findSummaryTitle() {
  return [...document.querySelectorAll('h3')]
    .find(el => el.textContent?.toLowerCase().includes('resumen de epp por trabajador'));
}

function installButtonOnce() {
  if (document.getElementById('segav-epp-inventory-pdf-btn')) return;
  const title = findSummaryTitle();
  if (!title) return;

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.gap = '12px';
  header.style.flexWrap = 'wrap';
  header.style.marginBottom = '8px';

  const parent = title.parentElement;
  if (!parent) return;

  parent.insertBefore(header, title);
  header.appendChild(title);
  header.appendChild(makeButton());
}

export function installEppInventoryButton() {
  const observer = new MutationObserver(() => installButtonOnce());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(installButtonOnce, 700);
}
