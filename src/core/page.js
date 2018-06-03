import Wiki from "../services/wiki";
import Log from "../utils/log";

class Page {
    timestamp;
    editToken;
    title;
    revisionId;
    constructor(title, revisionId = undefined) {
        this.title = title;
        this.revisionId = revisionId;
    }
    /**
     * 初始化
     * @param {string} editToken 
     */
    async init(editToken = '', {
        isEmptyPage = false 
    } = {}) {
        Log.debug(`Start initiating instance for page ${this.title}`);
        if (editToken || isEmptyPage) {
            this.timestamp = await Wiki.getTimestamp(this.title);
        } else {
            [this.timestamp, this.editToken] = await Promise.all([this.getTimestamp(), Wiki.getEditToken()]);
        }
        return this;
    }
    /**
     * 获得上一版本时间戳
     */
    async getTimestamp() {
        return Wiki.getTimestamp(this.title);
    }
    /**
     * 获得 WikiText
     * @param {object} config 
     * @param {string} config.section
     * @param {string} config.revisionId
     */
    async getWikiText({
        section = '',
        revisionId = ''
    } = {}) {
        return Wiki.getWikiText(this.title, {
            section,
            revisionId
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
            timestamp: this.timestamp
        });
    }

}

export default Page;