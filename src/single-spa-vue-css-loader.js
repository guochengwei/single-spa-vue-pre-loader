const cssLoader = require('css-loader')
const getLocalIdent = require('css-loader/lib/getLocalIdent')

module.exports = function (content, map) {
  this.loaders[0].query = JSON.parse(this.loaders[0].options)
  this.query.getLocalIdent = function (context, localIdentName, localName, options) {
    if (/^el-/.test(localName)) {
      return localName
    }
    return getLocalIdent.apply(null, arguments)
  }
  return cssLoader.call(this, content, map)
}
