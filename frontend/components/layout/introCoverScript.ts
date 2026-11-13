export const INTRO_SESSION_KEY = 'bp_intro_seen';

/**
 * Inline <head> script: runs before first paint and decides whether the intro cover shows,
 * so returning visitors never see a flash. Sets html[data-intro="on"] and html[data-intro-lang].
 * Skips /track (it immediately redirects to /#/track, where the cover then shows).
 */
export function introCoverScript(): string {
  return `(function(){try{var d=document.documentElement;if(location.pathname.indexOf('/track')===0)return;if(sessionStorage.getItem('${INTRO_SESSION_KEY}')==='1')return;var l=localStorage.getItem('bun_patty_lang_preference')||localStorage.getItem('peach_patty_lang_preference');d.setAttribute('data-intro-lang',l==='en'?'en':'ka');d.setAttribute('data-intro','on');}catch(e){}})();`;
}
