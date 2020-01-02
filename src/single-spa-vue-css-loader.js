const cssLoader = require('css-loader')
const getLocalIdent = require('css-loader/lib/getLocalIdent')
const loaderUtils = require('loader-utils')

module.exports = function (content, map) {
  const loader = this.loaders[this.loaderIndex]
  const query = loaderUtils.getOptions(this)
  query.getLocalIdent = function (context, localIdentName, localName, options) {
    if (/^el-/.test(localName)) {
      return localName
    }
    return getLocalIdent.apply(null, arguments)
  }
  loader.query = query
  return cssLoader.call(this, content, map)
}
