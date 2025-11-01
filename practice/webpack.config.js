const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');

module.exports = {
  mode: 'development',
  entry: {
    background: './src/background/index.js',
    content: './src/content/index.js',
    popup: './src/popup/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            targets: 'defaults',
            presets: [['@babel/preset-env']],
          },
        },
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [autoprefixer],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                silenceDeprecations: [
                  'mixed-decls',
                  'color-functions',
                  'global-builtin',
                  'import',
                ],
              },
            },
          },
        ],
      },
    ],
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/manifest.json', to: 'manifest.json' },
        { from: './src/assets', to: 'assets' },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: './src/popup/popup.html',
      excludeChunks: ['background', 'content'],
    }),
  ],
};
