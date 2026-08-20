import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from 'vinxi/http';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Custom fetch implementation for Supabase that ensures the API key is always sent.
 * This is required because Supabase JS client sometimes fails to include it in the headers
 * when a custom Authorization header is also present.
 */
const createSupabaseFetch = (supabaseKey: string) => {
  return (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (!headers.has('apikey')) {
      headers.set('apikey', supabaseKey);
    }
    return fetch(url, { ...options, headers });
  };
};

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    
    const SUPABASE_URL = process.env['SUPABASE_URL'];
    const SUPABASE_PUBLISHABLE_KEY = process.env['SUPABASE_PUBLISHABLE_KEY'];

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      const missing = [
        ...(!SUPABASE_URL ? ['SUPABASE_URL'] : []),
        ...(!SUPABASE_PUBLISHABLE_KEY ? ['SUPABASE_PUBLISHABLE_KEY'] : []),
      ];
      const message = `Missing Supabase environment variable(s): ${missing.join(', ')}. Connect Supabase in Lovable Cloud.`;
      console.error(`[Supabase] ${message}`);
      throw new Error(message);
    }
    
    const request = getRequest();

    if (!request?.headers) {
      throw new Error('Unauthorized: No request headers available');
    }

    const authHeader = request.headers.get('authorization');

    // Handle missing authorization header for SSR/Initial Prerender
    // Note: attachSupabaseAuth must be registered in src/start.ts functionMiddleware
    if (!authHeader) {
      const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: { fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY) }
      });
      
      return next({
        context: {
          supabase,
          userId: "" as string,
          claims: {} as any,
        }
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Only Bearer tokens are supported');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    if (token.split('.').length !== 3) {
      throw new Error('Unauthorized: Invalid token');
    }

    const supabase = createClient<Database>(
      SUPABASE_URL!,
      SUPABASE_PUBLISHABLE_KEY!,
      {
        global: {
          fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY!),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      throw new Error('Unauthorized: Invalid token');
    }

    if (!data.claims.sub) {
      throw new Error('Unauthorized: No user ID found in token');
    }

    return next({
      context: {
        supabase,
        userId: data.claims.sub as string,
        claims: data.claims,
      },
    });
  },
);