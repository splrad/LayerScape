## 概述

本次发布聚焦于 LayerScape 正式交付链与安装体验统一：新增部署工具并将插件安装管理统一到同一入口，文档同时给出面向 AutoCAD 2018–2027 的兼容说明与使用路径。

## 更新内容

功能侧新增了 deployer 工具，扩展 AutoCAD 2018-2027 支持，并补充关于窗口、对话框抑制检测、CAD 元数据 JSON 复制等能力；同时接入产品交付链，并在发布流程中增加渠道预检、受控依赖更新入口与多项渠道只读诊断/元数据修复。

## 兼容性

README 当前声明兼容范围为 AutoCAD 2018–2027，对应运行环境分别覆盖 .NET Framework 4.6.2、4.7.2、4.8，以及 .NET 8.0、10.0。该兼容信息来自文档声明，未在本资料中看到独立验证记录。

## 升级与迁移

9.x 迁移到新系列时，文档建议手动从 Releases 获取安装包；旧 9.x 部署器按版本大小检查更新，不会提示降版到 1.0.0。迁移前应备份 DLL、Fonts、自定义 FixedProfile.aws 与注册表 Applications\AFR-ACAD20xx 项，并在新部署器安装后逐个 AutoCAD 用图纸副本核对 AFR/AFRLOG 与字体显示。

## 安装说明

推荐安装方式是运行 AFR-Deployer_vX.Y.Z.exe：先关闭全部 AutoCAD，再由工具扫描版本并执行安装；文档说明安装过程会复制对应 DLL、写入自动加载项、释放内嵌字体并写入 FixedProfile.aws。发布资产清单包含 AFR-Deployer_v${version}.exe、AFR-DLL_v${version}.zip、Fonts.zip。

## 已知问题

已知限制（按文档说明）：单 DLL 手动 NETLOAD 不支持自动抑制“缺少 SHX 文件”弹窗；AFRUNLOAD 不参与自动补全，需完整输入；若图纸正文字符已被错误编码保存，字体替换无法恢复原文。

## 恢复

需要回退时，文档给出的流程是：关闭 AutoCAD，使用部署器卸载本次安装，恢复备份的 DLL/字体/FixedProfile.aws，导入对应注册表备份并核对 LOADER 指向原 DLL，最后用图纸副本复验。另据文档说明，1.0.0 为新系列首发，无前一正式版本可直接下载恢复。
