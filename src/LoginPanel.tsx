import { OrbitalBrandLogo } from './Brand';
import { loginUrl } from './platform';
import { uiText, type UiLanguage } from './i18n';

function ProviderIcon({ provider }: { provider: 'google' | 'github' }) {
  return provider === 'google' ? <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285f4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/>
    <path fill="#34a853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.06.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/>
    <path fill="#fbbc05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.35-2.59Z"/>
    <path fill="#ea4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.35 2.59C7.2 7.72 9.4 5.96 12 5.96Z"/>
  </svg> : <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.5 21.63c.55.1.76-.24.76-.54v-2.07c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.61 1.22 3.25.93.1-.72.4-1.22.71-1.5-2.48-.28-5.08-1.24-5.08-5.51 0-1.22.44-2.22 1.15-3-.11-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.43 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3.01 0 4.28-2.6 5.22-5.09 5.5.4.35.76 1.02.76 2.06v3.05c0 .3.2.65.76.54A11.1 11.1 0 0 0 12 .9Z"/></svg>;
}

export function LoginPanel({ language, providers, returnTo, authError }: {
  language: UiLanguage;
  providers: Record<string, boolean>;
  returnTo: string;
  authError: string;
}) {
  const t = (en: string, zh: string) => uiText(language, en, zh);
  return <main className="loginPage">
    <section className="loginCard" aria-labelledby="login-title">
      <OrbitalBrandLogo iconOnly surface="light"/>
      <h1 id="login-title">Omnix AI</h1>
      <p className="loginSubtitle">{t('Sign in to continue','使用你的账号登录以继续')}</p>
      <div className="loginProviders">
        {(['google', 'github'] as const).map(provider => {
          const label = provider === 'google' ? 'Google' : 'GitHub';
          const content = <><ProviderIcon provider={provider}/><span>{t(`Sign in with ${label}`,`使用 ${label} 登录`)}</span></>;
          return providers[provider]
            ? <a className="loginProvider" key={provider} href={loginUrl(provider, returnTo)}>{content}</a>
            : <button className="loginProvider" key={provider} disabled>{content}</button>;
        })}
      </div>
      {authError && <p className="loginNotice" role="status">{authError}</p>}
      {!authError && !Object.values(providers).some(Boolean) && <p className="loginNotice" role="status">{t('Login providers are unavailable. Please try again later.','登录服务暂不可用，请稍后重试。')}</p>}
      <a className="loginBack" href="/">{t('Back to home','返回首页')}</a>
    </section>
  </main>;
}
