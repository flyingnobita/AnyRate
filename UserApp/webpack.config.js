const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './client/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader'
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(png|svg|jpg|jped|gif)&/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name][ext][query]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('client/template.html')
    })
  ],
  output: {
    path: resolve(__dirname, 'public'),
    filename: 'bundle.js',
    clean: true
  }
};
