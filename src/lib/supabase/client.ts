import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingMsg = 'Missing Supabase environment variables. Please check your .env.local file.';

let _supabase: any = null;

if (!supabaseUrl || !supabaseAnonKey) {
  // Do not throw during module import — log and provide a proxy that surfaces a clear error when used.
  // This prevents a hard crash/blank page in the browser when env vars are not configured.
  // eslint-disable-next-line no-console
  console.error(missingMsg);
  const handler: ProxyHandler<any> = {
    get() {
      return () => {
        throw new Error(missingMsg);
      };
    },
    apply() {
      throw new Error(missingMsg);
    },
  };
  _supabase = new Proxy({}, handler);
} else {
  _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = _supabase;
