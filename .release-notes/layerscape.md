## 概述

LayerScape 新系列首发版本为 1.0.0，提供 Windows x64 部署器、AutoCAD 插件 DLL 和字体资源。具体变化由本候选的源码、CHANGELOG 和本说明共同审阅。

## 更新内容

发行资产采用同一源码提交构建和校验。部署器的更新检查使用 splrad/LayerScape 正式发行，并核对版本、产品来源清单及七件附件；GitHub 无法访问时才尝试 Gitee 镜像。

## 兼容性

产品目标为 Windows x64 和 AutoCAD 2018 至 2027。各宿主项目沿用原目标框架及 API 分支。已有本地构建证据覆盖十个宿主项目；新系列在真实 AutoCAD 进程中的逐版本加载、字体替换和迁移仍须单独验收。

## 升级与迁移

旧 9.x 部署器不会自动提示降版到 1.0.0，需手动从 GitHub Releases 下载已公开的首发资产。关闭 AutoCAD，备份原 DLL、自定义字体、对应用户配置的 FixedProfile.aws 和当前用户下各 AutoCAD 配置的 Applications\AFR-ACAD20xx 注册表项，记录字体选择与自定义路径。用新部署器向原路径安装，保留已有设置；不要先卸载旧版，因为卸载会清除插件配置。按 README 的“9.x 手动迁移与恢复”步骤逐宿主核验。

## 安装说明

普通用户使用 AFR-Deployer_v1.0.0.exe；手工部署使用同一 Release 的 AFR-DLL_v1.0.0.zip，字体资源来自 Fonts.zip。配套附件为 sbom.spdx.json、release-notes.md、artifact-manifest.json 和 SHA256SUMS，共七件。先核对摘要，再按 README 安装或 NETLOAD 对应宿主 DLL。GHCR 和 WinGet 的可用状态以实际渠道验收为准。

## 已知问题

本地构建和发布合同检查不能代替真实 AutoCAD 宿主验收。新系列的逐宿主运行、旧 9.x 手动迁移和用户备份恢复仍待实际验证。Gitee 由维护者另行镜像，可能晚于 GitHub。

## 恢复

1.0.0 是新系列首发，没有前一正式版本可供下载恢复。撤销迁移时关闭 AutoCAD，卸载本次安装，恢复自己的原 DLL、字体和 FixedProfile.aws 备份，再导入对应宿主的注册表备份并核对 LOADER 路径。以图纸副本验证加载、字体选择和显示；确认前不保存工作图纸。后继版本的恢复目标须在对应候选中按实际已验发行更新。
