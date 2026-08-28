# SPLRAD 仓库说明

## Code Review Rules

### common.direct-evidence
- 只报告当前差异中有直接证据、会造成实际后果或违反明确仓库合同的问题。不得把人工智能审查、局部环境或未运行的测试表述为持续集成通过、批准或可以合并。
  Safe path: 说明受影响的行为和最小安全修正路径；证据不足时不发表评论。

### common.review-language-zh
- 模型生成的审查标题、摘要和行内意见必须使用简体中文。
  Safe path: 代码标识、文件路径、命令、日志原文、严重级别标签和平台固定字段保持原文；每条发现说明位置、实际影响和最小安全修正方向。

### layerscape.compatibility
- 改动不得破坏 AutoCAD 2018 至 2027、目标 .NET 版本、Windows/WPF 或版本特定 API 的兼容边界。
  Safe path: 保留明确的版本分支和受支持目标，并由对应 Windows 验证证明，不能用 Linux Cloud 结果代替。

### layerscape.user-data
- 字体、SHX、映射、路径或升级逻辑不得静默覆盖、丢失或错误迁移用户数据。
  Safe path: 保留现有配置和回退语义，对迁移进行可逆处理或显式确认，并验证发布资产与版本文件一致。
