# SPLRAD Copilot 代码审查补充说明

## Code Review Rules

### copilot.inline-findings
- 可执行问题使用 GitHub 行内评论，并保留平台需要的文件级摘要结构。
  Safe path: 共同语言和证据要求直接继承根 AGENTS.md，补充说明只保留 Copilot 平台的评论结构。

### copilot.review-scope
- 审查范围覆盖正确性、可维护性、测试缺口、API 使用、兼容性和路径惯例。
  Safe path: 按当前差异和仓库事实判断，不根据另一审查平台返回的严重级别缩小覆盖范围。
