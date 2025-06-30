import { createClient } from "@supabase/supabase-js";

// Add detailed logging for debugging
console.log('🔍 Supabase Client - Environment check:');
console.log('- typeof window:', typeof window);
console.log('- window.ENV available:', typeof window !== "undefined" && window.ENV ? 'Yes' : 'No');

const supabaseUrl = typeof window !== "undefined" 
  ? window.ENV?.SUPABASE_URL || process.env.SUPABASE_URL!
  : process.env.SUPABASE_URL!;

const supabaseAnonKey = typeof window !== "undefined"
  ? window.ENV?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!
  : process.env.SUPABASE_ANON_KEY!;

console.log('🔍 Supabase Client - Values:');
console.log('- supabaseUrl:', supabaseUrl ? 'Set' : 'Missing');
console.log('- supabaseAnonKey:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL is missing in both window.ENV and process.env');
  throw new Error("SUPABASE_URL is required");
}

if (!supabaseAnonKey) {
  console.error('❌ SUPABASE_ANON_KEY is missing in both window.ENV and process.env');
  throw new Error("SUPABASE_ANON_KEY is required");
}

console.log('✅ Supabase Client - Creating client with URL:', supabaseUrl.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase Client - Client created successfully');