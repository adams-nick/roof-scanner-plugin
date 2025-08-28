import { defineConfig, loadEnv } from 'vite';

// Plugin to replace environment variables in HTML files
function htmlEnvReplace() {
  return {
    name: 'html-env-replace',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const env = loadEnv(context.server?.config.mode || 'development', process.cwd(), '');
        return html
          .replace(/%VITE_GOOGLE_MAPS_API_KEY%/g, env.VITE_GOOGLE_MAPS_API_KEY || '')
          .replace(/%VITE_ROOF_SCANNER_SERVER_URL%/g, env.VITE_ROOF_SCANNER_SERVER_URL)
;
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      htmlEnvReplace()
    ],
    define: {
      // Inject environment variables into both development and production
      __GOOGLE_MAPS_API_KEY__: JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY || ''),
      __ROOF_SCANNER_SERVER_URL__: JSON.stringify(env.VITE_ROOF_SCANNER_SERVER_URL),
    },
    build: {
      lib: {
        entry: 'src/main.js',
        name: 'RoofScanner',
        formats: ['iife'],
        fileName: () => 'roof-scanner.js'
      },
      rollupOptions: {
        output: {
          // Single file output
          inlineDynamicImports: true,
          manualChunks: undefined,
          format: 'iife',
          entryFileNames: 'roof-scanner.js',
          extend: true
        }
      },
      target: 'es2015',
      minify: true,
      sourcemap: true,
      // Inline all CSS and assets
      cssCodeSplit: false,
      assetsInlineLimit: 100000
    },
    server: {
      port: 3333,
      open: '/public/demo.html'
    }
  };
});