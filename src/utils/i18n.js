import zh from "../../languages/zh-cn.json";
import en from "../../languages/en-us.json";

class I18n {
    language;
    i18nData = {};
    sessionUpdateLog = [];
    constructor() {
        let language;
        try {
            language = JSON.parse(localStorage.Wikiplus_Settings)["language"] || window.navigator.language.toLowerCase();
        } catch (e) {
            language = window.navigator.language.toLowerCase();
        }
        this.language = language;
        // Preload 2 languages
        this.i18nData["zh-cn"] = zh;
        this.i18nData["en-us"] = en;
        // Merge with localStorage i18n cache
        try {
            let i18nCache = JSON.parse(localStorage.getItem("Wikiplus_i18nCache"));
            for (const key of Object.keys(i18nCache)) {
                if (key !== "zh-cn" && key !== "en-us") {
                    this.i18nData[key] = i18nCache[key];
                }
            }
        } catch (e) {
            // Fail to parse i18n cache, reset
            localStorage.setItem("Wikiplus_i18nCache", "{}");
        }
    }
    translate(key, placeholders = []) {
        let result = "";
        if (this.language in this.i18nData) {
            if (key in this.i18nData[this.language]) {
                result = this.i18nData[this.language][key];
            } else {
                // try update language verison
                this.loadLanguage(this.language);
                if (key in this.i18nData["en-us"]) {
                    // Fallback to English
                    result = this.i18nData["en-us"][key];
                } else {
                    result = key;
                }
            }
        } else {
            this.loadLanguage(this.language);
        }

        if (placeholders.length > 0) {
            placeholders.forEach((placeholder, index) => {
                result = result.replace(`$${index + 1}`, placeholder);
            });
        }
        return result;
    }
    async loadLanguage(language) {
        if (this.sessionUpdateLog.includes(language)) {
            // Has been updated this session.
            return;
        }
        try {
            const response = await (
                await fetch(`https://wikiplus-app.com/languages/get.php?lang=${language}`)
            ).json();
            const nowVersion = localStorage.getItem("Wikiplus_LanguageVersion") || "000";
            this.sessionUpdateLog.push(language);
            if (response.__version !== nowVersion || !(language in this.i18nData)) {
                // Language get updated
                console.info(`Update ${language} support to version ${response.__version}`);
                this.i18nData[language] = response;
                // Update localStorage cache
                localStorage.setItem("Wikiplus_i18nCache", JSON.stringify(this.i18nData));
            }
        } catch (e) {
            // Unsupported language
        }
    }
}

export default new I18n();
