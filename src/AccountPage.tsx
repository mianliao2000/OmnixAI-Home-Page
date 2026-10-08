import React from 'react';
import { request,prepareBilling,type AccountUser,type AccountSession,type Identity,type Blocker } from './api';
import { destinations,loginUrl,safeReturnTo } from './platform';
import { uiText,type UiLanguage } from './i18n';

type Props={user:AccountUser|null;language:UiLanguage;providers:Record<string,boolean>;refresh:()=>Promise<void>;authError:string};
type Billing={account:{ownerName:string;ownerType:string};membership:{planId:string;status:string;canManageBilling:boolean};wallet:{balance:number;available:number;reserved:number};stripe:{configured:boolean;hasCustomer:boolean};creditPacks:{id:string;priceUsd:number;credits:number}[];plans:{id:string;monthlyUsd:number;annualUsd:number;scope:string}[]};
type Invoice={id:string;number?:string;status:string;total:number;currency:string;hostedInvoiceUrl?:string;invoicePdf?:string};

export function AccountPage({user,language,providers,refresh,authError}:Props){
  const section=window.location.pathname.split('/')[2]||'profile';
  const t=(en:string,zh:string)=>uiText(language,en,zh);
  const [name,setName]=React.useState(user?.name||'');
  const [identities,setIdentities]=React.useState<Identity[]>([]);
  const [sessions,setSessions]=React.useState<AccountSession[]>([]);
  const [blockers,setBlockers]=React.useState<Blocker[]|null>(null);
  const [deletion,setDeletion]=React.useState<{status:string;steps:Record<string,string>}>({status:'not_started',steps:{}});
  const [billing,setBilling]=React.useState<Billing|null>(null);
  const [invoices,setInvoices]=React.useState<Invoice[]>([]);
  const [ledger,setLedger]=React.useState<{id:string;type:string;deltaCredits:number;createdAt:string}[]>([]);
  const [error,setError]=React.useState(''),[message,setMessage]=React.useState(''),[busy,setBusy]=React.useState(false);
  const [confirmation,setConfirmation]=React.useState('');
  const projectId=new URLSearchParams(window.location.search).get('projectId')||undefined;
  const loginReturn=window.location.pathname==='/login'?safeReturnTo(new URLSearchParams(window.location.search).get('return_to')):window.location.href;
  const query=projectId?'?'+new URLSearchParams({projectId}):'';
  const action=async(fn:()=>Promise<void>)=>{setBusy(true);setError('');setMessage('');try{await fn();}catch(e){setError(e instanceof Error?e.message:'Request failed');}finally{setBusy(false);}};
  const load=React.useCallback(async()=>{
    if(!user)return;
    if(section==='security'){
      const [a,b]=await Promise.all([request<{identities:Identity[]}>('/api/account/v1/identities'),request<{sessions:AccountSession[]}>('/api/account/v1/sessions')]);setIdentities(a.identities);setSessions(b.sessions);
    }else if(section==='privacy'){
      const result=await request<{blockers:Blocker[]}>('/api/account/v1/deletion/preflight');setBlockers(result.blockers);
      const status=await request<{status:string;steps:Record<string,string>}>('/api/account/v1/deletion');setDeletion({...status,steps:status.steps||{}});
    }else if(section==='billing'){
      await prepareBilling();
      const [summary,rows,events]=await Promise.all([request<Billing>('/api/v1/billing/summary'+query),request<{invoices:Invoice[]}>('/api/v1/billing/invoices'+query),request<{entries:typeof ledger}>('/api/v1/billing/ledger'+query)]);
      setBilling(summary);setInvoices(rows.invoices);setLedger(events.entries);
    }
  },[user?.accountId,section,query]);
  React.useEffect(()=>{setName(user?.name||'');void load().catch(e=>setError(e.message));},[load,user?.name]);
  if(!user)return <main className="accountPage"><h1>{t('Your Omnix account','你的 Omnix 账号')}</h1><p>{authError||t('Sign in to manage your profile, devices and billing.','登录后管理资料、设备和账单。')}</p>{Object.entries(providers).filter(([,on])=>on).map(([provider])=><a className="accountButton" key={provider} href={loginUrl(provider,loginReturn)}>{t('Sign in with','登录方式：')} {provider}</a>)}{!Object.values(providers).some(Boolean)&&<p>{t('Login providers are unavailable. Please try again later.','登录服务暂不可用，请稍后重试。')}</p>}</main>;
  const recent=Date.now()/1000-user.authenticatedAt<600;
  return <div className="accountShell"><nav className="accountNav" aria-label="Account settings">
    {['profile','security','billing','privacy'].map(item=><a key={item} aria-current={section===item?'page':undefined} href={'/account/'+item}>{t(item[0].toUpperCase()+item.slice(1),({profile:'个人资料',security:'登录与设备',billing:'账单',privacy:'数据与账号'} as Record<string,string>)[item])}</a>)}
    <a href={destinations.console}>{t('Open Console','打开 Console')}</a>
  </nav><main className="accountPage"><h1>{t('Account settings','账号设置')}</h1><p>{user.email}</p>
    {(error||authError)&&<p role="alert" className="accountError">{error||authError}</p>}{message&&<p role="status">{message}</p>}
    {section==='privacy'&&deletion.status!=='not_started'&&<p role="status">{t('Deletion status','删除处理状态')}: {deletion.status}. {Object.entries(deletion.steps).map(([module,status])=>`${module}: ${status}`).join(' · ')}</p>}
    {section==='profile'&&<form onSubmit={e=>{e.preventDefault();void action(async()=>{await request('/api/account/v1/profile','PATCH',{name});await refresh();setMessage(t('Profile saved.','资料已保存。'));});}}><label>{t('Display name','显示名称')}<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)} /></label><label>Email<input readOnly value={user.email}/></label><p>{t('Your verified email and avatar come from your login provider.','邮箱和头像由登录服务提供。')}</p><button disabled={busy||Boolean(authError)}>{t('Save changes','保存修改')}</button></form>}
    {section==='security'&&<><h2>{t('Login methods','登录方式')}</h2>{!recent&&<p>{t('Sign in again before linking or unlinking a login method.','绑定或解绑登录方式前，请重新登录。')} <a href={loginUrl(user.loginProvider||user.provider)}>{t('Sign in again','重新登录')}</a></p>}
      {identities.map(identity=><div className="accountRow" key={identity.id}><span>{identity.provider} · {identity.email}</span><button disabled={busy||!recent||identities.length<2} onClick={()=>void action(async()=>{await request('/api/account/v1/identities/'+identity.id,'DELETE');await load();})}>{t('Unlink','解绑')}</button></div>)}
      {Object.entries(providers).filter(([,enabled])=>enabled).map(([provider])=><button key={provider} disabled={busy||!recent} onClick={()=>void action(async()=>{const result=await request<{url:string}>('/api/account/v1/identities/link','POST',{provider});window.location.assign(safeReturnTo(result.url));})}>{t('Link','绑定')} {provider}</button>)}
      <h2>{t('Active devices','登录设备')}</h2>{sessions.map(session=><div className="accountRow" key={session.id}><span>{session.device||t('Unknown browser','未知浏览器')} {session.current?t('(this device)','（当前设备）'):''}<small>{new Date(session.lastSeenAt*1000).toLocaleString()}</small></span><button disabled={busy} onClick={()=>void action(async()=>{await request('/api/account/v1/sessions/'+session.id,'DELETE');await refresh();await load();})}>{t('Sign out','退出')}</button></div>)}
      <button disabled={busy} onClick={()=>void action(async()=>{await request('/api/account/v1/logout','POST',{allDevices:true});await refresh();})}>{t('Sign out of every device','退出全部设备')}</button></>}
    {section==='billing'&&<><p>{t('Billing covers the existing Console services. Library and Verification usage is not yet consolidated into this ledger.','账单对应现有 Console 服务；Library 和 Verification 用量尚未统一计入此账本。')}</p>{!billing?<p>{t('Billing has not loaded.','账单尚未加载。')}</p>:<>
      <h2>{billing.account.ownerName} · {billing.membership.planId}</h2><p>{t('Subscription status','订阅状态')}: {billing.membership.status}</p><p>{t('Credits: available / total / reserved','积分：可用 / 总额 / 预留')}: {billing.wallet.available} / {billing.wallet.balance} / {billing.wallet.reserved}</p>
      <button disabled={busy||!billing.stripe.configured||!billing.stripe.hasCustomer||!billing.membership.canManageBilling} onClick={()=>void action(async()=>{const result=await request<{url:string}>('/api/v1/billing/portal','POST',{projectId});window.location.assign(result.url);})}>{t('Manage subscription and payment methods','管理订阅与付款方式')}</button>
      {!billing.stripe.configured&&<p>{t('Payments are not configured. No purchase can be made.','付款服务尚未配置，暂不能购买。')}</p>}
      <h2>{t('Credit packs','积分包')}</h2>{billing.creditPacks.map(pack=><button disabled={busy||!billing.stripe.configured||!billing.membership.canManageBilling} key={pack.id} onClick={()=>{if(window.confirm(`${pack.credits} credits · $${pack.priceUsd}?`))void action(async()=>{const result=await request<{url:string}>('/api/v1/billing/checkout','POST',{kind:'credits',sku:pack.id,projectId},{'Idempotency-Key':crypto.randomUUID()});window.location.assign(result.url);});}}>{pack.credits} · ${pack.priceUsd}</button>)}
      <h2>{t('Membership','会员订阅')}</h2>{billing.plans.filter(plan=>plan.scope===billing.account.ownerType).map(plan=><div className="accountRow" key={plan.id}><strong>{plan.id}</strong>{(['monthly','annual'] as const).map(period=><button key={period} disabled={busy||!billing.stripe.configured||!billing.membership.canManageBilling} onClick={()=>{const amount=period==='monthly'?plan.monthlyUsd:plan.annualUsd;if(window.confirm(`${plan.id} · ${period} · $${amount}?`))void action(async()=>{const result=await request<{url:string}>('/api/v1/billing/checkout','POST',{kind:'membership',sku:plan.id,period,projectId},{'Idempotency-Key':crypto.randomUUID()});window.location.assign(result.url);});}}>{period} · ${period==='monthly'?plan.monthlyUsd:plan.annualUsd}</button>)}</div>)}
      <h2>{t('Invoices','发票')}</h2>{invoices.length?invoices.map(invoice=><div className="accountRow" key={invoice.id}><span>{invoice.number||invoice.id} · {invoice.status} · {new Intl.NumberFormat(undefined,{style:'currency',currency:invoice.currency}).format(invoice.total/100)}</span>{invoice.hostedInvoiceUrl&&<a target="_blank" rel="noopener noreferrer" href={invoice.hostedInvoiceUrl}>{t('View invoice','查看发票')}</a>}</div>):<p>{t('No invoices.','暂无发票。')}</p>}
      <h2>{t('Credit ledger','积分记录')}</h2>{ledger.map(entry=><div className="accountRow" key={entry.id}><span>{new Date(entry.createdAt).toLocaleString()} · {entry.type}</span><span>{entry.deltaCredits}</span></div>)}
    </>}</>}
    {section==='privacy'&&<><h2>{t('Your data','你的数据')}</h2><p>{t('Manage and export engineering data in Console and generated files in Library. Verification history without account ownership is not deleted with this account.','工程数据在 Console 管理和导出，生成文件在 Library 管理。没有账号归属的 Verification 历史不会随账号删除。')}</p><a href={destinations.console.replace('/console','/settings/project-data')}>{t('Console data','Console 数据')}</a> · <a href={destinations.library}>{t('Library history','Library 历史')}</a>
      <h2>{t('Delete account','删除账号')}</h2><p>{t('Clear the following items first. Account deletion does not automatically delete projects or cancel subscriptions.','请先处理以下项目。删除账号不会自动清空工程或取消订阅。')}</p>{blockers===null?<p>{t('Deletion checks have not completed.','删除条件检查尚未完成。')}</p>:blockers.length?blockers.map((blocker,i)=><p key={i}><a href={safeReturnTo(blocker.url)}>{blocker.module}</a>: {blocker.message}</p>):<p>{t('No blocking items found.','未发现阻塞项。')}</p>}
      {!recent&&<a href={loginUrl(user.loginProvider||user.provider)}>{t('Sign in again to confirm your identity','重新登录以确认身份')}</a>}
      <form onSubmit={e=>{e.preventDefault();if(window.confirm(t('Permanently delete your account?','确定永久删除账号？')))void action(async()=>{const result=await request<{status:string}>('/api/account/v1/deletion','POST',{confirmation});if(result.status!=='complete')throw new Error('Deletion is incomplete');await refresh();});}}><label>{t('Type your email to confirm','输入邮箱确认')}<input value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label><button disabled={busy||!recent||blockers===null||blockers.length>0||confirmation!==user.email||Boolean(authError)}>{t('Delete account','删除账号')}</button></form>
      <button disabled={busy} onClick={()=>void action(load)}>{t('Check again','重新检查')}</button></>}
  </main></div>;
}
