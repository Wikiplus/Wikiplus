import i18n from "./i18n";

class WikiplusError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

class Log {
    static debug(message = "") {
        console.debug(`[Wikiplus-DEBUG] ${message}`);
    }
    static info(message = "") {
        console.info(`[Wikiplus-INFO] ${message}`);
    }
    static error(errorCode, payloads = []) {
        let template = i18n.translate(errorCode);
        if (payloads.length > 0) {
            // Fill
            payloads.forEach((v, i) => {
                template = template.replace(new RegExp(`\\${i + 1}`, "ig"), v);
            });
        }
        console.error(`[Wikiplus-ERROR] ${template}`);
        throw new WikiplusError(`${template}`, errorCode);
    }
}

export default Log;
