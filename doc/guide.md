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

其中 `build-config.json` 是打包应用所必须的，其中包含应用的元数据（与应用包中的元数据不完全一致，例如，不需要列举文件）。

## 调试
在开发过程中要测试软件，原始的方式是打包并重新安装，这显然带来不便。

为此，我们提供了调试工具：借助它，可以免去重复打包安装的过程，只需刷新页面即可生效项目的最新更改。

调试工具本质上是一个 SPA，意味着它需要通过应用包进行安装并在 SPA-frame 中运行。

要获取调试工具的安装包，可以下载预构建版本（即[debugger.bin](https://github.com/Chebys/SPA-frame/releases)），也可以从[源代码](debugger)手动构建。

安装并启动后，根据指引进行操作即可。

备注：部分浏览器可能不支持。
<!--
## 打包
使用 [build.py](https://github.com/Chebys/SPA-frame/releases) 进行打包，在项目中添加 build-config.json 以进行配置。参考[示例](example/build-config.json)。

如果有更个性化的需求，请根据规定的应用包结构自行打包。-->