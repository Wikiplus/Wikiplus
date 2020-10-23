import requests from "../utils/requests";
import Log from "../utils/log";
import i18n from "../utils/i18n";
import { getScriptPath } from "../utils/helpers";

class Wiki {
    /**
     * 获得 Edit Token
     * Get Edit Token
     * @returns {Promise<string>}
     */
    static async getEditToken() {
        // 尝试从 API 获得 EditToken
        // Try to get EditToken from API
        const response = await requests.get({
            action: "query",
            meta: "tokens",
            format: "json",
        });
        if (
            response.query &&
            response.query.tokens &&
            response.query.tokens.csrftoken &&
            response.query.tokens.csrftoken != "+\\"
        ) {
            return response.query.tokens.csrftoken;
        } else {
            return Log.error("fail_to_get_edittoken");
        }
    }
    /**
     * 获得页面上一版本时间戳
     * Get the timestamp of the last revision of page specified.
     * @param {params.string} title 页面名 / Pagename
     * @param {params.revisionId} revisionId 修订版本号 / Revision ID
     * @returns {Promise<string>}
     */
    static async getTimestamp({ title, revisionId }) {
        try {
            const params = {
                action: "query",
                prop: "revisions|info",
                rvprop: "timestamp",
                format: "json",
            };
            if (title) {
                params.titles = title;
            }
            if (revisionId) {
                params.revids = revisionId;
            }
            const response = await requests.get(params);
            if (response.query && response.query.pages) {
                if (Object.keys(response.query.pages)[0] === "-1") {
                    // 不存在这一页面
                    // Page not found.
                    return Log.error("fail_to_get_edittoken");
                }
                return response.query.pages[Object.keys(response.query.pages)[0]].revisions[0]
                    .timestamp;
            }
        } catch (e) {
            Log.error("fail_to_get_edittoken");
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
    static async getWikiText({ section, revisionId }) {
        try {
            const response = await (
                await fetch(`
                ${location.protocol}//${
                    location.host
                }${getScriptPath()}/index.php?oldid=${revisionId}&section=${section}&action=raw
            `)
            ).text();
            return response;
        } catch (e) {
            Log.error("fail_to_get_wikitext");
        }
    }
    /**
     * 解析 Wikitext
     * @param {string} wikitext wikitext
     * @param {string} title 页面标题
     * @param {object} config 设置
     * @return {Promise<string>} 解析结果 HTML
     */
    static async parseWikiText(wikitext, title = "", config = {}) {
        try {
            const response = await requests.post({
                format: "json",
                action: "parse",
                text: wikitext,
                title: title,
                pst: "true",
            });
            if (response.parse && response.parse.text) {
                return response.parse.text["*"];
            }
        } catch (e) {
            Log.error("cant_parse_wikitext");
        }
    }

    /**
     * 编辑页面
     */
    static async edit({ title, content, editToken, timestamp, config = {} } = {}) {
        try {
            const response = await requests.post({
                action: "edit",
                format: "json",
                text: content,
                title: title,
                token: editToken,
                basetimestamp: timestamp,
                ...config,
            });
            if (resposne.edit) {
                if (response.edit.result === "Success") {
                    return true;
                } else {
                    if (response.edit.code) {
                        // Abuse Filter
                        throw new Error(`
                            ${i18n.translate("hit_abusefilter")}:${response.data.info.replace(
                            "/Hit AbuseFilter: /ig",
                            ""
                        )}
                            <br>
                            <div style="font-size: smaller;">${response.edit.warning}</div>
                        `);
                    } else {
                        Log.error("unknown_edit_error");
                    }
                }
            } else if (response.error && response.error.code) {
                Log.error("unknown_edit_error_message", [response.error.code]);
            } else if (response.code) {
                Log.error("unknown_edit_error_message", [response.code]);
            } else {
                Log.error("unknown_edit_error");
            }
        } catch (e) {
            Log.error("network_edit_error");
        }
    }
}

export default Wiki;
