import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const isValidHttpUrl = (str: string | undefined | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const cleanUrl = (rawUrl: string | undefined | null): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  if (!isValidHttpUrl(trimmed)) return '';
  return trimmed
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/auth\/v1\/?$/i, '')
    .replace(/\/+$/, '');
};

let cachedServerClient: SupabaseClient | null = null;

export const getSupabaseServer = (): SupabaseClient | null => {
  if (cachedServerClient) {
    return cachedServerClient;
  }

  const defaultUrl = 'https://aadwlfwdqubxtmhzbkpn.supabase.co';
  const defaultKey = 'sb_publishable_MridwJWlvDvHU5ADteSLCw_zrXt09PJ';

  const env: Record<string, string | undefined> =
    typeof process !== 'undefined' && process.env ? process.env : {};

  const candidates = [
    env.SUPABASE_URL,
    env.VITE_SUPABASE_URL,
    defaultUrl,
  ];

  let url = '';
  for (const candidate of candidates) {
    if (candidate && isValidHttpUrl(candidate)) {
      url = cleanUrl(candidate);
      break;
    }
  }

  if (!url) {
    url = defaultUrl;
  }

  const key = (
    env.SUPABASE_SECRET_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    defaultKey
  ).trim();

  if (!url || !key || !isValidHttpUrl(url)) {
    return null;
  }

  try {
    cachedServerClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return cachedServerClient;
  } catch (err) {
    console.error('Failed to initialize server-side Supabase client:', err);
    return null;
  }
};
