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

console.log('✅ Supabase Admin - Creating client with URL:', supabaseUrl.substring(0, 20) + '...');

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('✅ Supabase Admin - Client created successfully');