export type AccountUser={id:string;accountId:string;sessionId:string;name:string;email:string;picture:string;provider:string;loginProvider?:string;authenticatedAt:number;status:'active'|'deleting'};
export type AccountSession={id:string;current:boolean;device:string;createdAt:number;lastSeenAt:number;expiresAt:number};
export type Identity={id:string;provider:string;email:string};
export type Blocker={module:string;code:string;message:string;url:string};
let accountCsrf='',consoleCsrf='';
export async function request<T>(path:string,method='GET',body?:unknown,headers:Record<string,string>={}):Promise<T>{
  const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json',...(body!==undefined?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{'X-CSRF-Token':path.startsWith('/api/account/')||path.startsWith('/api/auth/')?accountCsrf:consoleCsrf}:{}),...headers},body:body!==undefined?JSON.stringify(body):undefined});
  const value=response.status===204?null:await response.json().catch(()=>null);
  if(!response.ok)throw new Error(value?.message||value?.error?.message||value?.error||`Request failed (${response.status})`);
  return value as T;
}
export async function loadAccount(){const result=await request<{user:AccountUser|null;csrfToken?:string}>('/api/auth/session');accountCsrf=result.csrfToken||'';return result.user;}
export async function prepareBilling(){
  const current=await request<{user:unknown;csrfToken?:string}>('/api/v1/auth/session');
  consoleCsrf=current.csrfToken||'';
  if(current.user && typeof current.user==='object' && 'accountId' in current.user)return;
  const result=await request<{user:unknown;csrfToken?:string}>('/api/v1/auth/sso/exchange','POST',{});
  if(!result.user)throw new Error('Sign in before opening billing.');consoleCsrf=result.csrfToken||'';
}
