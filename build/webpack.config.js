const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    entry: [path.resolve(__dirname, "../src/index.js")],
    output: {
        path: path.resolve(__dirname, "../dist/"),
        filename: "Main.development.js",
        sourceMapFilename: "[file].map",
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    useBuiltIns: "usage",
                                    corejs: "3",
                                },
                            ],
                        ],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ["*", ".js"],
    },
    mode: "development",
    devtool: "source-map",
    optimization: {
        usedExports: true,
    },
};
