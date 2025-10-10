# SPA-frame
顾名思义，是 SPA（单页应用）的运行框架。

本框架专门为纯本地环境而设计。应用的源码及所有依赖的资源需要打包在一个应用包中，理想情况下不会进行任何网络通信（应用的开发者也不应假定环境允许进行网络通信）。

应用的运行环境基本与通常的 Web 前端一致，意味着可以使用 DOM、Blob、Canvas、IndexedDB 等 API，但不保证涉及网络通信的 API 有效（因为页面可能是在 file: 协议下打开的）。此外提供[特有的 API](#api)。

应用的入口为一个主模块，这个模块需要完成包括界面在内的初始化。框架不会自动执行主模块之外的脚本，而需要通过require函数主动调用。任何资源（html文档、样式表、字体等）均不会自动生效，需要在脚本中主动使用，例如使用applyCSS、importFont函数。

## 框架本体
即 [spa-frame.html](spa-frame.html)。没有任何外部依赖。

## 应用包
一个合法的应用包由[元数据](#元数据) + '\0' + [二进制数据](#二进制数据)构成。

### 元数据
一个 JSON 对象，包含如下字段：
* _ver         （可选）框架版本，暂时无用
* version      （可选）应用版本，暂时无用
* id            标识符，建议使用小写字母+连字符
* author       （可选）作者
* desc         （可选）描述
* name          显示名称
* icon         （可选）图标，使用 Data URL
* main          主模块名称
* require_path  脚本中require函数的默认查找目录
* files         文件列表

每个文件的字段：（仅name，size必选）
* name      文件名，可包含'/'，不能以'/'开头或结束，不可重复
* size      文件大小
* type      'asset' 或 'script'，默认为前者
* preload   仅用于 asset，可选值：'arrayBuffer', 'text', 'json', 'bitmap'；其中text和json仅限utf8编码（其他编码可加载为arrayBuffer并手动解码）

### 二进制数据
包含所有文件的二进制数据，按 files 中的顺序排列，文件之间没有分隔或填充。

### 打包
可以使用 [build.py](build.py) 进行打包，在项目中添加 build-config.json 以进行配置。参考[示例](example/build-config.json)。

如果有更个性化的需求，请根据规定的应用包结构自行打包。

## API
若无特别说明，均为全局变量。

### require
本质上是每个模块的局部变量。用于加载脚本（type为script的文件）。

路径以'/'开头表示绝对路径，'./'开头表示相对当前文件的路径，否则表示相对require_path的路径。会自动添加'.js'后缀。
* 例如，require_path为'module'，则 require('test') 表示加载名为 'module/test.js' 的脚本。

返回值即脚本的返回值（参考lua中的模块）。

例子：

    //data.js
    return {
        name: 'JP',
        age: 74
    }

    //main.js
    const {name, age} = require('data')
    console.log(name, age)

### Assets
通过文件名访问 asset 文件，例如 `Assets['style.css']`。

文件默认为 Blob 对象；可通过元数据中的 preload 字段指定其他类型。

### applyCSS

    applyCSS(text)

应用css文本。实际上是创建了 CSSStyleSheet 并添加到 document.adoptedStyleSheets。

### importFont

    importFont(family, fontBlob, format='opentype')

用于导入字体。

### IDBStorage
用于简化 IndexedDB 操作。详见 [idb-storage](https://github.com/Chebys/idb-storage)。

## 调试
在开发过程中要测试软件，原始的方式是打包并重新安装，这显然带来不便。

为此，我们提供了调试工具：借助它，可以免去重复打包安装的过程，只需刷新页面即可生效项目的最新更改。

调试工具本质上是一个 SPA，意味着它需要通过应用包进行安装并在 SPA-frame 中运行。

要获取调试工具的安装包，可以下载预构建版本（即[debugger.bin](https://github.com/Chebys/SPA-frame/releases)），也可以从[源代码](debugger)手动构建。

安装并启动后，根据指引进行操作即可。

备注：部分浏览器可能不支持。