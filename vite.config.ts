import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiMiddleware, localStore } from './server/local';
export default defineConfig(({mode}) => {
  const env={...loadEnv(mode,process.cwd(),''),...process.env,BUCKET:localStore('.local-data')};
  return {plugins:[react(),{name:'stetech-local-api',configureServer(server){server.middlewares.use(apiMiddleware(env));},configurePreviewServer(server){server.middlewares.use(apiMiddleware(env));}}],build:{outDir:'dist/client'},optimizeDeps:{exclude:['lucide-react']}};
});
