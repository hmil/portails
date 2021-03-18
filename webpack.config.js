const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: {
        app: './src/main.ts',
        editor: './src/editor/main.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            // {
            //     test: /\.worker\.[tj]s$/,
            //     use: {
            //         loader: 'worker-loader',
            //         options: { publicPath: '/dist/' }
            //     },
            // },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.glsl$/i,
                use: 'raw-loader',
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        plugins: [
            new TsconfigPathsPlugin()
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    externals: {
    },
    devServer: {
        publicPath: '/dist/',
        port: 8080
    }
}