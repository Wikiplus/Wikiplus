/**
 * 解析URL参数列表
 * Parse URL query.
 * @param {string}} url
 */
export function parseQuery(url) {
    const reg = /(([^?&=]+)(?:=([^?&=]*))*)/g;
    const params = {};
    let match;
    while ((match = reg.exec(url))) {
        try {
            params[match[2]] = decodeURIComponent(match[3]);
        } catch {
            params[match[2]] = match[3];
        }
    }
    return params;
}
