import { build as viteBuild } from 'vite';
import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
await viteBuild();
await build({entryPoints:['server/worker.ts'],bundle:true,platform:'browser',format:'esm',target:'es2022',outfile:'dist/server/index.js',minify:true});
await mkdir('dist/.openai',{recursive:true});
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
