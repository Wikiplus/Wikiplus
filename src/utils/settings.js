class Settings {
    getSetting(key, object = {}) {
        const w = object;
        let settings;
        try {
            settings = JSON.parse(localStorage.Wikiplus_Settings);
        } catch (e) {
            return;
        }
        try {
            const customSettingFunction = new Function("return " + settings[key]);
            if (typeof customSettingFunction === "function") {
                try {
                    if (customSettingFunction()(w) === true) {
                        return;
                    } else {
                        return customSettingFunction()(w) || settings[key];
                    }
                } catch (e) {
                    return settings[key];
                }
            } else {
                return settings[key];
            }
        } catch (e) {
            try {
                let result = settings[key];
                for (const key of Object.keys(object)) {
                    result = result.replace(`\${${key}}`, object[key]);
                }
                return result;
            } catch (e) {
                return;
            }
        }
    }
    static version = "3.0.0";
}

export default new Settings();
