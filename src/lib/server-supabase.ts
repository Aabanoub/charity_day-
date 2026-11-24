import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { INITIAL_ITEMS } from './constants';
import { Item, PriceSubmission, AdminMessage, UserProfile } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
  serviceRoleKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

let serverClientInstance: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured) {
    return null;
  }

  if (!serverClientInstance) {
    serverClientInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return serverClientInstance;
}

// In-Memory Global Fallback Store (for local testing before Supabase keys are provided)
interface GlobalStore {
  items: Item[];
  users: Map<string, UserProfile>;
  submissions: Map<string, PriceSubmission>; // key: `${itemId}_${userId}`
  messages: AdminMessage[];
}

declare global {
  // eslint-disable-next-line no-var
  var __MTD_GLOBAL_STORE__: GlobalStore | undefined;
}

if (!global.__MTD_GLOBAL_STORE__) {
  global.__MTD_GLOBAL_STORE__ = {
    items: [...INITIAL_ITEMS],
    users: new Map(),
    submissions: new Map(),
    messages: [
      {
        id: 'welcome-1',
        title: 'Welcome to Make Their Day! ❤️',
        message: 'Thank you for joining our charity day. Every price you submit helps us make someone smile!',
        createdAt: new Date().toISOString(),
        active: true,
      },
    ],
  };
}

export const inMemoryStore = global.__MTD_GLOBAL_STORE__;
