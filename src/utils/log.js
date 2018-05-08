import i18n from "./i18n";

class Log {
    static debug(message = '') {
        console.debug(`[Wikiplus-DEBUG] ${message}`);
    }
    static info(message = '') {
        console.info(`[Wikiplus-INFO] ${message}`);
    }
    static error(errorCode) {
        console.error(`[Wikiplus-ERROR] ${i18n.translate(errorCode)}`);
    }
}

export default Log;