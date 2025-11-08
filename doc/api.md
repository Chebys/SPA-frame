# API 文档
根据暴露形式，API 可以分为局部变量、全局变量和预加载模块。

目前的 API 版本为 1。

## require
本质上是注入每个模块的局部变量。用于加载脚本（type为script的文件）。

路径以`':'`开头表示[预加载模块](#预加载模块)，`'/'`开头表示绝对路径，`'./'`开头表示相对当前文件的路径，否则表示相对`require_path`的路径。会自动添加'.js'后缀。
* 例如，`require_path`为`'module'`，则 `require('test')` 表示加载名为 `'module/test.js'` 的脚本。

返回值即脚本的返回值（参考lua中的模块）。

例子：
```js
//data.js
return {
    name: 'JP',
    age: 74
}

//main.js
const {name, age} = require('data')
console.log(name, age)
```
## 全局变量

### Assets
通过文件名访问 asset 文件，例如 `Assets['style.css']`。

文件默认为 Blob 对象；可通过元数据中的 `preload` 字段指定其他类型。

### applyCSS
```js
applyCSS(text)
```
应用css文本。实际上是创建了 CSSStyleSheet 并添加到 document.adoptedStyleSheets。返回 CSSStyleSheet 对象。

### importFont
```js
importFont(family, font, format='opentype')
```
用于导入字体。

`font` 为 Blob 对象或字符串。为字符串时，等价于 `Assets[font]`。

## 预加载模块

### spa
```js
const {$n, FileInput, DownloadBlob} = require(':spa')

let file = await FileInput('.png')
DownloadBlob(file, 'copy.png')

let widget = $n('div', {
    style: {
        display: 'flex',
        flexDirection: 'column'
    },
    content: [
        $n('h1', {content:'title'}),
        $n('div', {content:'text'})
    ]
})
```
关于 `$n` 的具体工作原理，见源代码。

### storage
```js
const storage = require(':storage')

await storage.get(key)
await storage.getMany(keys)
await storage.set(key, value)
await storage.setMany(entries)
await storage.del(key)
await storage.delMany(keys)
await storage.keys()
await storage.entries()
```
目前只能使用字符串作为键。非字符串键会自动转换为字符串。