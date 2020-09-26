const isProd = process.env.NODE_ENV === 'production'
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
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
