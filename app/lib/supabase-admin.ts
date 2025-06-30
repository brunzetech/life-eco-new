import { createClient } from "@supabase/supabase-js";

// Add detailed logging for debugging
console.log('🔍 Supabase Admin - Environment check:');
console.log('- process.env.SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('- process.env.SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');

if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL environment variable is missing');
  throw new Error("SUPABASE_URL environment variable is required");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is missing');
  throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate URL format
try {
  const url = new URL(supabaseUrl);
  if (!url.hostname.includes('supabase.co')) {
    console.warn('⚠️ Supabase Admin - URL does not appear to be a valid Supabase URL');
  }
  console.log('✅ Supabase Admin - URL validation passed:', url.origin);
} catch (error) {
  console.error('❌ Supabase Admin - Invalid URL format:', supabaseUrl);
  throw new Error(`Invalid SUPABASE_URL format: ${supabaseUrl}`);
}

console.log('✅ Supabase Admin - Creating client with URL:', supabaseUrl.substring(0, 30) + '...');

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: (url, options = {}) => {
      console.log('🌐 Supabase Admin - Making request to:', typeof url === 'string' ? url.substring(0, 50) + '...' : 'URL object');
      return fetch(url, {
        ...options,
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }).catch(error => {
        console.error('❌ Supabase Admin - Fetch error:', error.message);
        console.error('❌ Supabase Admin - Target URL:', typeof url === 'string' ? url : url.toString());
        throw error;
      });
    },
  },
});

console.log('✅ Supabase Admin - Client created successfully');