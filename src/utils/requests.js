class Requests {
    static base = `${location.protocol}//${location.host}${window.mw.config.get('wgScriptPath')}/api.php`;
    static async get(query) {
        const url = new URL(Requests.base);
        Object.keys(query).forEach(key => {
            url.searchParams.append(key, query[key])
        });
        const response = (await fetch(url, {
            credentials: 'same-origin'
        }));
        return await response.json();
    }
    static async post(payload) {
        const url = new URL(Requests.base);
        const response = (await fetch(url, {
            method: 'POST',
            body: Object.keys(payload).map(key => key + '=' + encodeURIComponent(payload[key])).join('&'),
            credentials: 'same-origin'
        }));
        return await response.json();
    }
}

export default Requests;