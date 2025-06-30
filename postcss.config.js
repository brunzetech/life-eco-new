console.log('🎨 PostCSS Config - Loading...');

export default {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.ts'
    },
    autoprefixer: {},
  },
};

console.log('✅ PostCSS Config - Configuration loaded');