import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// FADA project page. Deployed to GitHub Pages as a user/organization site,
// served from the domain root — hence base '/' below.
//
// The COOP/COEP headers are not strictly needed for Phase 1, but we set them in
// dev/preview so the future Phase-2 MuJoCo-WASM viewer (SharedArrayBuffer) behaves
// identically locally. GitHub Pages cannot send these headers; Phase 2 is planned
// around the single-threaded WASM build (or a coi-serviceworker shim).
const crossOriginIsolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
}

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        timeline: fileURLToPath(new URL('./timeline_v2.html', import.meta.url)),
      },
    },
  },
  server: { headers: crossOriginIsolation },
  preview: { headers: crossOriginIsolation },
  // .onnx policy models are loaded at runtime from public/ via fetch — treat any
  // that get imported as static assets (belt-and-suspenders; we fetch by URL).
  assetsInclude: ['**/*.onnx'],
  optimizeDeps: {
    // The MuJoCo Emscripten glue is a large hand-built ESM bundle that esbuild's
    // dep pre-bundling chokes on; load it as-is. (It's lazy-imported anyway.)
    exclude: ['@mujoco/mujoco'],
  },
})
