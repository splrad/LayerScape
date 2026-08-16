---
applyTo: "src/**,tools/Publish-ReleaseAssets.ps1,Directory.Build.props,Directory.Packages.props,global.json,Version.props,chore/Fonts.zip"
---

本文件补充LayerScape运行时代码和发布资产的审查重点，输出格式遵循`.github/copilot-instructions.md`。

- 核对AutoCAD版本、目标框架、WPF行为和部署器嵌入资源。
- 核对十个`AFR-ACAD20XX`插件、`.cad.json`描述符、字体包和三项发布资产仍能被`tools/Publish-ReleaseAssets.ps1`发现。
- 核对字体替换、SHX处理、运行时映射、安装和卸载路径的用户可见行为。
- 核对`Version.props`、构建属性和发布脚本不会产生错误版本、标签、目标提交或资产名称。
- 运行代码和安装包改动才进入用户可见发布说明；纯文档、中央自动化或版本号维护不生成更新条目。
