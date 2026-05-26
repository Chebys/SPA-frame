# API 文档
根据暴露形式，API 可以分为局部变量、全局变量和预加载模块。

## require
本质上是注入每个模块的局部变量。用于加载脚本（type为script的文件）。

路径以`':'`开头表示[预加载模块](#预加载模块)，`'/'`开头表示绝对路径，`'./'`开头表示相对当前文件的路径，否则表示相对`require_path`的路径。会自动添加'.js'后缀。
* 例如，`require_path`为`'module'`，则 `require('test')` 表示加载名为 `'module/test.js'` 的脚本。

返回值即脚本的返回值（参考lua中的模块）。

不允许循环依赖。

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

## Assets
一个全局对象，通过文件名访问 asset 文件，例如 `Assets['style.css']`。

文件默认为 Blob 对象（不保证 type 属性）；可通过元数据中的 `preload` 字段指定其他类型，见下文。
### 预加载
应用运行前会先解析应用包，该阶段会提取包中的 asset 文件，若元数据中规定了该文件的 `preload`，则会将其预加载到内存。这使得应用初始化时可以同步访问其中的数据，常用于小型的配置文件或样式表。

`preload` 的可选值如下：
* `"text"`：加载为字符串。
* `"arrayBuffer"`：加载为 ArrayBuffer 对象。
* `"json"`：按 JSON 格式解析为对象。
* `"bitmap"`：加载为 ImageBitmap 对象。
* `"html"`：解析为 Document 对象，contentType 为 `'text/html'`。
* `"xml"`：解析为 Document 对象，contentType 为 `'text/xml'`。
* `"blobURL"`：URL.createObjectURL 的结果。
* `"objectURL"`：同上。
* `"dataURL"`：FileReader.readAsDataURL 的结果。

其中所有涉及文本编码的格式均按照 utf8 编码进行解析。若有其他编码的需求，需要手动解码。

## 预加载模块
这类模块在主模块运行前就缓存完毕，可以直接导入。
### spa
```js
const {$n, $, applyCSS, importFont, FileInput, DownloadBlob} = require(':spa')

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
关于 `$n` 和 `$` 的具体工作原理，见源代码。

#### applyCSS
```js
applyCSS(text)
```
应用css文本。实际上是创建了 CSSStyleSheet 并添加到 document.adoptedStyleSheets。返回 CSSStyleSheet 对象。

#### importFont
```js
importFont(family, font, format='opentype')
```
用于导入字体。

`font` 为 Blob 对象或字符串。为字符串时，等价于 `Assets[font]`。


### idb
```js
const idb = require(':idb')
// 2 种使用方式：原生或封装

//原生使用
let request = idb.open(version) //会打开名为 SPA::<AppId> 的数据库，返回 IDBRequest

//使用封装版本
let oldVersion = await idb.checkVersion(version, ['data', 'config'])

const storage = idb.storage('data')
await storage.get(key)
await storage.getMany(keys)
await storage.set(key, value)
await storage.setMany(entries)
await storage.update(key, updater)
await storage.del(key)
await storage.delMany(keys)
await storage.keys()
await storage.entries()
await storage.clear()
```