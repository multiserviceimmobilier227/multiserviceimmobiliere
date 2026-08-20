import { createMiddleware } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Custom fetch implementation for Supabase that ensures the API key is always sent.
 * This is required because Supabase JS client sometimes fails to include it in the headers
 * when a custom Authorization header is also present.
 */
const createSupabaseFetch = (supabaseKey: string) => {
  return (input: RequestInfo | URL, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (!headers.has('apikey')) {
      headers.set('apikey', supabaseKey);
    }
    return fetch(input, { ...options, headers });
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

    // In TanStack Start v1 with Nitro, we can use globalThis.getRequest() 
    // or import from @tanstack/react-start/server.
    // If vinxi/http is missing, we'll try to get it from the Nitro event or context if possible.
    // For now, let's use a safer check for the header.
    
    let authHeader: string | null = null;
    try {
      // @ts-ignore - getRequest is often available globally in Nitro environments
      const request = typeof getRequest !== 'undefined' ? getRequest() : null;
      authHeader = request?.headers?.get('authorization') || null;
    } catch (e) {
      console.warn('[Auth Middleware] Could not get request headers:', e);
    }

    if (!authHeader) {
      // Allow SSR to proceed without crashing, handlers must check userId
      const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: { fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY) }
      });
      return next({
        context: {
          supabase,
          userId: "" as string,
          claims: {} as any
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