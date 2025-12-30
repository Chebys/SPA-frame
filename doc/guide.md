# 开发指南
应用最终会以应用包的形式发布。本指南中，我们使用 [build.py](../build.py) 来构建应用包。

## 项目结构
一个典型的项目应具有如下结构：
```
root/
├── build-config.json
├── assets/
│   ├── images/
│   │   ├── player.png
│   │   ├── enemy.png
│   │   └── background.jpg
│   ├── sounds/
│   │   ├── shoot.wav
│   │   └── explosion.wav
│   └── levels/
│       ├── level1.json
│       └── level2.json
└── src/
    ├── main.js
    └── utils/
        └── loader.js
```

其中 `build-config.json` 是打包应用所必须的，其中包含[项目配置](#项目配置)。

默认以 `src/main.js` 为主模块，可以在元数据中指定其他主模块。主模块负责完成应用的初始化（构建主界面、加载必需的资源等）。

## 项目配置
即 `build-config.json` 中的信息。

| 键           | 说明
|--------------|---
| id           | 标识符，使用小写字母+连字符
| _ver         | API 版本，目前为 1
| version      | （可选）应用版本，目前仅用于展示
| name         | 显示名称
| author       | （可选）作者
| desc         | （可选）描述
| icon         | （可选）图标，使用 Data URL 或指明文件名
| main         | （可选）主模块名称
| overrideType | （可选）文件类型覆盖，文件名到类型的映射
| preloads     | （可选）预加载规则，扩展名到预加载类型的映射
| require_path | 脚本中 require 函数的默认查找目录。
| scripts_path | 历史遗留参数。
| outputpath   | （可选）输出路径，默认为 `<id>.spa`

## 构建界面
构建界面主要有以下几种模式：
* 使用原生 DOM API 创建、修改元素。
* 使用 html/xml 编写界面模板，通过 [Assets](api.md#assets) 访问模板，并应用于元素的 innerHTML/outerHTML。
* 使用框架提供的工具函数，主要是 [$n](api.md#spa) 和 [applyCSS](api.md#applycss)。
* 使用第三方框架，如 Vue。

这里最推荐使用框架提供的工具函数，这也是框架本身构建界面的方式。

例子：参考[框架源代码](../spa-frame.html)，尤其是 `MainContainer` 函数和 `showDetails` 函数。

## 持久化存储
可以使用原生 localStorage 或 [storage模块](api.md#storage)。

注意：不要在 localStorage 中存储敏感数据，因为可以被其他应用访问！

storage模块适用于存储敏感数据或大型二进制数据。

## 调试
在开发过程中要测试软件，原始的方式是打包并重新安装，这显然带来不便。

为此，我们提供了调试工具：借助它，可以免去重复打包安装的过程，只需刷新页面即可生效项目的最新更改。

调试工具本质上是一个 SPA，意味着它需要通过应用包进行安装并在 SPA-frame 中运行。

要获取调试工具的安装包，可以下载预构建版本（即[debugger.bin](https://github.com/Chebys/SPA-frame/releases)），也可以从[源代码](debugger)手动构建。还可以使用[在线版](https://spa.x-ze.cn/app/debugger)。

安装并启动后，根据指引进行操作即可。<!--配置格式与[项目配置](#项目配置)一致。-->

备注：部分浏览器可能不支持。

## 打包
打包器 `build.py` 应位于项目的上级目录下。

在项目的 `build-config.json` 文件中进行[配置](#项目配置)。

配置完成后，运行 `build.py`，输入项目路径，即可打包。输出文件名为 `<应用id>.spa`。
<!--使用 [build.py](https://github.com/Chebys/SPA-frame/releases) 进行打包，在项目中添加 build-config.json 以进行配置。参考[示例](example/build-config.json)。

如果有更个性化的需求，请根据规定的应用包结构自行打包。-->

## 发布应用
本框架目前没有任何生态，因此没有完善的发布平台。

要发布应用，有以下选择：
* 直接将应用包发送给用户（无论以什么方式），并引导其使用本框架。
* 将应用包提供给框架作者（无论以什么方式），由框架作者将应用包部署到托管平台，构造链接并引导用户访问。
* 将应用包和框架本体部署到服务器，构造[远程加载链接](#远程加载链接)并引导用户访问。

### 远程加载链接
<!-- 本框架的官方线上版本为 https://spa.x-ze.cn/ 。 -->
这需要应用包和框架本体能够在同一个域名下访问。

通过在 url 中添加参数，可使得框架被访问时会自动从指定url加载应用包并启动应用。完整的 url 称作**远程加载链接**。

例如，框架的 url 为 https://spa.x-ze.cn/spa-frame ，应用包的 url 为 https://spa.x-ze.cn/package/debugger ，则构造的远程加载链接为 https://spa.x-ze.cn/spa-frame?fetch_url=%2Fpackage%2Fdebugger 。

当用户访问远程加载链接时，框架会根据 `fetch_url` 参数远程加载应用包，显示加载界面，并在加载完成后自动安装、进入应用。

为了避免重复加载，可以添加 `auto_run` 参数，框架会首先检查对应 id 的应用是否存在，若存在则直接启动，否则进行远程加载。例如 https://spa.x-ze.cn/spa-frame?auto_run=debugger&fetch_url=%2Fpackage%2Fdebugger 。

对于部署到官方托管平台的应用包（上面的例子就是），可以直接使用 `https://spa.x-ze.cn/app/<app_id>` 作为 url，例如 https://spa.x-ze.cn/app/debugger ，相当于同时规定了 `auto_run` 和 `fetch_url`。