'use strict'
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: process.env.publicPath,
    devServer: {
        port: 80,
        allowedHosts: "all",
    },
    productionSourceMap: false,
    pages: {
      index: {
        entry: 'examples/main.js',
        template: 'public/index.html',
        filename: 'index.html'
      }
    },
    chainWebpack: config => {
      config.module
        .rule('js')
        .include
        .add('/packages')
        .end()
        .use('babel')
        .loader('babel-loader')
    }
})