export function getCurrentPageName() {
    return mw.config.values.wgPageName;
}

export function getCurrentRevisionId() {
    return mw.config.values.wgRevisionId;
}

export function getUserGroups() {
    return window.mw.config.get("wgUserGroups");
}

export function getScriptPath() {
    return window.mw.config.get("wgScriptPath");
}

export function isArticle() {
    return mw.config.get("wgIsArticle");
}

export function getAction() {
    return mw.config.get("wgAction");
}
