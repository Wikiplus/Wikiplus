import i18n from "./i18n";

class Log {
    static debug(message = '') {
        console.debug(`[Wikiplus-DEBUG] ${message}`);
    }
    static info(message = '') {
        console.info(`[Wikiplus-INFO] ${message}`);
    }
    static error(errorCode, payloads = []) {
        let template = i18n.translate(errorCode);
        if (payloads.length > 0) {
            // Fill 
            payloads.forEach((v, i) => {
                template = template.replace(new RegExp(`\\${i + 1}`, 'ig'), v);
            })
        }
        console.error(`[Wikiplus-ERROR] ${template}`);
        throw new Error(`[Wikiplus-ERROR] ${template}`);
    }
}

export default Log;