import { handleApi, type Env } from './app';
interface WorkerEnv extends Env { ASSETS: {fetch(request:Request):Promise<Response>}; }
export default {async fetch(request:Request,env:WorkerEnv){
  const url=new URL(request.url);if(url.pathname.startsWith('/api/'))return handleApi(request,env);
  const response=await env.ASSETS.fetch(request);
  if(response.status===404 && request.method==='GET' && !url.pathname.split('/').pop()?.includes('.'))return env.ASSETS.fetch(new Request(new URL('/index.html',url),request));
  return response;
}};
