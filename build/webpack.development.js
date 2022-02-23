const path = require("path");
const baseConfig = require("./webpack.base");

module.exports = {
    ...baseConfig,
    mode: "development",
    output: {
        path: path.resolve(__dirname, "../dist/"),
        filename: "Main.development.js",
    },
    devtool: "source-map",
    optimization: {
        usedExports: true,
    },
};
