import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'segav-supabase-config';
let cachedClient = null;
let cachedSignature = '';

export function getStoredSupabaseConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveStoredSupabaseConfig({ url, key }) {
  const clean = {
    url: String(url || '').trim(),
    key: String(key || '').trim()
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(clean));
  cachedClient = null;
  cachedSignature = '';
  return clean;
}

export function clearStoredSupabaseConfig() {
  localStorage.removeItem(CONFIG_KEY);
  cachedClient = null;
  cachedSignature = '';
}

export function getSupabaseConfig() {
  const stored = getStoredSupabaseConfig();
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const runtime = window.SEGAV_SUPABASE_CONFIG || {};

  return {
    url: stored.url || runtime.url || envUrl || '',
    key: stored.key || runtime.key || envKey || '',
    source: stored.url && stored.key ? 'local-app' : runtime.url && runtime.key ? 'runtime' : envUrl && envKey ? 'build-env' : 'missing'
  };
}

export function hasDatabase() {
  const cfg = getSupabaseConfig();
  return Boolean(cfg.url && cfg.key);
}

export function getSupabaseClient() {
  const cfg = getSupabaseConfig();
  if (!cfg.url || !cfg.key) return null;
  const signature = `${cfg.url}|${cfg.key.slice(0, 12)}`;
  if (cachedClient && cachedSignature === signature) return cachedClient;
  cachedClient = createClient(cfg.url, cfg.key);
  cachedSignature = signature;
  return cachedClient;
}
