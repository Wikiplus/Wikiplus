import Constants from "../utils/constants";

class Requests {
    static base = `${location.protocol}//${location.host}${Constants.scriptPath}/api.php`;
    static async get(query) {
        const url = new URL(Requests.base);
        Object.keys(query).forEach((key) => {
            url.searchParams.append(key, query[key]);
        });
        const response = await fetch(url, {
            credentials: "same-origin",
        });
        return await response.json();
    }
    static async post(payload) {
        const url = new URL(Requests.base);
        const form = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            form.append(key, value);
        });
        const response = await fetch(url, {
            method: "POST",
            body: form,
            credentials: "same-origin",
        });
        return await response.json();
    }
}

export default Requests;
