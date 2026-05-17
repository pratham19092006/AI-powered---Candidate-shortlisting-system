import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite is configured for a lightweight local development workflow.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
