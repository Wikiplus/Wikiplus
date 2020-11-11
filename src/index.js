/**
 * Wikiplus
 * Eridanus Sora <sora@sound.moe>
 */
import i18n from "./utils/i18n";
import Log from "./utils/log";
import Page from "./core/page";
import UI from "./core/ui";
import {
    getAction,
    getCurrentPageName,
    getLatestRevisionId,
    getRevisionId,
    getUserGroups,
    isArticle,
} from "./utils/helpers";

$(document).ready(async () => {
    const version = "3.0.0";
    const Pages = {};

    const getPage = async ({ revisionId, title }) => {
        if (Pages[revisionId]) {
            return Pages[revisionId];
        }
        const newPage = new Page({
            revisionId,
            title,
        });
        await newPage.init();
        Pages[revisionId] = newPage;
        return Pages[revisionId];
    };

    Log.info(`Wikiplus now loading. Version: ${version}`);
    if (!window.mw) {
        console.log("页面Javascript载入不完全或这不是一个Mediawiki站点");
        return;
    }
    if (!getUserGroups().includes("autoconfirmed")) {
        Log.error("not_autoconfirmed_user");
        return;
    }

    if (!isArticle() || getAction() !== "view") {
        Log.error(`Not an editable page. Stop initialization.`);
        return;
    }

    // Initialize current page
    window.Pages = Pages;
    const currentPageName = getCurrentPageName();
    const revisionId = getRevisionId();
    const currentPage = await getPage({
        revisionId,
        title: currentPageName,
    });
    const handleQuickEditButtonClicked = async ({
        sectionNumber,
        sectionName,
        targetPageName,
    } = {}) => {
        if (targetPageName !== getCurrentPageName() && getLatestRevisionId() !== getRevisionId()) {
            // 在历史版本编辑其他页面有问题 暂时不支持
            Log.error("cross_page_history_revision_edit_warning");
            return;
        }
        const revisionId =
            targetPageName === getCurrentPageName()
                ? getRevisionId()
                : await getLatestRevisionId(targetPageName);
        const page = await getPage({ revisionId, title: targetPageName });
        console.log(page);
    };

    UI.insertTopQuickEditEntry(handleQuickEditButtonClicked);
    UI.insertSectionQuickEditEntries(handleQuickEditButtonClicked);
});
