const path = require('path');
const env = process.env.NODE_ENV || 'production';

module.exports = {
    mode: env === 'development' ? 'development' : 'production',
    entry: './src/fparser.js',
    devtool: 'source-map',
    output: {
        filename: 'fparser.js',
        path: path.resolve(__dirname, 'dist'),
        // needed if lib type = umd:
        globalObject: 'this',
        library: {
            name: 'Formula',
            type: 'umd'
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};
