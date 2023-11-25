import { resolve } from 'path';
import { defineConfig } from 'vite';

// vite.config.js
export default defineConfig(({ mode }) => {
    return {
        build: {
            target: 'es2018',
            sourcemap: true,
            minify: mode === 'production',
            lib: {
                entry: resolve(__dirname, 'src/fparser.ts'),
                name: 'Formula',
                fileName: 'fparser'
            }
        }
    };
});
