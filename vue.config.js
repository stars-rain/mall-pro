// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  chainWebpack: config => {
    // svg rule loader
    const svgRule = config.module.rule('svg') // 找到svg-loader
    svgRule.uses.clear() // 清除已有的loader, 如果不这样做会添加在此loader之后
    svgRule.exclude.add(/node_modules/) // 正则匹配排除node_modules目录
    svgRule.test(/\.svg$/).use('svg-sprite-loader').loader('svg-sprite-loader').options({ symbolId: 'icon-[name]' })
  },

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, 'src/less/main.less')]
    }
  },
  devServer: {
    proxy: {
      '/api': {
        //代理api
        // eslint-disable-next-line no-undef
        target: process.env.VUE_APP_baseUrl, // 代理接口(注意只要域名就够了)
        changeOrigin: true, //是否跨域
        ws: true, // proxy websockets
        pathRewrite: {
          //重写路径
          '^/api': '' //代理路径
        }
      },
    },
  },
}
