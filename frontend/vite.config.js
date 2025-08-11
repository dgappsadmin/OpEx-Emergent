import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: {
        port: 3000
      }
    },
    build: {
      outDir: 'build',
      sourcemap: true
    },
    define: {
      // Ensure process.env is available for environment variables
      'process.env': JSON.stringify(env)
    },
    test: {
      globals: true,
      environment: 'jsdom',
    }
  }
})