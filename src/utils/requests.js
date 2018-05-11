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
        Object.keys(payload).forEach(key => {
            url.searchParams.append(key, payload[key])
        });
        const response = (await fetch(url, {
            method: 'POST',
            credentials: 'same-origin'
        }));
        return await response.json();
    }
}

export default Requests;