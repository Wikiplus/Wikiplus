class Constants {
    get currentPageName() {
        return window.mw.config.get("wgPageName").replace(/ /g, "_");
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
}

export default new Constants();
