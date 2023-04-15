const {join} = require('path');
function resolve(...dir) {
  return join(process.cwd(), ...dir);
}

const {defineConfig} = require('@vue/cli-service');
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
      template: 'src/index.ejs'
    }
  },
  chainWebpack(config) {
    /* region svg-sprite-loader */
    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icons/svg'))
      .end();
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons/svg'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({symbolId: 'icon-[name]'})
      .end();
    /* endregion */

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
      .loader(resolve('butterchurn/loaders/assemblyscript.js'))
      .end();

    config.resolve.alias.set('butterchurn', resolve('butterchurn'));

    config.resolve.alias.set('butterchurn-presets', [
      resolve('src/assets/presets/sample'),
      resolve('node_modules/butterchurn-presets/presets/converted')
    ]);

    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        vendors: {
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
          name: 'butterchurn-presets',
          test: /presets/,
          chunks: 'initial',
          priority: 1
        }
      }
    });

    const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
    config.plugin('node-polyfill-plugin').use(NodePolyfillPlugin);
  }
});
