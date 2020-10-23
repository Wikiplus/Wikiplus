/**
 * Wikiplus
 * Eridanus Sora <sora@sound.moe>
 */
import i18n from "./utils/i18n";
import Log from "./utils/log";
import Page from "./core/page";
import { getCurrentPageName, getCurrentRevisionId, getUserGroups } from "./utils/helpers";

$(document).ready(async () => {
    const version = "3.0.0";
    const Pages = {};

    const getPage = async ({ revisionId, title }) => {
        if (Pages[revisionId]) {
            return Pages[revisionId];
        }
        const newPage = new Page({
            revisionId,
            title
        });
        await newPage.init();
        Pages[revisionId] = newPage;
        return Pages[revisionId];
    };

    Log.info(`Wikiplus Now Loading. Version: ${version}`);
    if (!window.mw) {
        console.log("页面Javascript载入不完全或这不是一个Mediawiki站点");
        return;
    }
    if (!getUserGroups().includes("autoconfirmed")) {
        Log.error("not_autoconfirmed_user");
        return;
    }
    // // Init current page
    const currentPageName = getCurrentPageName();
    const currentRevisionId = getCurrentRevisionId();
    const currentPage = await getPage({ revisionId: currentRevisionId, title: currentPageName });
    console.log(currentPage);
});
