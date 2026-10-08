export const PLATFORM_VERSION = 1;
export const destinations = {
  home:'https://omnixai.biz/',console:'https://console.omnixai.biz/console',
  library:'https://library.omnixai.biz/',verification:'https://verification.omnixai.biz/',layout:'https://pcb.omnixai.biz/',
} as const;
export function moduleUrl(module:keyof typeof destinations){
  return module==='console' ? (import.meta.env.VITE_CONSOLE_ORIGIN ? `${import.meta.env.VITE_CONSOLE_ORIGIN}/console` : destinations.console) : destinations[module];
}
const allowedOrigins=new Set(Object.values(destinations).map(value=>new URL(value).origin));
export function safeReturnTo(value:string|null):string {
  if(!value)return destinations.home;
  try {const url=new URL(value,destinations.home);return url.protocol==='https:'&&!url.username&&!url.password&&allowedOrigins.has(url.origin)?url.href:destinations.home;}catch{return destinations.home;}
}
export function legacyDestination(pathname:string,search:string,hash:string):string|null {
  let path=pathname,query=search,fragment=hash;
  if(hash.startsWith('#/')){const legacy=new URL(hash.slice(1),'https://omnixai.biz');path=legacy.pathname;query=legacy.search||search;fragment=legacy.hash;}
  if(/^\/(billing|settings\/billing)(\/|$)/.test(path))return `/account/billing${query}${fragment}`;
  if(path==='/home'||path==='/')return null;
  if(/^\/(console|projects|demos|demo|eda|eda-v2|settings)(\/|$)/.test(path))return `https://console.omnixai.biz${path}${query}${fragment}`;
  return null;
}
export function loginUrl(provider:string,returnTo=window.location.href,action='login'){
  if(!['google','github','linkedin'].includes(provider))throw new Error('Unsupported provider');
  return `${destinations.library}api/auth/${provider}/start?${new URLSearchParams({return_to:safeReturnTo(returnTo),action})}`;
}
