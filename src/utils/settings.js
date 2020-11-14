class Settings {
    getSetting(key, object) {
        var w = object;
        try {
            var settings = JSON.parse(localStorage.Wikiplus_Settings);
        } catch (e) {
            return localStorage.Wikiplus_Settings || "";
        }
        try {
            var _setting = new Function("return " + settings[key]);
            if (typeof _setting == "function") {
                try {
                    if (_setting()(w) === true) {
                        return undefined;
                    } else {
                        return _setting()(w) || settings[key];
                    }
                } catch (e) {
                    return settings[key];
                }
            } else {
                return settings[key];
            }
        } catch (e) {
            try {
                return settings[key];
            } catch (e) {
                return undefined;
            }
        }
    }
}

export default new Settings();
