const {join} = require('path');

function resolve(...dir) {
  return join(process.cwd(), ...dir);
}


const {defineConfig} = require('@vue/cli-service');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  publicPath: './',
  devServer: {
    host: '0.0.0.0',
    port: 9826,
    allowedHosts: 'all'
  },
  pages: {
    index: {
      title: require('./package.json').description,
      entry: 'src/main.ts',
      template: 'src/templates/index.ejs'
    }
  },
  chainWebpack(config) {
    config.module.rules.delete('svg');
  },
  configureWebpack: {
    resolve: {
      alias: {
        'butterchurn': resolve('butterchurn'),
        'butterchurn-presets': [
          resolve('src/assets/presets/sample'),
          resolve('node_modules/butterchurn-presets/presets/converted')
        ]
      }
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          include: resolve('src/assets/icons/svg'),
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                symbolId: 'icon-[name]'
              }
            }
          ]
        },
        {
          test: /\.asc\.ts$/,
          use: [
            {
              loader: resolve('butterchurn/loaders/assemblyscript.js')
            }
          ]
        },
        process.env.VUE_APP_BUILD_TARGET === 'static' ? {
          test: /\.(mp3|wav|ttf|zip|png)$/,
          include: resolve('src/assets'),
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 100 * 1024 * 1024
            }
          }
        } : {
          test: /\.(zip)$/,
          type: 'asset',
          generator: {
            filename: 'zip/[name].[hash:8][ext]'
          }
        },
        {
          test: /\.(lrc|html)$/,
          type: 'asset/source'
        }
      ]
    },
    plugins: [new NodePolyfillPlugin()],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            name: 'chunk-vendors',
            test: resolve('node_modules'),
            chunks: 'initial'
          },
          assets: {
            name: 'static-assets',
            test: /\.(mp3|wav|lrc|ttf|png|zip)$/,
            chunks: 'initial',
            priority: 1
          },
          butterchurn: {
            name: 'butterchurn',
            test: resolve('butterchurn'),
            chunks: 'initial',
            priority: 1
          },
          presets: {
            name: 'butterchurn-presets',
            test: /presets/,
            chunks: 'initial',
            priority: 1
          }
        }
      }
    }
  }
});
