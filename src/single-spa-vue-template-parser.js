const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = '[a-zA-Z_][\\-\\.0-9_a-zA-Z' + unicodeRegExp.source + ']*'
const qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'
const startTagOpen = new RegExp('^\\s*<' + qnameCapture)
const startTagClose = /^\s*(\/?)>/
const comment = /^<!\--/
const endTag = new RegExp(('^<\\/' + qnameCapture + '[^>]*>'))

function parseStartTag (html) {
  let index = 0
  function advance (n) {
    index += n
    html = html.substring(n)
  }
  const start = html.match(startTagOpen)
  if (start) {
    const match = {
      tagName: start[1],
      attrs: [],
      start: index
    }
    advance(start[0].length)
    let end, attr
    while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
      attr.start = index
      advance(attr[0].length)
      attr.end = index
      match.attrs.push(attr)
    }
    if (end) {
      match.unarySlash = end[1]
      advance(end[0].length)
      match.end = index
      return match
    }
  }
}

/*const classFunctionCodeFrame =
  `const classFunction = (value) => {
      if (Array.isArray(value)) {
        return value.map(item => $style[item])
      } else if (typeof value === 'object') {
        return Object.entries(value).reduce((arr, [key, value]) => {
          if(value){
            arr.push($style[key])
          }
          return arr
        }, [])
      } else if (typeof value === 'function') {
        return classFunction[value()]
      } else {
        return [$style[value]]
      }
    }`*/
module.exports = function (context) {
  const stringBuffer = []
  let last = 0
  let html = context

  while (html) {
    let textEnd = html.indexOf('<')
    if (comment.test(html)) {
      let commentEnd = html.indexOf('-->')
      if (commentEnd >= 0) {
        last += (commentEnd + 3)
        html = html.substring(commentEnd + 3)
        continue
      }
    }

    const endTagMatch = html.match(endTag)
    if (endTagMatch) {
      stringBuffer.push(html.slice(0, endTagMatch[0].length))
      last += endTagMatch[0].length
      html = html.substring(endTagMatch[0].length)
      continue
    }

    if (startTagOpen.test(html)) {
      let staticClassList, dynamicClass
      let startTagMatch = parseStartTag(html)
      startTagMatch.attrs.forEach(attr => {
        if (attr[1] === 'class') {
          staticClassList = '[\'' + attr[3].split(' ').join('\',\'') + '\']'
        } else if (attr[1] === ':class') {
          dynamicClass = attr
        }
      })
      if (dynamicClass) {
        stringBuffer.push(html.slice(0, dynamicClass.start))
        const codeFrame = staticClassList ?
          ` :class="$classWrapper(${dynamicClass[3]}).concat($classWrapper(${staticClassList}))"` :
          ` :class="$classWrapper(${dynamicClass[3]})"`
        stringBuffer.push(codeFrame)
        stringBuffer.push(html.slice(dynamicClass.end, startTagMatch.end))
      } else if (staticClassList) {
        if (startTagMatch.unarySlash) {
          stringBuffer.push(html.slice(0, startTagMatch.end - 2))
          stringBuffer.push(` :class="$classWrapper(${staticClassList})"`)
          stringBuffer.push('/>')
        } else {
          stringBuffer.push(html.slice(0, startTagMatch.end - 1))
          stringBuffer.push(` :class="$classWrapper(${staticClassList})"`)
          stringBuffer.push('>')
        }
      } else {
        stringBuffer.push(html.slice(0, startTagMatch.end))
      }
      last += startTagMatch.end
      html = html.substring(startTagMatch.end)
      continue
    }

    let rest, next
    if (textEnd >= 0) {
      rest = html.slice(textEnd)
      while (!startTagOpen.test(rest) && !comment.test(rest) && !endTag.test(rest)) {
        next = rest.indexOf('<', 1)
        if (next < 0) { break }
        textEnd += next
        rest = html.slice(textEnd)
      }
      last += textEnd
      stringBuffer.push(html.slice(0, textEnd))
      html = html.substring(textEnd)
    }

    if (textEnd < 0) {
      break
    }
  }
  return stringBuffer.join('')
}
