class Constants {
    get currentPageName() {
        return window.mw.config.get("wgPageName").replace(/ /g, "_");
    }
    get articleId() {
        return window.mw.config.get("wgArticleId");
    }
    get articlePath() {
        return window.mw.config.get("wgArticlePath");
    }
    get revisionId() {
        return window.mw.config.get("wgRevisionId");
    }
    get latestRevisionId() {
        return window.mw.config.get("wgCurRevisionId");
    }
    get userGroups() {
        return window.mw.config.get("wgUserGroups");
    }
    get scriptPath() {
        return window.mw.config.get("wgScriptPath");
    }
    get isArticle() {
        return window.mw.config.get("wgIsArticle");
    }
    get action() {
        return window.mw.config.get("wgAction");
    }
    get wikiId() {
        return window.mw.config.get("wgWikiID");
    }
    get skin() {
        return window.mw.config.get('skin');
    }
}

export default new Constants();
