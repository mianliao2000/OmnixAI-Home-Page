import { describe,it,expect } from 'vitest';
import { legacyDestination,safeReturnTo,loginUrl } from './platform';
import { sharedDemoAccessCookie } from './demoAccess';
describe('independent platform contract',()=>{
  it('keeps module routes and their queries and fragments',()=>{
    expect(legacyDestination('/projects/abc','?tab=pcb','#U1')).toBe('https://console.omnixai.biz/projects/abc?tab=pcb#U1');
    expect(legacyDestination('/','?source=legacy','#/eda?board=axis-a')).toBe('https://console.omnixai.biz/eda?board=axis-a');
    expect(legacyDestination('/settings/billing','?projectId=abc&checkout=success','')).toBe('/account/billing?projectId=abc&checkout=success');
    expect(legacyDestination('/billing/','?projectId=abc','#receipt')).toBe('/account/billing?projectId=abc#receipt');
    expect(legacyDestination('/','','#/settings/billing/invoices?projectId=abc#receipt')).toBe('/account/billing?projectId=abc#receipt');
    expect(legacyDestination('/','','#requirements')).toBe(null);
  });
  it('rejects external, HTTP, credential and lookalike return targets',()=>{
    for(const target of ['https://evil.test','http://omnixai.biz','https://omnixai.biz.evil.test','https://user:pass@omnixai.biz'])expect(safeReturnTo(target)).toBe('https://omnixai.biz/');
    expect(safeReturnTo('https://verification.omnixai.biz/?mode=review#report')).toBe('https://verification.omnixai.biz/?mode=review#report');
  });
  it('uses the existing Library OAuth authority and shared demo cookie',()=>{
    expect(loginUrl('google','https://omnixai.biz/account/security')).toContain('https://library.omnixai.biz/api/auth/google/start?');
    expect(sharedDemoAccessCookie('omnixai.biz')).toContain('Domain=.omnixai.biz; Secure');
    expect(sharedDemoAccessCookie('127.0.0.1')).not.toContain('Domain=');
  });
});
