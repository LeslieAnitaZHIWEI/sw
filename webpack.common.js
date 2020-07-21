const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const ExtractTextPlugin = require("extract-text-webpack-plugin");

// const extractLess = new ExtractTextPlugin({
//   filename: "[name].[contenthash].css",
//   disable: process.env.NODE_ENV === "development"
// });

module.exports = {
  // Change to your "entry-point".
  entry: {
    index: './src/index',
    roomConsole: './src/roomConsole',
  },
  output: {
      path: path.resolve(__dirname, 'dist'),
      chunkFilename: '[name].bundle.js',
      filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // MiniCssExtractPlugin.loader,
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.less$/,
        // use: extractLess.extract({
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                modules: true,
              }
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
              }
            },
          ],
        // })
      },
      {
          // Include ts, tsx, js, and jsx files.
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
      },
      {
        test: /\.(png|jpg|svg)$/,
        use: [
          'file-loader'
        ]
      }
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      title: '客户',
      template: './src/index.html',
      filename: 'index.html',
      hash:true,
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      title: '教练',
      template: './src/roomConsole.html',
      filename: 'roomConsole.html',
      hash:true,
      chunks: ['roomConsole'],
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2,
        }
      }
    }
  }
};
