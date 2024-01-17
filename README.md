# ieg-vscode-plugin 使用指南

vscode version: `1.75.0`以上

**开发指引**：

_TS 开发_

调试：vscode 按 F5

打包：

1. `npm run prepublish`进行 webpack 生产配置打包 -> 生产 js
2. `npm run build`打包生成 vsix 文件

当前功能：

- 压缩图片

## 压缩图片

- 右键目录，过滤图片文件，若有图片资源，则压缩；若无图片资源，则不做处理
- 右键文件，单独压缩单张图片
