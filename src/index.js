const SingleSpaVueCssLoader = require('./single-spa-vue-css-loader.js')
const SingleSpaVuePreLoader = require('./single-spa-vue-pre-loader.js')
const loaderUtils = require('loader-utils')

module.exports = function (content) {
  const query = loaderUtils.getOptions(this)
  if (query.type === 'css') {
    return SingleSpaVueCssLoader.apply(this,arguments)
  } else if (query.type === 'vue') {
    return SingleSpaVuePreLoader.apply(this, arguments)
  } else {
    return content
  }
}
