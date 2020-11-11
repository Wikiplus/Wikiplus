export function getCurrentPageName() {
    return mw.config.values.wgPageName;
}

export function getRevisionId() {
    return mw.config.get("wgRevisionId");
}

export function getLatestRevisionId() {
    return window.mw.config.get("wgCurRevisionId");
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
