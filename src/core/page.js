import Wiki from "../services/wiki";
import Log from "../utils/log";

class Page {
    timestamp;
    editToken;
    title;
    revisionId;

    /**
     * @param {params.title} 页面标题 Page Name (optional)
     * @param {params.revisionId} 页面修订编号 Revision Id
     */
    constructor({ title, revisionId }) {
        if (!title || !revisionId) {
            return Log.error(`Fail to initialize page instance: Missing page name or revision id.`)
        }
        this.title = title;
        this.revisionId = revisionId;
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
        this.timestamp = await Wiki.getTimestamp({
            revisionId: this.revisionId,
        });
    }

    /**
     * 获得 WikiText
     * @param {object} config
     * @param {string} config.section
     * @param {string} config.revisionId
     */
    async getWikiText({ section = "" } = {}) {
        return Wiki.getWikiText({
            section,
            revisionId: this.revisionId
        });
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
    async edit(config) {
        return Wiki.edit({
            ...config,
            title: this.title,
            editToken: this.editToken,
            timestamp: this.timestamp,
        });
    }
}

export default Page;
