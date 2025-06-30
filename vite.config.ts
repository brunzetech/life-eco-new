import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  console.log('🔧 Vite Config - Mode:', mode);
  
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('🔧 Vite Config - Environment variables loaded:');
  console.log('- SUPABASE_URL:', env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('- SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

  return {
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
      }),
      tsconfigPaths(),
    ],
    define: {
      "process.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL),
      "process.env.SUPABASE_ANON_KEY": JSON.stringify(env.SUPABASE_ANON_KEY),
      "process.env.SUPABASE_SERVICE_ROLE_KEY": JSON.stringify(env.SUPABASE_SERVICE_ROLE_KEY),
      "process.env.SESSION_SECRET": JSON.stringify(env.SESSION_SECRET),
    },
    envPrefix: ['VITE_', 'SUPABASE_', 'SESSION_'],
    css: {
      postcss: './postcss.config.js',
      devSourcemap: true,
    },
    server: {
      fs: {
        allow: ['..']
      }
    },
    build: {
      cssCodeSplit: false,
    }
  };
});