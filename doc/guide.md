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

其中 `build-config.json` 是打包应用所必须的，其中包含应用的元数据（与应用包中的元数据不完全一致，例如，不需要列举文件）。详见[打包](#打包)。

默认以 `src/main.js` 为主模块，可以在元数据中指定其他主模块。主模块负责完成应用的初始化（构建主界面、加载必需的资源等）。

## 构建界面
构建界面主要有以下几种模式：
* 使用原生 DOM API 创建、修改元素。
* 使用 html/xml 编写界面模板，通过 [Assets](api.md#assets) 访问模板，并应用于元素的 innerHTML/outerHTML。
* 使用框架提供的工具函数，主要是 [$n](api.md#spa) 和 [applyCSS](api.md#applycss)。
* 使用第三方框架，如 Vue。

这里最推荐使用框架提供的工具函数，这也是框架本身构建界面的方式。

例子：参考[框架源代码](../spa-frame.html)，尤其是 `MainContainer` 函数和 `showDetails` 函数。

## 调试
在开发过程中要测试软件，原始的方式是打包并重新安装，这显然带来不便。

为此，我们提供了调试工具：借助它，可以免去重复打包安装的过程，只需刷新页面即可生效项目的最新更改。

调试工具本质上是一个 SPA，意味着它需要通过应用包进行安装并在 SPA-frame 中运行。

要获取调试工具的安装包，可以下载预构建版本（即[debugger.bin](https://github.com/Chebys/SPA-frame/releases)），也可以从[源代码](debugger)手动构建。还可以使用[在线版](https://chebys.pages.dev/html/spa-frame?fetch=debugger)。

安装并启动后，根据指引进行操作即可。

备注：部分浏览器可能不支持。

## 打包
打包器 `build.py` 应位于项目的上级目录下。

在项目的 `build-config.json` 文件中进行配置。其中包含：暂略。

配置完成后，运行 `build.py`，输入项目路径，即可打包。输出文件名为 `<应用id>.spa`。
<!--使用 [build.py](https://github.com/Chebys/SPA-frame/releases) 进行打包，在项目中添加 build-config.json 以进行配置。参考[示例](example/build-config.json)。

如果有更个性化的需求，请根据规定的应用包结构自行打包。-->

## 发布应用
本框架目前没有任何生态，因此没有完善的发布平台。

要发布应用，有以下选择：
* 直接将应用包发送给用户（无论以什么方式），并引导其使用本框架。
* 将应用包部署到服务器，确保其可通过固定url访问且允许来自 chebys.pages.dev 的跨域请求，构造[远程加载链接](#远程加载链接)并引导用户访问。
* 将应用包提供给框架作者（无论以什么方式），由框架作者将应用包部署到托管平台，构造远程加载链接并引导用户访问。

### 远程加载链接
本框架的官方线上版本为 https://chebys.pages.dev/html/spa-frame 。

通过在官方线上版本的url中添加参数，可使得框架被访问时会自动从指定url加载应用包并启动应用。完整的url称作**远程加载链接**。

例如，应用包的链接为 https://chebys.pages.dev/data/spa/debugger.spa ，则构造的远程加载链接为 https://chebys.pages.dev/html/spa-frame?fetch_url=https%3A%2F%2Fchebys.pages.dev%2Fdata%2Fspa%2Fdebugger.spa 。

当用户访问远程加载链接时，框架会根据 `fetch_url` 参数远程加载应用包，显示加载界面，并在加载完成后自动安装、进入应用。

为了避免重复加载，可以添加 `auto_run` 参数，框架会首先检查对应id的应用是否存在，若存在则直接启动，否则进行远程加载。例如 https://chebys.pages.dev/html/spa-frame?auto_run=debugger&fetch_url=https%3A%2F%2Fchebys.pages.dev%2Fdata%2Fspa%2Fdebugger.spa 。

对于部署到官方托管平台的应用包（上面的例子就是），可以直接在 `fetch` 参数中指定应用包id，例如 https://chebys.pages.dev/html/spa-frame?fetch=debugger 。此时不需要规定 `auto_run` 参数。