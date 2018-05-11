import Wiki from "../services/wiki";

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

}

export default Page;