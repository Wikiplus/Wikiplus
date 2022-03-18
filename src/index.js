/**
 * Wikiplus
 * Eridanus Sora <sora@sound.moe>
 */
import Page from "./core/page";
import UI from "./core/ui";
import Notification from "./core/notification";
import Wiki from "./services/wiki";
import Settings from "./utils/settings";
import Log from "./utils/log";
import Constants from "./utils/constants";
import i18n from "./utils/i18n";
import "./wikiplus.css";

$(async () => {
    const Pages = {};
    const isNewPage = $(".noarticletext").length > 0 && Constants.articleId === 0;

    /**
     * Get page instance.
     * @param {*} params
     * @param {number} params.revisionId 页面修订版本号
     * @param {string} params.title 页面标题
     */
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

    Log.info(`Wikiplus now loading. Version: ${Constants.version}`);

    if (!window.mw) {
        console.log("Mediawiki JavaScript not loaded or not a Mediawiki website.");
        return;
    }
    if (!Constants.userGroups.includes("autoconfirmed")) {
        Notification.error(i18n.translate("not_autoconfirmed_user"));
        Log.info(i18n.translate("not_autoconfirmed_user"));
        return;
    }

    if (!Constants.isArticle || Constants.action !== "view") {
        Log.info(`Not an editable page. Stop initialization.`);
        return;
    }

    // Initialize current page 默认初始化当前页面
    window._WikiplusPages = Pages;
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
            customSummary ??
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
        const escToExit =
            Settings.getSetting("esc_to_exit_quickedit") === true || // 兼容老设置key
            Settings.getSetting("esc_to_exit_quickedit") === "true" ||
            Settings.getSetting("escToExitQuickEdit") === true ||
            Settings.getSetting("escToExitQuickEdit") === "true";
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
            escExit: escToExit,
        });
    };

    const handleSimpleRedirectButtonClicked = async () => {
        UI.showSimpleRedirectPanel({
            onEdit: async ({ title, forceOverwrite = false }) => {
                const page = await getPage({ title });
                const currentPageName = Constants.currentPageName;
                const payload = {
                    content: `#REDIRECT [[${currentPageName}]]`,
                    config: {
                        summary: i18n.translate("redirect_from_summary", [title, currentPageName]),
                    },
                };
                if (!forceOverwrite) {
                    payload.config.createonly = "true";
                }
                await page.edit(payload);
            },
            onSuccess: ({ title }) => {
                location.href = Constants.articlePath.replace(/\$1/gi, title);
            },
        });
    };

    const handleSettingsButtonClicked = async () => {
        UI.showSettingsPanel({
            onSubmit: ({ settings }) => {
                JSON.parse(settings);
                localStorage.setItem("Wikiplus_Settings", settings);
            },
        });
    };

    const handlePreload = async ({ sectionNumber }) => {
        await currentPage.getWikiText({
            section: sectionNumber,
        });
    };

    UI.insertTopQuickEditEntry(handleQuickEditButtonClicked);
    UI.insertSectionQuickEditEntries(handleQuickEditButtonClicked);
    UI.insertLinkEditEntries(handleQuickEditButtonClicked);
    UI.insertSimpleRedirectButton(handleSimpleRedirectButtonClicked);
    UI.insertSettingsPanelButton(handleSettingsButtonClicked);
    UI.bindPreloadEvents(handlePreload);
});
