const path = require('path');

module.exports = {
    mode: 'production',
    entry: [
        path.resolve(__dirname, '../src/index.js'),
    ],
    output: {
        path: path.resolve(__dirname, '../'),
        filename: 'Main.js'
    },
    module: {
        rules: [
          {
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: ['babel-loader']
          }
        ]
      },
      resolve: {
        extensions: ['*', '.js']
      },
}