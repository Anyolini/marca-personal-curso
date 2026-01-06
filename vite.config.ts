import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';
  
  return {
    plugins: [
      dts({
        insertTypesEntry: true,
        rollupTypes: true
      })
    ],
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@core': resolve(__dirname, 'src/core'),
        '@types': resolve(__dirname, 'src/types'),
        '@utils': resolve(__dirname, 'src/utils')
      }
    },

    build: isLib ? {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          flipcards: resolve(__dirname, 'src/flipcards/index.ts'),
          videos: resolve(__dirname, 'src/videos/index.ts')
        },
        name: 'AmyoliniInteractiveLearning',
        formats: ['es', 'umd']
      },
      rollupOptions: {
        external: ['react', 'vue'],
        output: {
          globals: {
            react: 'React',
            vue: 'Vue'
          }
        }
      },
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    } : {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          demo: resolve(__dirname, 'demo.html')
        }
      }
    },

    server: {
      port: 3000,
      open: true,
      cors: true
    },

    preview: {
      port: 4173
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts']
    },

    define: {
      __VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    }
  };
});