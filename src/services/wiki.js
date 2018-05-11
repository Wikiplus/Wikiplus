import requests from '../utils/requests';
import Log from '../utils/log';

class Wiki {
    /**
     * 获得当前页面名称
     * Get pagename of current page
     * @returns {Promise<string>}
     */
    static async getCurrentPageName() {
        return window.mw.config.values.wgPageName;
    }
    /**
     * 获得当前用户名
     * Get username of current user
     * @returns {Promise<string>}
     */
    static async getUserName() {
        return window.mw.user.id;
    }
    /**
     * 获得 Edit Token
     * Get Edit Token
     * @returns {Promise<string>}
     */
    static async getEditToken() {
        if (window.mw.user.tokens.get('editToken') && window.mw.user.tokens.get('editToken') !== '+\\') {
            // 如果 MediaWiki JavaScript API 可以直接获得 EditToken 则直接返回
            // Return EditToken retrieved from MediaWiki JavaScript API if possible
            return window.mw.user.tokens.get('editToken');
        }
        // 尝试从 API 获得 EditToken
        // Try to get EditToken from API
        const response = await requests.get({
            'action': 'query',
            'meta': 'tokens',
            'format': 'json'
        });
        if (response.query && response.query.tokens && response.query.tokens.csrftoken && response.query.tokens.csrftoken != "+\\") {
            return response.query.tokens.csrftoken;
        } else {
            return Log.error('fail_to_get_edittoken');
        }
    }
    /**
     * 获得页面上一版本时间戳
     * Get the timestamp of the last revision of page specified.
     * @param {string} title 页面名 / Pagename
     * @returns {Promise<string>}
     */
    static async getTimestamp(title) {
        try {
            const response = await requests.get({
                'action': 'query',
                'prop': 'revisions|info',
                'titles': title,
                'rvprop': 'timestamp',
                'format': 'json'
            });
            if (response.query && response.query.pages) {
                if (Object.keys(response.query.pages)[0] === '-1') {
                    // 不存在这一页面
                    // Page not found.
                    return Log.error('fail_to_get_edittoken');
                }
                return response.query.pages[Object.keys(response.query.pages)[0]].revisions[0].timestamp;
            }
        } catch (e) {
            Log.error('fail_to_get_edittoken');
        }
    }
    /**
     * 获得页面的 Wikitext
     * Get wikitext of the page.
     * @param {string} title title
     * @param {object} config 
     * @param {string} config.revisionId 版本号
     * @param {string} config.section 段落号
     * @return {Promise<string>} wikitext内容
     */
    static async getWikiText(title, config = {
        revisionId: '',
        section: ''
    }) {
        try {
            const response = await (await fetch(`
                ${location.protocol}//${location.host}${window.mw.config.get('wgScriptPath')}/index.php?title=${title}&oldid=${config.revisionId}&section=${config.section}&action=raw
            `)).text();
            return response;
        } catch (e) {
            Log.error('fail_to_get_wikitext');
        }
    }
    /**
     * 解析 Wikitext
     * @param {string} wikitext wikitext
     * @param {string} title 页面标题
     * @param {object} config 设置
     * @return {Promise<string>} 解析结果 HTML
     */
    static async parseWikiText(wikitext, title = '', config = {}) {
        try {
            const response = await requests.post({
                'format': 'json',
                'action': 'parse',
                'text': wikitext,
                'title': title,
                'pst': 'true'
            });
            if (response.parse && response.parse.text) {
                return response.parse.text['*'];
            }
        } catch (e) {
            Log.error('cant_parse_wikitext');
        }
    }
}

export default Wiki;