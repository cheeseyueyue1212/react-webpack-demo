const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const webpack = require('webpack')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin')

// const ESLintWebpackPlugin = require("eslint-webpack-plugin")

// 多页面应用时，获取目录
const glob = require('glob')

const setMPF = () => {
  const entry = {};
  const htmlWebpackPlugins = [];

  // 获取所有的匹配目录
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'))

  Object.keys(entryFiles)
    .map((index) => {
      const entryFile = entryFiles[index]

      // '/Users/liyue/Documents/pack/src/index/index.js',
      const match = entryFile.match(/src\/(.*)\/index\.js/);
      const pageName = match && match[1];

      entry[pageName] = entryFile

      htmlWebpackPlugins.push(
        new HtmlWebpackPlugin({
          template: path.join(__dirname, `src/${pageName}/index.html`),
          chunks: [pageName],
          filename: `${pageName}.html`,
          inject: true,
          minify: {
            html5: true,
            collapseWhitespace: true,
            preserveLineBreaks: false,
            minifyCSS: true,
            minifyJS: true,
            removeComments: false
          }
        }),
      )
    })
  return {
    entry,
    htmlWebpackPlugins
  }
}
const {entry, htmlWebpackPlugins}  = setMPF()

module.exports = {
  // 配置入口文件 entry
  entry,
  output: {
    filename: '[name].js',
    path: __dirname + '/dist' // 绝对路径
  },
  mode: 'development',
  module: {
    rules: [
      {test: /\.css$/, use: ['style-loader', 'css-loader']},
      {test: /\.scss/, use: ['style-loader', 'css-loader', 'sass-loader']},
      {test: /\.less$/, use: ['style-loader', 'css-loader', 'less-loader']},
      {test: /\.js$/, use: 'babel-loader'},
      {test: /\.(png|jpg|gif|jpeg)$/, use: 'file-loader'},
      {test: /\.(woff|woff2|eot|ttf|otf|svg)$/i, type: 'javascript/auto' }
    ]
  },
  plugins: [
    // 热更新
    new webpack.HotModuleReplacementPlugin(),

    // 清除dist文件夹
    new CleanWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin(),

    // 【2】配置eslint插件☆☆☆☆☆
    // new ESLintWebpackPlugin({
    //   // 指定检查文件的根目录
    //   context: path.resolve(__dirname, "src"),
    // })
  ].concat(htmlWebpackPlugins),
  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 9999,
    open: true,
  },
  // stats: 'errors-only',

  devtool: 'source-map'
}