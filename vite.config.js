import { defineConfig } from 'vite';

export default defineConfig({
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
});