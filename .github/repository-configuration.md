# 仓库配置

在默认分支的 [.github 目录](./) 查看本仓已采用的文件。交付单元、资产及渠道由 `delivery.json` 声明；原生作业在 [workflows](workflows/) 中维护。版本配置位于[仓库根目录](../)。已采用的 PR 验证入口列于 `product-ci.json`。

<!-- steward-configuration-sources -->
<!-- /steward-configuration-sources -->


[修改配置](https://github.com/splrad/LayerScape/actions/workflows/repository-configuration.yml)


管理员或委托者在默认分支点击 **Run workflow** 打开本仓配置 PR。后续直接在该 PR 中勾选入口、试跑和交付文件，核对 **Files changed** 后审阅合并。
