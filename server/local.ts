import { mkdir, readFile, writeFile, rename, unlink, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApi, type Env, type Store } from './app';
export function localStore(directory:string):Store {
  const root=resolve(directory);const path=(key:string)=>join(root,encodeURIComponent(key));
  return {
    async get(key){try{const data=await readFile(path(key));let contentType='application/json';try{contentType=await readFile(path(key)+'.mime','utf8');}catch{/* JSON records have no MIME sidecar. */}return {body:new Uint8Array(data),text:async()=>data.toString('utf8'),httpMetadata:{contentType}};}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}},
    async put(key,value,options){await mkdir(root,{recursive:true});const file=path(key);const temp=file+'.'+crypto.randomUUID()+'.tmp';await writeFile(temp,typeof value==='string'?value:new Uint8Array(value));await rename(temp,file);if(options?.httpMetadata)await writeFile(file+'.mime',options.httpMetadata.contentType);},
    async delete(key){for(const file of [path(key),path(key)+'.mime']){try{await unlink(file);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}},
    async list({prefix}){await mkdir(root,{recursive:true});const files=await readdir(root);return {objects:files.filter(f=>!f.endsWith('.mime')&&!f.endsWith('.tmp')).map(f=>({key:decodeURIComponent(f)})).filter(f=>f.key.startsWith(prefix)),truncated:false};},
  };
}
export function apiMiddleware(env:Env) {
  return async(req:IncomingMessage,res:ServerResponse,next:()=>void)=>{
    if(!req.url?.startsWith('/api/'))return next();
    try{const chunks:Uint8Array[]=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>3*1024*1024){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Upload exceeds 3 MB.'}));return;}chunks.push(chunk);}
      const headers=new Headers();Object.entries(req.headers).forEach(([k,v])=>{if(v)headers.set(k,Array.isArray(v)?v.join(','):v);});
      const request=new Request(`http://${req.headers.host||'localhost'}${req.url}`,{method:req.method,headers,...(req.method!=='GET'&&req.method!=='HEAD'?{body:Buffer.concat(chunks)}:{})});
      const response=await handleApi(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
    }catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'The server could not complete this request.'}));}
  };
}
