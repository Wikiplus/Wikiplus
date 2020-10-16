/**
 * Wikiplus 
 * Eridanus Sora <sora@sound.moe>
 */
import i18n from './utils/i18n';
import Log from './utils/log';
import Page from './core/page';
import Wiki from './services/wiki';

$(document).ready(async () => {
    const version = '3.0.0';
    Log.info(`Wikiplus Now Loading. Version: ${version}`);
    if (!window.mw) {
        console.log('页面Javascript载入不完全或这不是一个Mediawiki站点');
        return;
    }
    if (!window.mw.config.get('wgEnableAPI') || !window.mw.config.get('wgEnableWriteAPI')) {
        Log.error('api_unaccessiable');
        return;
    }
    if (!window.mw.config.get('wgUserGroups').includes('autoconfirmed')) {
        Log.error('not_autoconfirmed_user');
        return;
    }
    const page = new Page(mw.config.values.wgPageName);
    await page.init();
})
