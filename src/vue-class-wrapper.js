export default {
  install: function (Vue) {
    Vue.prototype.$classWrapper = function (value) {
      var arr = []
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          arr.push(this.$style[value[i]])
        }
      } else if (typeof value === 'object') {
        var keys = Object.keys(value)
        for (var i = 0; i < keys.length; i++) {
          if (value[keys[i]]) {
            arr.push(this.$style[keys[i]])
          }
        }
      } else if (typeof value === 'function') {
        return Vue.prototype.$classWrapper[value()]
      } else {
        arr.push(this.$style[value])
      }
      return arr
    }
  }
}
