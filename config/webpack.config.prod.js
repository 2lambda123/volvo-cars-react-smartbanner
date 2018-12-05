/* eslint-disable no-var, arrow-parens, prefer-template, comma-dangle, object-shorthand, global-require, func-names, no-else-return, vars-on-top */

const webpack = require('webpack');
const paths = require('./paths');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safeParser = require('postcss-safe-parser');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const getClientEnvironment = require('./env');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing shlash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';
// Get enrivonment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

module.exports = {
  mode: 'production',
  devtool: false,
  entry: {
    main: './src/components/SmartBanner.js',
    example: [require.resolve('./polyfills'), './src/example.js'],
  },

  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: '[name].js',
    publicPath: publicPath,
    library: 'SmartBanner',
    libraryTarget: 'umd',
  },

  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
    'prop-types': {
      root: 'PropTypes',
      commonjs2: 'prop-types',
      commonjs: 'prop-types',
      amd: 'prop-types',
    },
  },

  resolve: {
    modules: ['src', 'node_modules', ...paths.nodePaths],
    alias: {
      'react-smartbanner': './components/SmartBanner.js',
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: paths.appSrc,
      },
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.css$/,
          /\.scss$/,
          /\.json$/,
          /\.png$/,
          /\.svg$/,
        ],
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader?outputStyle=expanded',
        ],
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: true,
          ecma: 6,
          mangle: true
        },
        sourceMap: false,
      }),
      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: {
          parser: safeParser,
          discardComments: {
            removeAll: true,
          },
        },
      }),
    ],
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      chunks: ['example'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    // Generates an `index.html` file with the <script> injected.
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
      PUBLIC_URL: publicUrl,
    }),
    new webpack.DefinePlugin(env),
    new MiniCssExtractPlugin({
      filename: 'main.css',
    }),
    new CopyWebpackPlugin([{ from: 'src/icon.png', to: './' }]),
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};
