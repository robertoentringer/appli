const fs = require('fs')

const isProd = process.env.NODE_ENV === 'production'

const TerserPlugin = require('terser-webpack-plugin')

const devServer = () =>
  !isProd &&
  'LOCALHOST_SSL_KEY' in process.env &&
  'LOCALHOST_SSL_CRT' in process.env &&
  fs.existsSync(process.env.LOCALHOST_SSL_KEY) &&
  fs.existsSync(process.env.LOCALHOST_SSL_CRT)
    ? {
        host: 'localhost',
        https: {
          key: fs.readFileSync(process.env.LOCALHOST_SSL_KEY),
          cert: fs.readFileSync(process.env.LOCALHOST_SSL_CRT)
        }
      }
    : ''

module.exports = {
  ...(devServer() && { devServer: devServer() }),
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
