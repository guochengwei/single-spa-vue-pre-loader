const compiler = require('vue-template-compiler')
const templateParser = require('./single-spa-vue-template-parser')
module.exports = function (content) {
  const parts = compiler.parseComponent(content, { pad: 'line' })
  let hasCssModule = false
  if (parts.styles.length > 0) {
    const start = content.lastIndexOf('<style', parts.styles[0].start)
    const end = content.indexOf('</style>', parts.styles[parts.styles.length - 1].end) + 8
    const attrs = {}
    let styles = parts.styles.reduce((str, style, index) => {
      hasCssModule = true
      Object.entries(style.attrs).reduce((obj, [key, value]) => {
        obj[key] = value
        return obj
      }, attrs)
      str += style.content.trimLeft() + '\n'
      return str
    }, '')

    attrs.module = true
    attrs.scoped && (delete attrs.scoped)
    const attrStr = Object.entries(attrs).reduce((str, [key, value]) => {
      return value === true ? (str + ` ${key}`) : (str + ` ${key}="${value}"`)
    }, '')
    styles = `<style ${attrStr}> \n${styles}\n</style>`
    content = content.slice(0, start) + styles + content.slice(end)
  }
  if (parts.template && hasCssModule) {
    const newTemplate = templateParser(parts.template.content)
    content = content.slice(0, parts.template.start) + newTemplate + content.slice(parts.template.end)
  }
  return content
}
