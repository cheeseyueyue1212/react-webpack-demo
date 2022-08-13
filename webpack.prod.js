
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const webpack = require('webpack')
// css单独文件打包
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// css压缩
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// js压缩
const TerserPlugin = require("terser-webpack-plugin");
// 删除上一次打包结果文件 webpack5已用配置支持
// const {CleanWebpackPlugin} = require('clean-webpack-plugin')
// 多设备自动兼容 css
const autoprefixer = require('autoprefixer');
// 多页面应用时，获取目录
const glob = require('glob')

const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')

const ESLintPlugin = require('eslint-webpack-plugin');

// 日志信息样式
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin')

// 速度分析
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasureWebpackPlugin();

// 体积分析工具
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// webpack 5 支持cache, 不需要再处理
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
// css tree shaking
const PurgecssWebpackPlugin = require('purgecss-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src')
}

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
          chunks: ['vendors', 'commons', pageName],
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
      );
    })

  return {
    entry,
    htmlWebpackPlugins
  }
}
const {entry, htmlWebpackPlugins}  = setMPF()


module.exports = smp.wrap({
  // 配置入口文件 entry
  entry,
  output: {
    filename: '[name]_[chunkhash:8].js',
    path: __dirname + '/dist', // 绝对路径
    clean: true,
  },
  mode: 'production',
  // mode: 'none',
  module: {
    rules: [
      {test: /\.css$/, use: [
        MiniCssExtractPlugin.loader,
        'css-loader'
      ]},
      {test: /\.scss/, use: [ MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']},
      {test: /\.less$/, use: [ MiniCssExtractPlugin.loader, 'css-loader', 'less-loader', {
        loader: "postcss-loader",
        options: {
            postcssOptions: {
                plugins: [autoprefixer({
                    overrideBrowserslist: [
                        'last 10 Chrome versions',
                        'last 5 Firefox versions',
                        'Safari >= 6',
                        'ie > 8'
                    ]
                })]
            }

        },
    },
    {
      loader: 'px2rem-loader',
      options: {
        // 适用750设计稿
        remUnit: 75,
        // px->rem 小数点位数
        remPrecision: 8
      }
    }
  ]},
      {
        test: /\.js$/,
        include: path.resolve('src'),
        exclude: /node_modules/,
        use: [
          {
            // 打包速度优化 （多线程
            loader: 'thread-loader',
            options: {
              workers: 3
            },
          },
          {
            loader: 'babel-loader'
          }
        ]
    },
      {test: /\.(png|jpg|gif|jpeg)$/, use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash:8].[ext]'
          }
        },
        {
          // 图片压缩
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: {
              progressive: true,
              quality: 65
            },
            optipng: {
              enabled: false,
            },
            pngquant: {
              quality: [0.65, 0.9],
              speed: 4
            },
            gifsicle: {
              interlaced: false
            },
            webp: {
              quality: 75
            }
          }
        }
      ]},
      {test: /\.(woff|woff2|eot|ttf|otf)$/i, type: 'asset/resource', use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name]_[hash:8].[ext]'
          }
        }
      ] },
      {test: /\.(svg)$/i, type: 'asset/resource'}
    ]
  },

  plugins: [
    // 把css提取单独文件
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css'
    }),

    // new BundleAnalyzerPlugin(),
    // 清除dist文件夹
    // new CleanWebpackPlugin(),

    new FriendlyErrorsWebpackPlugin(),

    //分包
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./build/library/library.json'),
      scope: 'xyz',
      sourceType: 'commonjs2',
    }),

    new PurgecssWebpackPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, {nodir: true})
    }),

    // 构建异常捕获 可以用来上报
    function() {
      this.hooks.done.tap('MyPlugin', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('-watch') === -1) {
          console.log('-----------build error');
          process.exit(1)
        }
      })
    }
    // new ESLintPlugin({
    //   extensions: ['.js', '.jsx'],
    //   fix:true //自动修复
    // })

    // new HtmlWebpackExternalsPlugin({
    //   // 包工具CDN
    //   externals: [
    //     {
    //       module: 'react',
    //       entry: 'https://unpkg.com/react@18/umd/react.production.min.js',
    //       global: 'React',
    //     },
    //     {
    //       module: 'react-dom',
    //       entry: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    //       global: 'ReactDOM'
    //     }
    //   ],
    // }),
  ].concat(htmlWebpackPlugins),

  optimization: {
    runtimeChunk: 'single',
    minimizer: [
      // js压缩(并行压缩)  速度优化
      new TerserPlugin({
        parallel: true
      }),
      // css压缩
      new CssMinimizerPlugin()
    ],
    minimize:true,

    // 分离公共包
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        // 使用次数多，可以单独打包
        commons: {
          name: 'commons',
          chunks: 'all',
          // 使用次数
          minChunks: 2
        },
        defaultVendors: {
          test: /(react|react-dom)/,
          name: 'vendors',
          chunks: 'all'
        }
      },
    },
  },

  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 9999,
    open: true
  },

  devtool: 'source-map',
  // stats: 'errors-only',
  // resolve: {
  // 感觉反而变慢（wepack5中
  //   alias: {
  //     'react': path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'),
  //     'react-dom': path.resolve(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js')
  //   },
  //   extensions: ['.js'],
  //   mainFields: ['main']
  // }
})