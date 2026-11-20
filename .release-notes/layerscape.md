## 概述

LayerScape v1.1.0 延续面向 CAD 的模块化交付方式，重点包含一次仓库配置请求入口新增，以及围绕发布附件与更新流程兼容性的修正。

## 更新内容

本次变更包含：新增“通过置顶 Issue 请求仓库配置”；修复“按产品配置发布 GitHub 附件并兼容既有更新器”；并更新了窗口/插件日志中的项目地址。另有文档与维护类更新（如 actions、deps、sdk 升级）主要面向仓库维护流程。

## 兼容性

兼容范围仍为 AutoCAD 2018–2027；对应运行环境覆盖 .NET Framework 4.6.2、4.7.2、4.8，以及 .NET 8.0、10.0。

## 升级与迁移

从 9.x 迁移到新系列时，需手动从 GitHub Releases 获取公开安装包，并在迁移前备份 DLL、Fonts、FixedProfile.aws 与相关注册表项；文档建议不要先卸载旧安装，以免清除插件配置节点。

## 安装说明

推荐安装方式为运行 AFR-Deployer_vX.Y.Z.exe；手动方式可下载 AFR-DLL_vX.Y.Z.zip 后按 AutoCAD 年份选择 DLL 并使用 NETLOAD。单 DLL 手动安装不支持自动抑制“缺少 SHX 文件”弹窗。

交付配置中定义的发布渠道为 GitHub Releases，资产包含 AFR-Deployer_v${version}.exe、AFR-DLL_v${version}.zip、Fonts.zip，并要求提供 SHA256SUMS 等元数据；本次实际发布页是否已完整提供上述附件未在现有资料中验证。

## 已知问题

已知限制包括：单 DLL/NETLOAD 场景无法自动抑制 SHX 缺失弹窗；当图纸正文字符已错误编码保存时，字体替换无法恢复原文；字体数量过多可能导致插件界面加载卡顿。

## 恢复

如需回退迁移，需先关闭 AutoCAD，再卸载本次安装并恢复已备份的 DLL、字体、FixedProfile.aws 和对应注册表项，同时核对 LOADER 指向原 DLL；该恢复流程的真实宿主验证范围以发行说明为准，当前资料未提供额外验证证据。
