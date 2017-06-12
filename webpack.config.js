module.exports = {
    entry: './ui/src/index.js',
    output: {
        filename: 'bundle.js',
        path: 'ui/public'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['react']
                }
            }
        ]
    }
};