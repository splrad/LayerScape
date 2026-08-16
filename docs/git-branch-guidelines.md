# Git分支与拉取请求规则

## 基本原则

- 从`main`创建短期分支；禁止直接推送本地`main`。
- 一个分支只处理一个问题或一组紧密相关的改动。
- 不把无关格式化、重命名、重构和功能修复混入同一拉取请求。
- 不提交本地日志、临时文件、构建产物、发布包、客户数据、访问令牌或密钥。

## 分支名称

分支名只使用小写英文、数字、斜线和连字符：`feature/<topic>`、`bugfix/<topic>`、`docs/<topic>`、`refactor/<topic>`、`perf/<topic>`或`chore/<topic>`。

## 组织成员

组织成员把分支推送到`LayerScape`仓库后，由`SPLRAD Steward`创建或更新目标为`main`的唯一拉取请求，生成中文标题和正文，并请求Copilot审查。贡献者检查自动摘要，在“人工补充”中填写自动内容没有覆盖的验证结果或环境限制。

## 外部贡献者

外部贡献者把修改推送到自己的派生仓库，再从代码托管平台页面手工创建指向`splrad/LayerScape:main`的拉取请求。Steward不修改派生仓库，但会在原始仓库的拉取请求上执行分类和中央验证。外部贡献者按组织模板手工填写摘要、改动内容和验证情况。

## 提交和本地验证

提交信息使用简短约定式格式，例如`docs: improve developer guide`、`fix: handle missing bigfont fallback`或`refactor: isolate shx lookup`。项目不要求`Signed-off-by`，也不运行DCO检查。

文档改动运行`git diff --check`。单个插件、部署器或共享代码改动按[开发者指南](developer-guide.md)运行对应命令，并在拉取请求“人工补充”中如实写明已运行命令、AutoCAD版本和未覆盖环境。

## 审查和合并

- 中央分类和中央验证必须成功。
- 至少一名`Maintainers`团队成员批准；有新提交时旧批准自动失效。
- 所有审查对话必须解决。
- Copilot意见不是维护者批准。
- 只有`Maintainers`团队成员执行压缩合并；不自动合并。
- 合并后由平台删除没有被其他开放拉取请求使用的来源分支。
