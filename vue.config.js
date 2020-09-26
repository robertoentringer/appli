const fs = require('fs')

const isProd = process.env.NODE_ENV === 'production'

const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  devServer: {
    hot: true,
    host: 'localhost',
    https: {
      key: 'LOCALHOST_SSL_KEY' in process.env && fs.readFileSync(process.env.LOCALHOST_SSL_KEY),
      cert: 'LOCALHOST_SSL_KEY' in process.env && fs.readFileSync(process.env.LOCALHOST_SSL_CRT)
    }
  },
  publicPath: isProd ? './' : '/',
  configureWebpack: {
    devtool: isProd ? 'none' : 'source-map',
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true
            }
          }
        })
      ]
    }
  }
}
