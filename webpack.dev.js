const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    hot: true,
    // https: true,
    host: "0.0.0.0",
    port: 5000,
    /** 解决 invalid host header */
    disableHostCheck: true,
    useLocalIp: true,
    historyApiFallback: {
      rewrites: [
        {
          from: /^\/roomConsole/,
          to: '/roomConsole.html'
        },
      ],
    },
    proxy: {
      '/api': {
        target: 'https://wslive.local.hidbb.com',
        pathRewrite: {'^/api' : ''},
        /** 允许 target 为域名 */
        changeOrigin: true,
        /** 可以接受无证书的 https */
        secure: false,
      },
    }
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
