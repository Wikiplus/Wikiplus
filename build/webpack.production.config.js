const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const baseConfig = require("./webpack.base.js");

module.exports = {
    ...baseConfig,
    mode: "production",
    output: {
        path: path.resolve(__dirname, "../dist/"),
        filename: "Main.js",
    },
    devtool: "source-map",
    optimization: {
        usedExports: true,
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
};
