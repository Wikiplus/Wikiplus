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
    const isNewPage = $(".noarticletext").length > 0 && Constants.articleId === 0;

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
        Log.info("not_autoconfirmed_user");
        return;
    }

    if (!Constants.isArticle || Constants.action !== "view") {
        Log.info(`Not an editable page. Stop initialization.`);
        return;
    }

    // Initialize current page
    window.Pages = Pages;
    window.Constants = Constants;
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
        const isEditHistoryRevision =
            targetPageName === currentPageName &&
            Constants.latestRevisionId !== Constants.revisionId;
        clearTimeout(timer);
        Notification.empty();

        if (isEditHistoryRevision) {
            Notification.warning(i18n.translate("history_edit_warning"));
        }
        UI.showQuickEditPanel({
            title: `${i18n.translate("quickedit_topbtn")}${
                isEditHistoryRevision ? i18n.translate("history_edit_warning") : ""
            }`,
            content: isNewPage ? i18n.translate("create_page_tip") : sectionContent,
            summary,
            onBack: UI.hideQuickEditPanel,
            onParse: (wikiText) => {
                return page.parseWikiText(wikiText);
            },
            onEdit: async ({ content, summary, isMinorEdit }) => {
                const editPayload = {
                    content,
                    config: {
                        summary,
                        ...(sectionNumber !== -1 ? { section: sectionNumber } : {}),
                    },
                };
                if (isMinorEdit) {
                    editPayload.config.minor = "true";
                } else {
                    editPayload.config.notminor = "true";
                }
                await page.edit(editPayload);
            },
        });
    };
    UI.loadCSS(`https://wikiplus-app.com/wikiplus.css`);
    UI.insertTopQuickEditEntry(handleQuickEditButtonClicked);
    UI.insertSectionQuickEditEntries(handleQuickEditButtonClicked);
    UI.insertLinkEditEntries(handleQuickEditButtonClicked);
});
