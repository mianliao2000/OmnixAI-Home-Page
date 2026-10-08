import { test, expect } from 'playwright/test';

const identity={id:'subject-fixture',accountId:'account-fixture',sessionId:'device-current',name:'Fixture User',email:'person@example.test',provider:'google',picture:'',status:'active',authenticatedAt:Date.now()/1000};
test('profile saves through CSRF-protected account authority',async({page})=>{
  let name=identity.name;
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/auth/providers')return route.fulfill({json:{providers:{google:true}}});
    if(path==='/api/account/v1/profile'){
      expect(route.request().headers()['x-csrf-token']).toBe('device-csrf');name=route.request().postDataJSON().name;
    }
    await route.fulfill({json:{user:{...identity,name},csrfToken:'device-csrf'}});
  });
  await page.goto('/account/profile');await page.getByLabel('Display name').fill('Changed name');
  await page.getByRole('button',{name:'Save changes'}).click();await expect(page.getByRole('status')).toHaveText('Profile saved.');
  await page.reload();await expect(page.getByLabel('Display name')).toHaveValue('Changed name');
});
test('last login cannot be removed and all-device logout uses authority',async({page})=>{
  let signedIn=true;
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/auth/providers')return route.fulfill({json:{providers:{google:true}}});
    if(path==='/api/account/v1/identities')return route.fulfill({json:{identities:[{id:'identity-fixture',provider:'google',email:identity.email}]}});
    if(path==='/api/account/v1/sessions')return route.fulfill({json:{sessions:[{id:'device-current',current:true,device:'Fixture browser',lastSeenAt:Date.now()/1000}]}});
    if(path==='/api/account/v1/logout'){expect(route.request().postDataJSON()).toEqual({allDevices:true});expect(route.request().headers()['x-csrf-token']).toBe('device-csrf');signedIn=false;return route.fulfill({json:{ok:true}});}
    await route.fulfill({json:{user:signedIn?identity:null,csrfToken:'device-csrf'}});
  });
  await page.goto('/account/security');await expect(page.getByRole('button',{name:'Unlink'})).toBeDisabled();
  await page.getByRole('button',{name:'Sign out of every device'}).click();await expect(page.getByRole('link',{name:'Sign in with Google',exact:true})).toBeVisible();
});
test('deletion blockers and backend failure never become deletion success',async({page})=>{
  let blocked=true;
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/account/v1/deletion/preflight')return route.fulfill({json:{blockers:blocked?[{module:'console',message:'Clear owned projects.',url:'https://console.omnixai.biz/projects'}]:[]}});
    if(path==='/api/account/v1/deletion')return route.request().method()==='GET'?route.fulfill({json:{status:'not_started',steps:{}}}):route.fulfill({status:503,json:{error:'account_deletion_incomplete'}});
    if(path==='/api/auth/providers')return route.fulfill({json:{providers:{google:true}}});
    await route.fulfill({json:{user:identity,csrfToken:'device-csrf'}});
  });
  await page.goto('/account/privacy');await page.getByLabel('Type your email to confirm').fill(identity.email);
  await expect(page.getByRole('button',{name:'Delete account',exact:true})).toBeDisabled();blocked=false;
  await page.getByRole('button',{name:'Check again'}).click();await expect(page.getByRole('button',{name:'Delete account',exact:true})).toBeEnabled();
  page.on('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'Delete account',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText('account_deletion_incomplete');await expect(page.getByText(identity.email,{exact:true}).first()).toBeVisible();
});
test('billing outage does not display a fixture or demo balance',async({page})=>{
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path.startsWith('/api/v1/billing/'))return route.fulfill({status:503,json:{error:'billing_unavailable'}});
    if(path==='/api/auth/providers')return route.fulfill({json:{providers:{google:true}}});
    await route.fulfill({json:{user:identity,csrfToken:'device-csrf'}});
  });
  await page.goto('/account/billing?projectId=project-fixture&checkout=success');
  await expect(page.getByRole('alert')).toHaveText('billing_unavailable');await expect(page.getByText('Billing has not loaded.')).toBeVisible();
  await expect(page.getByRole('button',{name:'Manage subscription and payment methods'})).toHaveCount(0);
});

test('unconfigured Stripe keeps purchases and portal disabled',async({page})=>{
  await page.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/auth/providers')return route.fulfill({json:{providers:{google:true}}});
    if(path==='/api/v1/billing/summary')return route.fulfill({json:{
      account:{ownerName:identity.name,ownerType:'user'},membership:{planId:'free',status:'active',canManageBilling:true},
      wallet:{available:0,balance:0,reserved:0},stripe:{configured:false,hasCustomer:false},
      creditPacks:[{id:'small',credits:100,priceUsd:1}],plans:[{id:'pro',scope:'user',monthlyUsd:10,annualUsd:100}]
    }});
    if(path==='/api/v1/billing/invoices')return route.fulfill({json:{invoices:[]}});
    if(path==='/api/v1/billing/ledger')return route.fulfill({json:{entries:[]}});
    if(path==='/api/v1/billing/checkout'||path==='/api/v1/billing/portal')throw new Error('Unconfigured payments must never be submitted');
    return route.fulfill({json:{user:identity,csrfToken:'device-csrf'}});
  });
  await page.goto('/account/billing');
  await expect(page.getByText('Payments are not configured. No purchase can be made.')).toBeVisible();
  for(const button of await page.locator('.accountPage button').all())await expect(button).toBeDisabled();
});
