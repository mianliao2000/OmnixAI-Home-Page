import React from 'react';
import { InvestorLandingPage } from './LandingPage';
import { DemoAccessDialog } from './DemoAccessDialog';
import { sharedDemoAccessCookie,DEMO_ACCESS_SESSION_KEY,hasSharedDemoAccess } from './demoAccess';
import { AccountPage } from './AccountPage';
import { moduleUrl,legacyDestination,safeReturnTo } from './platform';
import { loadAccount,request,type AccountUser } from './api';
import type { UiLanguage } from './i18n';

export default function App(){
  const [language,setLanguage]=React.useState<UiLanguage>(()=>localStorage.getItem('omnix.home.language')==='zh'?'zh':'en');
  const [user,setUser]=React.useState<AccountUser|null>(null),[authError,setAuthError]=React.useState('');
  const [providers,setProviders]=React.useState<Record<string,boolean>>({});
  const [destination,setDestination]=React.useState<'console'|'library'|'verification'|'layout'|null>(null);
  const refresh=React.useCallback(async()=>{try{setUser(await loadAccount());setAuthError('');}catch{setAuthError(language==='zh'?'账号服务暂不可用。':'Account service is unavailable.');}},[language]);
  React.useEffect(()=>{
    const target=legacyDestination(location.pathname,location.search,location.hash);
    if(target){location.replace(target);return;}
    void refresh();void request<{providers:Record<string,boolean>}>('/api/auth/providers').then(r=>setProviders(r.providers)).catch(()=>setAuthError('Login service is unavailable.'));
    const update=()=>{if(document.visibilityState==='visible')void refresh();};
    const timer=setInterval(update,30000);window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);
    return()=>{clearInterval(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);};
  },[refresh]);
  const account=location.pathname.startsWith('/account/')||location.pathname==='/login';
  React.useEffect(()=>{if(user&&location.pathname==='/login'&&!authError)location.replace(safeReturnTo(new URLSearchParams(location.search).get('return_to')));},[user,authError]);
  const openModule=async(module:'console'|'library'|'verification'|'layout')=>{
    if(hasSharedDemoAccess(document.cookie)){
      if(module==='library'||module==='layout'){
        try{const response=await fetch(new URL('/api/access',moduleUrl(module)),{credentials:'include',cache:'no-store'});if(response.ok){location.assign(moduleUrl(module));return;}}catch{}
      }else{location.assign(moduleUrl(module));return;}
    }
    setDestination(module);
  };
  return <div className={account?'homeApp':'appShell storyShell'}>
    <header className={account?'accountHeader':'storyTopbar'}><nav className="homePrimaryNav" aria-label="Primary navigation">
      {(['console','library','verification','layout'] as const).map(module=><button key={module} onClick={()=>void openModule(module)}>{module==='console'?'Console':module==='library'?'Library':module==='verification'?'Verification':'Layout'}</button>)}
    </nav><div className="homeAccount"><button aria-label="Change language" onClick={()=>{const next=language==='zh'?'en':'zh';setLanguage(next);localStorage.setItem('omnix.home.language',next);}}>{language==='zh'?'EN':'中文'}</button>{account&&<a href="/">Omnix AI</a>}{user?<><a href="/account/profile" className="accountAvatar" title={user.email}>{user.picture?<img src={user.picture} alt={user.name} referrerPolicy="no-referrer"/>:user.name.slice(0,1)}</a><button disabled={Boolean(authError)} onClick={async()=>{try{await request('/api/account/v1/logout','POST',{});await refresh();}catch(e){setAuthError(e instanceof Error?e.message:'Logout failed');}}}>{language==='zh'?'退出':'Sign out'}</button></>:<a href="/login">{language==='zh'?'登录':'Sign in'}</a>}</div></header>
    {account?<AccountPage user={user} language={language} providers={providers} refresh={refresh} authError={authError}/>:<main className="main storyMain"><InvestorLandingPage language={language}/></main>}
    {!account&&authError&&<div className="homeAuthNotice" role="status">{authError}</div>}
    {destination&&<DemoAccessDialog language={language} onCancel={()=>setDestination(null)} onUnlock={async(password)=>{if(destination==='library'||destination==='layout'){const response=await fetch(new URL('/api/access',moduleUrl(destination)),{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const result=await response.json();if(!response.ok||!result.authenticated)throw new Error(result.error||'Unable to verify access.');}sessionStorage.setItem(DEMO_ACCESS_SESSION_KEY,'true');document.cookie=sharedDemoAccessCookie(location.hostname);location.assign(moduleUrl(destination));}}/>}
  </div>;
}
