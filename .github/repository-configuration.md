# 仓库配置

在默认分支的 [.github 目录](./) 查看本仓已采用的文件。交付单元、资产及渠道由 `delivery.json` 声明；原生作业在 [workflows](workflows/) 中维护。版本配置位于[仓库根目录](../)。已采用的 PR 验证入口列于 `product-ci.json`。

<!-- steward-configuration-sources -->
- [产品 CI](product-ci.json)
- [发行单元与版本文件](../release-please-config.json)
- [已记录版本](../.release-please-manifest.json)
- [资产与渠道](delivery.json)
- [正式构建](workflows/steward-release-publish.yml)
- [文档站](workflows/pages.yml)
<!-- /steward-configuration-sources -->

置顶的「仓库配置」Issue 展示默认分支的生效设置。按 Issue 中的提示发起请求，再打开机器人列出的配置 PR。管理员或受托维护者在 PR 中调整选择并核对 **Files changed**，合并后生效。
