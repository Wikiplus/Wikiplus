import Wiki from "../services/wiki";
import Log from "../utils/log";

class Page {
    timestamp;
    editToken;
    title;
    revisionId;

    inited = false;
    isNewPage = false;

    sectionCache = {};

    /**
     * @param {params.title} 页面标题 Page Name (optional)
     * @param {params.revisionId} 页面修订编号 Revision Id
     */
    constructor({ title, revisionId }) {
        this.title = title;
        this.revisionId = revisionId;
        this.isNewPage = !revisionId;
    }

    /**
     * 初始化 获得页面EditToken和初始TimeStamp
     * Initialization.
     * @param {string} editToken (optional) 如果提供了editToken，将不会再获取
     */
    async init({ editToken = "" } = {}) {
        const promiseArr = [this.getTimestamp()];
        if (!editToken) {
            promiseArr.push(this.getEditToken());
        }
        await Promise.all(promiseArr);
        this.inited = true;
        Log.info(`Page initialization for ${this.title}#${this.revisionId} finished.`);
    }

    /**
     * 获得 EditToken
     * Get EditToken
     */
    async getEditToken() {
        if (mw.user.tokens.get("csrfToken") && mw.user.tokens.get("csrfToken") !== "+\\") {
            // 如果 MediaWiki JavaScript API 可以直接获得 EditToken 则直接返回
            // Return EditToken retrieved from MediaWiki JavaScript API if accessible
            this.editToken = mw.user.tokens.get("csrfToken");
            return;
        }
        // 从API获得EditToken
        // Get EditToken from MediaWiki API
        this.editToken = await Wiki.getEditToken();
    }

    /**
     * 获得编辑基准时间戳
     * Get Base Timestamp
     */
    async getTimestamp() {
        const { timestamp, revisionId } = await Wiki.getPageInfo({
            revisionId: this.revisionId,
            title: this.title,
        });
        this.timestamp = timestamp;
        if (revisionId) {
            this.revisionId = revisionId;
            this.isNewPage = false;
        }
    }

    /**
     * 获得 WikiText
     * @param {object} config
     * @param {string} config.section
     * @param {string} config.revisionId
     */
    async getWikiText({ section = "" } = {}) {
        const sec = section === -1 ? "" : section;
        if (this.sectionCache[sec]) {
            return this.sectionCache[sec];
        }
        const wikiText = await Wiki.getWikiText({
            section: sec,
            revisionId: this.revisionId,
        });
        Log.info(`Wikitext of ${this.title}#${section} fetched.`);
        this.sectionCache[sec] = wikiText;
        return wikiText;
    }

    /**
     * 解析 WikiText
     * @param {string} wikitext
     */
    async parseWikiText(wikitext) {
        return Wiki.parseWikiText(wikitext, this.title);
    }

    /**
     * 编辑页面
     * @param {*} config
     */
    async edit(payload) {
        if (!this.editToken) {
            Log.error("fail_to_get_edittoken");
            return;
        }
        if (!this.timestamp && !this.isNewPage) {
            // 如果不是创建新页面 又没有基准时间戳 则有可能造成编辑覆盖 保险起见直接拒绝
            Log.error("fail_to_get_timestamp");
            return;
        }
        return Wiki.edit({
            title: this.title,
            editToken: this.editToken,
            ...(this.timestamp ? { timestamp: this.timestamp } : {}),
            ...payload,
            additionalConfig: {
                ...(this.isNewPage ? { createonly: this.isNewPage } : {}),
            },
        });
    }
}

export default Page;
