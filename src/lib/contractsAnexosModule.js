const MODULE_ID = 'segav-contratos-anexos-module';
const NAV_ID = 'segav-contratos-anexos-nav';
const MOBILE_OPTION_VALUE = 'Contratos y Anexos';
const STATIC_GENERATOR_URL = '/contratos-anexos.html';
const STORAGE_KEY = 'segav-contracts-generator-html-v29';

function mainArea() {
  return document.querySelector('main');
}

function buildModule() {
  const wrapper = document.createElement('section');
  wrapper.id = MODULE_ID;
  wrapper.style.display = 'none';
  wrapper.style.minHeight = 'calc(100vh - 160px)';

  wrapper.innerHTML = `
    <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm app-card" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-teal-700">Módulo laboral</p>
          <h2 class="text-2xl font-black" style="margin:4px 0 0;">Contratos y Anexos</h2>
          <p class="text-sm text-slate-500" style="margin:6px 0 0;">Integración segura del generador de anexos y contratos sin tocar los registros SST.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" id="segav-contracts-open-static" class="rounded-2xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">Abrir generador</button>
          <button type="button" id="segav-contracts-load-local" class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900">Cargar HTML v29</button>
          <input id="segav-contracts-file" type="file" accept="text/html,.html" style="display:none" />
        </div>
      </div>
      <div id="segav-contracts-status" class="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600" style="margin-top:14px;">
        Fase 1: módulo fusionado en la app. Si el archivo <b>contratos-anexos.html</b> existe en /public, se carga automáticamente. También puedes cargar el HTML v29 una vez y quedará guardado localmente en este navegador.
      </div>
    </section>
    <section class="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm app-card" style="height:calc(100vh - 250px);min-height:620px;overflow:hidden;">
      <iframe id="segav-contracts-frame" title="Generador de contratos y anexos" src="${STATIC_GENERATOR_URL}" style="width:100%;height:100%;border:0;border-radius:22px;background:#fff;"></iframe>
    </section>
  `;

  return wrapper;
}

function ensureModule() {
  const main = mainArea();
  if (!main) return null;
  let module = document.getElementById(MODULE_ID);
  if (!module) {
    module = buildModule();
    main.appendChild(module);
    bindModuleEvents(module);
  }
  return module;
}

function bindModuleEvents(module) {
  const frame = module.querySelector('#segav-contracts-frame');
  const fileInput = module.querySelector('#segav-contracts-file');
  const status = module.querySelector('#segav-contracts-status');
  const openStatic = module.querySelector('#segav-contracts-open-static');
  const loadLocal = module.querySelector('#segav-contracts-load-local');

  const localHtml = localStorage.getItem(STORAGE_KEY);
  if (localHtml) {
    frame.srcdoc = localHtml;
    status.innerHTML = 'Generador v29 cargado desde almacenamiento local de este navegador.';
  }

  openStatic?.addEventListener('click', () => {
    frame.removeAttribute('srcdoc');
    frame.src = STATIC_GENERATOR_URL;
    status.innerHTML = 'Abriendo <b>/contratos-anexos.html</b>. Si aparece error, carga el HTML v29 con el botón “Cargar HTML v29”.';
  });

  loadLocal?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const html = await file.text();
    localStorage.setItem(STORAGE_KEY, html);
    frame.removeAttribute('src');
    frame.srcdoc = html;
    status.innerHTML = `HTML cargado: <b>${file.name}</b>. Quedó guardado localmente para este navegador.`;
  });
}

function setMainChildrenVisibility(showContracts) {
  const main = mainArea();
  const module = ensureModule();
  if (!main || !module) return;

  [...main.children].forEach((child) => {
    if (child.id === MODULE_ID) {
      child.style.display = showContracts ? 'block' : 'none';
      return;
    }
    child.style.display = showContracts ? 'none' : '';
  });
}

function setActiveNav(active) {
  const button = document.getElementById(NAV_ID);
  if (!button) return;
  button.className = active
    ? 'w-full rounded-2xl px-3 py-2 text-left text-sm font-bold bg-teal-700 text-white'
    : 'w-full rounded-2xl px-3 py-2 text-left text-sm font-bold hover:bg-slate-100';
}

function showContractsModule() {
  ensureModule();
  setMainChildrenVisibility(true);
  setActiveNav(true);
  const select = document.querySelector('select.lg\\:hidden, main select');
  if (select && [...select.options].some((o) => o.value === MOBILE_OPTION_VALUE)) select.value = MOBILE_OPTION_VALUE;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitContractsModule() {
  setMainChildrenVisibility(false);
  setActiveNav(false);
}

function installSideNav() {
  const sideNav = document.querySelector('aside nav');
  if (!sideNav || document.getElementById(NAV_ID)) return;
  const btn = document.createElement('button');
  btn.id = NAV_ID;
  btn.type = 'button';
  btn.className = 'w-full rounded-2xl px-3 py-2 text-left text-sm font-bold hover:bg-slate-100';
  btn.textContent = 'Contratos y Anexos';
  btn.addEventListener('click', showContractsModule);
  sideNav.appendChild(btn);
}

function installMobileOption() {
  const selects = [...document.querySelectorAll('main select')];
  const mobile = selects.find((sel) => [...sel.options].some((o) => o.value === 'Dashboard'));
  if (!mobile || [...mobile.options].some((o) => o.value === MOBILE_OPTION_VALUE)) return;
  const opt = document.createElement('option');
  opt.value = MOBILE_OPTION_VALUE;
  opt.textContent = MOBILE_OPTION_VALUE;
  mobile.appendChild(opt);
  mobile.addEventListener('change', () => {
    if (mobile.value === MOBILE_OPTION_VALUE) showContractsModule();
    else exitContractsModule();
  });
}

function installReactNavWatcher() {
  document.addEventListener('click', (event) => {
    const button = event.target?.closest?.('aside nav button');
    if (!button || button.id === NAV_ID) return;
    exitContractsModule();
  }, true);
}

export function installContractsAnexosModule() {
  const tick = () => {
    installSideNav();
    installMobileOption();
  };
  tick();
  installReactNavWatcher();
  const observer = new MutationObserver(tick);
  observer.observe(document.body, { childList: true, subtree: true });
}
