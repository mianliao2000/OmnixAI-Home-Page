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
  const geometry=await page.locator('.landingHeroMedia').evaluate(el=>({position:getComputedStyle(el).backgroundPosition,origin:getComputedStyle(el).transformOrigin,scrollWidth:document.documentElement.scrollWidth,width:innerWidth,top:el.getBoundingClientRect().top}));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width);
  if(info.project.name==='mobile'){expect(geometry.position).toContain('0%');expect(geometry.top).toBeGreaterThanOrEqual(64);}
  await page.getByRole('button',{name:'Library',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button',{name:'Cancel'}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({path:`test-results/home-${info.project.name}.png`,fullPage:false});
});
test('account routes require login and preserve OAuth return target',async({page})=>{
  await page.goto('/account/security');const link=page.getByRole('link',{name:/Sign in with google/i});await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href',/library\.omnixai\.biz\/api\/auth\/google\/start/);
});
