import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(root, '../..');
const shimFs = resolve(root, 'shims/fs.js');
const shimCrypto = resolve(root, 'shims/crypto.js');

function shimNodeBuiltins(): Plugin {
  return {
    name: 'ai-commerce-shim-node-builtins',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'node:fs' || id === 'fs' || id === 'node:fs/promises' || id === 'fs/promises') {
        return shimFs;
      }
      if (id === 'node:crypto' || id === 'crypto') {
        return shimCrypto;
      }
      return undefined;
    },
  };
}

export default defineConfig({
  plugins: [shimNodeBuiltins(), react()],
  server: {
    port: 5173,
    fs: {
      allow: [repoRoot],
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    exclude: [
      '@ai-commerce/web-store',
      '@ai-commerce/config-runtime',
      '@ai-commerce/config-schema',
      '@ai-commerce/module-catalog',
      '@ai-commerce/module-cart',
      '@ai-commerce/module-checkout',
      '@ai-commerce/module-order',
      '@ai-commerce/module-payment',
    ],
  },
});
