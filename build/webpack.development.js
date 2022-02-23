const baseConfig = require("./webpack.base");

module.exports = {
    ...baseConfig,
    mode: "development",
    devtool: "source-map",
    optimization: {
        usedExports: true,
    },
};
