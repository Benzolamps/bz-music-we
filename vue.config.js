'use strict';

const {join} = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

function resolve(...dir) {
  return join(process.cwd(), ...dir);
}

const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  publicPath: './',
  devServer: {
    host: '0.0.0.0',
    port: 9826,
    allowedHosts: 'all',
  },
  pages: {
    index: {
      title: require('./package.json').description,
      entry: 'src/main.ts'
    }
  },
  chainWebpack(config) {
    config.module.rule('svg').exclude.add(resolve('src/assets/icons/svg'))
      .end();
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end();

    config.module
      .rule('lrc')
      .test(/\.lrc$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end();

    config.module
      .rule('assemblyscript')
      .test(/\.asc\.ts$/)
      .use('assemblyscript-loader')
      .loader(resolve("butterchurn/loaders/assemblyscript.js"))
      .end();

    config.plugin('node-polyfill-plugin').use(NodePolyfillPlugin);
    
    config.resolve.alias.set('butterchurn', resolve('butterchurn'))

    config
      .optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        libs: {
          name: 'chunk-vendors',
          test: resolve('node_modules'),
          chunks: 'initial'
        },
        butterchurn: {
          name: 'butterchurn',
          test: resolve('butterchurn'),
          chunks: 'initial'
        },
        presets: {
          name: 'visual-presets',
          test: resolve('src/assets/presets'),
          chunks: 'initial'
        }
      }
    })
  }
});
