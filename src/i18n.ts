export type UiLanguage = 'en' | 'zh';
export function uiText(language:UiLanguage,en:string,zh:string){return language==='zh'?zh:en;}
