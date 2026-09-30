import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { apiMiddleware, localStore } from './server/local';
import { createFirebaseBackend } from './server/firebase';
export default defineConfig(({mode}) => {
  const variables={...loadEnv(mode,process.cwd(),''),...process.env};
  const firebase=createFirebaseBackend(variables);
  const env={...variables,...(firebase?.error?{}:firebase),BUCKET:firebase?.error?undefined:firebase?.BUCKET||localStore('.local-data'),PERSISTENCE_ERROR:firebase?.error};
  return {
    plugins:[react(),{name:'stetech-local-api',configureServer(server){server.middlewares.use(apiMiddleware(env));},configurePreviewServer(server){server.middlewares.use(apiMiddleware(env));}}],
    build:{outDir:'dist/client',rollupOptions:{output:{manualChunks(id){
      if(id.includes('/node_modules/@firebase/auth'))return 'firebase-auth';
      if(id.includes('/node_modules/@firebase/firestore'))return 'firebase-firestore';
      if(id.includes('/node_modules/@firebase/storage'))return 'firebase-storage';
      if(id.includes('/node_modules/@firebase/app'))return 'firebase-app';
      if(id.includes('/node_modules/@firebase/'))return 'firebase-core';
    }}}},
    optimizeDeps:{exclude:['lucide-react']}
  };
});
