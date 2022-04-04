import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import inject from "@rollup/plugin-inject";
import vue from '@vitejs/plugin-vue'
import nodePolyfills from "rollup-plugin-polyfill-node";
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'util': resolve(__dirname, 'node_modules/util')
    },
  },
  base: "./",
  // Node.js global to browser globalThis
  define: {
    global: "globalThis",
  },
  plugins: [
    vue(),
    inject({
      util: "util/",
    }),
  ],
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});
