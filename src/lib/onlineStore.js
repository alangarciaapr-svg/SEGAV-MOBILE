import { getSupabaseClient, hasDatabase } from './supabaseClient.js';

const LOCAL_KEY = 'segav-mobile-state';
const ROW_ID = 'main';

export function readLocalState(fallback) {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalState(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export function clearLocalState() {
  localStorage.removeItem(LOCAL_KEY);
}

export async function fetchOnlineState() {
  if (!hasDatabase()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('segav_app_state')
    .select('data, updated_at')
    .eq('id', ROW_ID)
    .maybeSingle();
  if (error) throw error;
  return data?.data || null;
}

export async function saveOnlineState(appData) {
  if (!hasDatabase()) return { ok: false, mode: 'local' };
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, mode: 'local' };
  const { error } = await supabase
    .from('segav_app_state')
    .upsert({ id: ROW_ID, data: appData, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) throw error;
  return { ok: true, mode: 'supabase' };
}

export async function testOnlineConnection() {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, message: 'Falta configurar URL y anon key de Supabase.' };
  const { error } = await supabase
    .from('segav_app_state')
    .select('id, updated_at')
    .eq('id', ROW_ID)
    .maybeSingle();
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Conexion Supabase OK.' };
}

export { hasDatabase };
