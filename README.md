# single-spa-vue-pre-loader

这个库主要用于解决single-spa与vue集成时，多个项目之间的css样式冲突问题，使用[CSS Modules](https://vue-loader.vuejs.org/zh/guide/css-modules.html#%E7%94%A8%E6%B3%95) 方案

## 安装

``` bash
npm install single-spa-vue-pre-loader
```

## 使用

### `vue文件预处理`

在vue-loader之前使用single-spa-vue-pre-loader预处理vue文件

``` js
{
    test: /\.vue$/,
    loader: 'single-spa-vue-pre-loader',
    options: {
      type: 'vue'
    }
}
```

### `css处理`
由旧版vue-cli2.x脚手架搭建的项目，使用的时是带编译器版本的vue而非runtime，且dev模式下css部分是实时编译的。

受限于实时编译通过url传递loader参数的形式，无法传递函数，需要对css-loader进行特殊配置。

将vue-loader中默认的css-loader替换成single-spa-vue-pre-loader

(css处理vue-cli3.0以上版本可能用不上，待确认)
``` js
{
    loader: 'single-spa-vue-pre-loader',
    options: {
      type: 'css'
    }
}
```

### '$classWrapper'
``` js
import Vue from 'vue'
import vueClassWrapper from 'single-spa-vue-pre-loader/dist/vue-class-wrapper'
Vue.use(vueClassWrapper)
```

## 预处理

### `vue`
``` vue
<div class="class1" :class="['myClassName',comptedClassName]">
</div>
<style lang="scss">
.class1{}
</style>
```
to
``` vue
<div class="class1" :class="$classWrapper(['class1','myClassName',comptedClassName])">
</div>
<style lang="scss" module>
.class1{}
</style>
```
### `css`
使用css-loader的 [getLocalIdent](https://github.com/webpack-contrib/css-loader/tree/v0.28.11#modules) 排除全局存在且不需要被转换的类名，如公共组件库类名

