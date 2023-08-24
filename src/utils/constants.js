class Constants {
    version = "4.0.12";
    get isArticle() {
        return window.mw.config.get("wgIsArticle");
    }
    get currentPageName() {
        return window.mw.config.get("wgPageName").replace(/ /g, "_");
    }
    get articleId() {
        return window.mw.config.get("wgArticleId");
    }
    get revisionId() {
        return window.mw.config.get("wgRevisionId");
    }
    get latestRevisionId() {
        return window.mw.config.get("wgCurRevisionId");
    }
    get articlePath() {
        return window.mw.config.get("wgArticlePath");
    }
    get scriptPath() {
        return window.mw.config.get("wgScriptPath");
    }
    get action() {
        return window.mw.config.get("wgAction");
    }
    get skin() {
        return window.mw.config.get("skin");
    }
    get userGroups() {
        return window.mw.config.get("wgUserGroups");
    }
    get wikiId() {
        return window.mw.config.get("wgWikiID");
    }
}

export default new Constants();
