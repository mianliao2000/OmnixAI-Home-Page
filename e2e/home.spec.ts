import { test,expect } from 'playwright/test';
test.beforeEach(async({page})=>{
  await page.route('**/api/**',async route=>{
    const url=new URL(route.request().url());
    const payload=url.pathname==='/api/auth/providers'?{providers:{google:true,github:false,linkedin:false}}:{user:null};
    await route.fulfill({json:payload});
  });
});
test('homepage preserves hero, mobile image top and module password navigation',async({page},info)=>{
  await page.goto('/');await expect(page.getByRole('heading',{name:/Redefine Hardware Design/})).toBeVisible();
  await expect(page.getByRole('button',{name:/run demo/i})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Change language'})).toHaveCount(0);
  const geometry=await page.locator('.landingHeroMedia').evaluate(el=>({position:getComputedStyle(el).backgroundPosition,origin:getComputedStyle(el).transformOrigin,scrollWidth:document.documentElement.scrollWidth,width:innerWidth,top:el.getBoundingClientRect().top}));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width);
  if(info.project.name==='mobile'){expect(geometry.position).toContain('0%');expect(geometry.top).toBeGreaterThanOrEqual(64);}
  await page.getByRole('button',{name:'Library',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Cancel'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({path:`test-results/home-${info.project.name}.png`,fullPage:false});
});
test('login card keeps Google and GitHub OAuth and guest access separate',async({page},info)=>{
  await page.route('**/api/auth/providers',route=>route.fulfill({json:{providers:{google:true,github:true}}}));
  await page.goto('/login?return_to=https%3A%2F%2Fverification.omnixai.biz%2F');
  await expect(page.getByRole('heading',{name:'Omnix AI',exact:true})).toBeVisible();
  for(const [provider,label] of [['google','Google'],['github','GitHub']]){
    const link=page.getByRole('link',{name:`Sign in with ${label}`,exact:true});
    await expect(link).toBeVisible();
    const url=new URL((await link.getAttribute('href'))!);
    expect(url.pathname).toBe(`/api/auth/${provider}/start`);
    expect(url.searchParams.get('return_to')).toBe('https://verification.omnixai.biz/');
  }
  await page.screenshot({path:`test-results/login-${info.project.name}.png`,fullPage:false});
  await page.getByRole('button',{name:'Try as a guest'}).click();
  await expect(page.getByRole('dialog',{name:'Enter Access Password'})).toBeVisible();
});
test('account routes require login and preserve OAuth return target',async({page})=>{
  await page.goto('/account/security');const link=page.getByRole('link',{name:/Sign in with google/i});await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href',/library\.omnixai\.biz\/api\/auth\/google\/start/);
});
