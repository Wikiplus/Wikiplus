/**
 * Wikiplus 
 * Eridanus Sora <sora@sound.moe>
 */
import wiki from './services/wiki';
import i18n from './utils/i18n';
import Log from './utils/log';
import Page from './core/page';

$(document).ready(async () => {
    const page = new Page(mw.config.values.wgPageName);
    await page.init();
})
