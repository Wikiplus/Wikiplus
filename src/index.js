/**
 * Wikiplus
 * Eridanus Sora <sora@sound.moe>
 */
import Page from "./core/page";
import UI from "./core/ui";
import Wiki from "./services/wiki";
import Settings from "./utils/settings";
import Log from "./utils/log";
import Constants from "./utils/constants";
import Notification from "./core/notification";
import i18n from "./utils/i18n";
import wiki from "./services/wiki";

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
    if (!Constants.userGroups.includes("autoconfirmed")) {
        Log.error("not_autoconfirmed_user");
        return;
    }

    if (!Constants.isArticle || Constants.action !== "view") {
        Log.error(`Not an editable page. Stop initialization.`);
        return;
    }

    // Initialize current page
    window.Pages = Pages;
    const currentPageName = Constants.currentPageName;
    const revisionId = Constants.revisionId;
    const currentPage = await getPage({
        revisionId,
        title: currentPageName,
    });
    const handleQuickEditButtonClicked = async ({
        sectionNumber,
        sectionName,
        targetPageName,
    } = {}) => {
        if (
            targetPageName !== currentPageName &&
            Constants.latestRevisionId !== Constants.revisionId
        ) {
            // 在历史版本编辑其他页面有问题 暂时不支持
            Log.error("cross_page_history_revision_edit_warning");
            return;
        }
        const revisionId =
            targetPageName === currentPageName
                ? Constants.revisionId
                : await Wiki.getLatestRevisionIdForPage(targetPageName);
        const page = await getPage({ revisionId, title: targetPageName });
        const customSummary = Settings.getSetting("defaultSummary", {
            sectionName,
            sectionNumber,
            sectionTargetName: targetPageName,
        });
        const summary =
            customSummary ||
            (sectionName
                ? `/* ${sectionName} */ ${i18n.translate("default_summary_suffix")}`
                : i18n.translate("default_summary_suffix"));
        const timer = setTimeout(() => {
            Notification.success(i18n.translate("loading"));
        }, 200);
        const sectionContent = await page.getWikiText({
            section: sectionNumber,
        });
        clearTimeout(timer);
        Notification.empty();
        UI.showQuickEditPanel({
            title: i18n.translate("quickedit_topbtn"),
            content: sectionContent,
            summary,
            onBack: UI.hideQuickEditPanel,
            onParse: (wikiText) => {
                return page.parseWikiText(wikiText);
            },
        });
    };
    UI.loadCSS(`https://wikiplus-app.com/wikiplus.css`);
    UI.insertTopQuickEditEntry(handleQuickEditButtonClicked);
    UI.insertSectionQuickEditEntries(handleQuickEditButtonClicked);
});
