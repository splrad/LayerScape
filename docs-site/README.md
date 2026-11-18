# 文档站构建

使用中央 Steward 的已锁定 Node 环境，在本目录运行 `npm ci --ignore-scripts`、`npm test`、`npm run build`。`npm run preview` 提供本地静态预览；`npm run dev` 用于内容调整，搜索需以构建后的预览验证。

网站面向插件使用者。公开正文来自 `docs/product/overview.md`、`modules.md`、`downloads.md`、README 的安装与使用章节、CHANGELOG 的版本条目、SUPPORT 和 `docs/autodesk-fonts.md`。首页提取产品介绍、三步上手、功能说明和常用指南；操作与兼容事实保持来自产品 Markdown。内部架构、开发接入和演进计划不进入生成正文或 Pagefind。旧规划页面地址静态转向对应用户指南。修改产品 Markdown 后重新构建即可。

`scripts/prepare-docs.mjs` 使用 remark、parse5 和 parse-srcset 处理 Markdown、HTML、图片与链接。生成的 `src/content/docs`、`src/generated/site-data.json` 和 `public/media` 不入库；原始文档和图片保持原位。首页组件消费生成的数据，组件内只维护导航和交互文案。README 旧章节链接转向对应任务页面。字体清单的筛选只控制显示，不修改原始条目。依赖由本目录 package-lock 锁定，Dependabot 的 `/docs-site` 条目负责更新。

`src/components` 中的首页、页头和页脚通过 Starlight 原生覆盖接口接入；文档目录、章节导航、搜索和主题选择继续使用 Starlight。`src/styles/site.css` 定义浅色、深色与响应式布局。中文字体使用本地 Noto Sans SC 资源，许可证和来源摘要位于 `public/fonts`；运行时无需连接字体服务。新增正文字符不在现有字库分片内时由系统字体显示，可按相同许可证补入分片。

生产构建通过 `DOCS_SOURCE_SHA` 传入已经核验的完整提交 SHA，使源码文件链接绑定该提交。本地未传入时使用 main 链接。生成的 `source-digest.json` 保留正文源及本地图片摘要，在 `pages` 中记录每条页面路由对应的源文件、选取章节、选取内容摘要及生成 Markdown 摘要，并记录首页数据文件摘要。组合页面分别按每段原文件解析相对链接；下载帮助维护在 `docs/product/downloads.md`，CHANGELOG 各版本下的三级标题“插件使用说明”标记面向使用者的正文；构建提取该段及对应版本标题。Release Please 的仓库变更清单保留在 CHANGELOG。公开阅读页关闭源码编辑入口。该清单用于内容核对，部署身份和原生 Run 验收由 Pages 工作流负责。

## 辅助设计与本地预览

Sites 仅用于同一工程的辅助设计和本地预览。使用 Sites 技能时明确指定 `local-only`，保持 Astro/Starlight、产品 Markdown 正文和原生 Pagefind 搜索，采用的源码、样式和依赖锁留在本目录。工具不可用时继续通过本工程完成，不引入运行时依赖。

构建和预览无需 Sites 登录、凭据或云端版本。正常发布继续由 `.github/workflows/pages.yml` 执行。交付时记录实际源码和未提交差异、页面来源映射、干净副本构建，以及 1440px/768px/390px 下的导航、真实界面展示、搜索、字体筛选、深链接、图片、表格和主题结果；本地预览与生产部署分别取证。

首页只展示产品仓库中的实际部署器截图，CSS 提供背景、留白与阴影。Astro 生成响应式 WebP，放大入口打开原始 JPEG；来源与展示处理记录在 `src/assets/deployer-presentation.provenance.json`。字体模块以源自产品 Markdown 的能力列表呈现，实际字体配置和日志界面保留在功能介绍页中。

## 定稿版本的维护入口

2026-11-03用户确认全站定稿。定稿范围、读者与维护要求的唯一规范正文为本地 `SPLRAD_MASTER_IMPLEMENTATION_BASELINE.md` §7.2.3；`../DESIGN.md` 记录当前视觉参数。这里仅说明实际编辑入口。

- 正文：修改对应产品 Markdown，再执行现有生成与构建。FAQ 在产品 README，字体清单与说明在 `../docs/autodesk-fonts.md`，下载说明在 `../docs/product/downloads.md`；版本事实以公开发行内容为准。
- 阅读页：`src/data/reading-pages.ts` 维护路由与操作入口，导语引用生成的产品数据；`ReadingTitle.astro` 与 `MarkdownContent.astro` 负责原生覆盖；`src/styles/reading.css` 只作用于阅读页。页首色块保持正文列宽。
- 首页：已采用的 `LandingHero`、`LandingSections`、`LandingMotion` 与 `landing-motion.css` 是定稿实现。其他文档的维护使用限定作用域，避免改变首页或共享导航行为。
- 验证：按改动运行既有源转换测试和构建，在预览中核来源映射、链接与搜索，并实看受影响桌面/手机页面；宽度、主题或交互变化分别补相应窄屏/宽屏、明暗、键盘、无脚本与减少动态效果检查。保留准确源码、差异和代表截图，复用证据时核对其范围。

定稿确认、本地预览和正式发布分别记录。当前维护不新增第二份正文、专用搜索服务或辅助工具运行依赖，正式发布继续通过原生 Pages 工作流。
