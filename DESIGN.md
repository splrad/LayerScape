---
name: "LayerScape 网站"
description: "以真实产品界面为主体、连接清晰阅读路径的网站视觉系统。"
colors:
  violet: "#6654c7"
  violet-hover: "#5140ae"
  accent-light: "#5b48b5"
  accent-low-light: "#eeebfb"
  accent-high-light: "#44358d"
  violet-dark: "#b4a5ff"
  accent-low-dark: "#302b4c"
  accent-high-dark: "#e2dafa"
  feature-indigo: "#242d50"
  feature-copy: "#c7cfe8"
  paper: "#fff"
  canvas-light: "#f6f5fb"
  ink-light: "#20243a"
  muted-light: "#5a6078"
  border-light: "#e5e4ed"
  panel-light: "#efedf7"
  paper-dark: "#181c2b"
  canvas-dark: "#232a3f"
  ink-dark: "#eff0fa"
  muted-dark: "#bdc2d6"
  border-dark: "#3c435b"
  panel-dark: "#2b3247"
typography:
  display:
    fontFamily: "'LayerScape Display','LayerScape Text','Segoe UI','Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "clamp(2.25rem,3.45vw,3.1rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-.03em"
  headline:
    fontFamily: "'LayerScape Display','LayerScape Text','Segoe UI','Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "2.35rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-.025em"
  title:
    fontFamily: "'LayerScape Display','LayerScape Text','Segoe UI','Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "2rem"
    lineHeight: 1.4
    letterSpacing: "-.025em"
  reading-heading:
    fontFamily: "'LayerScape Text','Segoe UI','Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "1.55rem"
    fontWeight: 650
    letterSpacing: "-.015em"
  body:
    fontFamily: "'LayerScape Text','Segoe UI','Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "'LayerScape Text','Segoe UI','Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: ".9rem"
    fontWeight: 500
  button:
    fontFamily: "'LayerScape Text','Segoe UI','Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: ".95rem"
    fontWeight: 600
rounded:
  control: "6px"
  button: "8px"
  reading-container: "10px"
  download-container: "14px"
  community-container: "16px"
  gallery: "16px"
spacing:
  action-gap: ".75rem"
  inset: "1rem"
  control-inline: "1.25rem"
  reading-gap: "1.5rem"
  section-gap: "2rem"
  column-gap: "2.5rem"
  section-inline: "3rem"
  section-block: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: ".6rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.violet-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-light}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: ".6rem 1.25rem"
  button-secondary-hover:
    backgroundColor: "{colors.canvas-light}"
  font-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.control}"
    padding: ".6rem .8rem"
    width: "100%"
  site-nav-link:
    textColor: "{colors.muted-light}"
    typography: "{typography.label}"
  download-entry:
    backgroundColor: "{colors.canvas-light}"
    rounded: "{rounded.download-container}"
    padding: "1.6rem"
  guide-link:
    textColor: "{colors.ink-light}"
    padding: "1.5rem .2rem"
  reading-details:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.reading-container}"
    padding: "1rem 1.2rem"
---

# Design System: LayerScape 网站

## Overview

**Creative North Star: "产品展厅与文档书库"**

LayerScape 网站以真实产品界面、清楚的中文标题和有余量的留白建立秩序。白色与淡薰衣草色连续承载内容，紫罗兰色标明可以采取的行动。圆角温和，界面保持实用软件的清晰感。

展示区域允许更大的标题、截图和段落间距；阅读区域以稳定正文、浅色底面和明确导航支持持续查阅。明暗主题共享结构和控件语言，颜色随主题切换。本文件只约束 docs-site 网站，不定义 Windows 或 AutoCAD 产品界面。

**Key Characteristics:**

- 白色和淡薰衣草构成连贯分区；紫罗兰色强调操作。
- 本地中文无衬线字体，标题明确，正文疏朗。
- 真实截图保持完整比例，内容区域主要以底色和细分隔线划分。
- 小圆角控件、可见焦点和可横向滚动的数据表格。

记录依据为 `docs-site/src/styles/site.css`、`docs-site/src/components/` 和本地字体描述文件。已有表面方向见 `.impeccable/surfaces/docs-site.md`。这是当前本地实现的视觉记录；发布与验收状态见独立验证报告。

## Colors

色彩以冷白和浅紫灰构成层次，操作色保持清楚且集中。frontmatter 的颜色为实际取值；组件映射以浅色主题为基准，主题对应关系如下。

### Primary

- **紫罗兰行动色**（`violet`）：主按钮背景，也是浅色主题的交互强调色；按钮悬停使用 `violet-hover`。
- **阅读强调色**（`accent-light`、`accent-low-light`、`accent-high-light`）：Starlight 链接、选中导航底面与文字。
- **夜间淡紫色**（`violet-dark`、`accent-low-dark`、`accent-high-dark`）：深色主题的交互与选中状态；主按钮仍使用稳定的行动色和白字。

### Secondary

- **首页功能底面**：使用既有 `canvas-light` / `canvas-dark` 主题底色；标题和辅助文字使用对应的 `ink` 与 `muted`。`feature-indigo` / `feature-copy` 是保留的旧样式取值，当前首页不使用深色功能带。

### Neutral

| 语义角色 | 浅色主题 | 深色主题 | 使用位置 |
| --- | --- | --- | --- |
| 主底面 | `paper` | `paper-dark` | 页面、顶栏、输入及次级按钮 |
| 浅层底面 | `canvas-light` | `canvas-dark` | 阅读提示、表头、下载区域 |
| 主文字 | `ink-light` | `ink-dark` | 标题与正文 |
| 辅助文字 | `muted-light` | `muted-dark` | 说明、次级导航与图注 |
| 边界 | `border-light` | `border-dark` | 分隔线、输入与容器边缘 |
| 展台底面 | `panel-light` | `panel-dark` | 部署器展示底面 |

**The Theme Role Rule.** 主题切换使用现有语义变量成组替换背景、正文、辅助文字和边界；主按钮保留稳定的配色，首页底面随主题切换。

## Typography

**Display Font:** LayerScape Display，自托管 Noto Sans SC 粗体子集（700），随后回退到正文栈。
**Body Font:** LayerScape Text，自托管 Noto Sans SC 常规子集（400），随后为 Segoe UI、Microsoft YaHei UI、PingFang SC、sans-serif。

字体文件、Unicode 范围、来源与许可证位于 `docs-site/public/fonts/`。中等与半粗权重是现有 CSS 的排版请求；当前本地正文文件只提供常规字重，不能将其描述成已加载的独立 500/600/650 字体文件。代码字体沿用 Starlight 的等宽字体设置。

### Hierarchy

- **Display**（`display`）：首页主标题；逐行排布，保留中文组合的完整感。
- **Headline**（`headline`）：文档页主标题；手机端为（1.95rem）。
- **Title**（`title`）：展示区段落标题；手机端为（1.7rem）。
- **Reading heading**（`reading-heading`）：正文二级标题；三级标题为（1.15rem），权重（650）。
- **Body**（`body`）：连续阅读正文；导语可独立使用（1.05rem / 1.95），手机导语为（.95rem）。
- **Label / Button**（`label`、`button`）：导航与按钮的紧凑文字；不设整站固定比例尺。

首页主标题在桌面使用（clamp(2.25rem,3.45vw,3.1rem)），中间宽度使用（clamp(1.7rem,3.35vw,2.5rem)），手机使用（clamp(1.6rem,5.6vw,2.8rem)）。按中文逗号分为两行，第二行使用紫罗兰色；正文保持可读字号。

**The Readable Type Rule.** 展示标题和阅读正文各用自身层级；正文、文件名及表格内容的可读性决定缩放和溢出处理。

## Layout

网站复用 Astro/Starlight 的阅读框架。正文配置宽度为（45rem），侧栏宽度为（17rem），顶栏高为（5rem），手机顶栏为（4rem）。阅读区域按这一配置及 Starlight 的响应布局收缩。

展示区域采用居中的宽幅容器：顶栏最大宽度（1320px），首页主区、场景、上手与指南区最大宽度（1280px）。主区网格为（1.12fr / 1fr），桌面间距（3.5rem），纵向留白上（4.5rem）下（4rem），最小高度（568px）。浅紫底面贯穿首屏与三个功能入口，场景区回到白色，上手步骤复用浅紫。实际图片上限（472px），手机上限（320px）。功能入口为三个连接节点，场景区为左侧说明与右侧原生折叠列表，上手区为三列有序步骤。手机均转为单列。

现有响应边界为：桌面阅读内边距（min-width:1152px）；紧凑顶栏与展示调整（max-width:1150px）；手机单列和导航切换（max-width:799px）；更窄的截图、页签与字体筛选布局（max-width:430px）。手机主要章节改为纵向（3rem）、横向（1.5rem）内边距。断点值及条件记录于 sidecar。

普通数据表格保持自身横向滚动；手机单元格最小宽度为（10rem），代码和文件名不强制断开。实际溢出时显示滚动提示并让表格可聚焦；图片表格使用单独的手机堆叠规则。字体文件清单从三列改为两列，筛选输入在最窄断点改为单列。

## Elevation & Depth

首屏将真实部署器 UI 直接呈现在浅色底面上，以有偏移的柔和阴影分离图片与背景。截图保持平面和原始比例。轮廓品牌文字按自身实际宽度相对页面居中，字号为 clamp(48px,17vw,280px)；鼠标位移按两侧留白限制，减少动态效果时保留静态居中。功能节点通过单条细线连接，三步上手使用有序编号与连接线。滚动进度线作为导航栏子元素贴合栏内下边缘，不占用正文空间。阅读正文和翻页控件保持平稳。

### Shadow Vocabulary

- **放大提示**（`0 6px 18px -8px #24204055`）：图片右下角操作提示。
- **图片查看器**（`0 24px 80px -24px #080d25a6`）：全尺寸查看区域与页面分离。
- **手机展开导航**（`0 12px 20px -15px #20243a55`）：下拉导航与正文的边界。

**The Quiet Depth Rule.** 阅读内容用底色和细边界分层；柔和阴影用于图片查看器、放大提示和展开的手机导航。

## Shapes

控件采用温和圆角：输入和导航选中项使用 `control`；操作按钮使用 `button`；阅读折叠块和分页使用 `reading-container`。下载与社区容器采用对应圆角，首页截图链接为（12px）；图片查看器桌面为（16px），手机为（12px）。

分隔线通常为（1px）实线语义边界色。指南入口保留下边界，截图以 `object-fit:contain` 完整呈现；示例区域内的产品图像保持其原始比例。现有图标为内联 SVG 或真实品牌图标，不以字符图标替代。

## Components

### Buttons

清楚、紧凑、略带圆角。主按钮采用行动色和白字；次级按钮采用主底面、主文字与细边框，首页次按钮仍为主题主底面与正文色。内边距见 frontmatter，最小高度（46px）；首页首屏按钮最小高度为（50px）。颜色过渡（180ms）；首页主操作在精细指针悬停时上移（4px），按下时缩至（.98），箭头前进（4px），主按钮表面单次扫光（650ms）。所有链接与按钮使用强调色的（3px）焦点线，外偏移（4px）。

### Inputs / Fields

字体筛选使用带可见标签的输入、结果数量和空结果文字。输入采用主底面、语义边界、控件圆角；placeholder 使用辅助文字色。输入焦点复用全局焦点线，插入光标使用强调色。该字段是本地清单过滤，不是额外的全站搜索实现。

### Navigation

顶栏为紧凑品牌、水平链接、Starlight 搜索与主题入口。当前导航和悬停链接使用强调色；文档侧栏的当前项还具有选中底面与较高字重。手机首页改为可展开菜单，导航选择和 Escape 可关闭菜单。文档页继续使用 Starlight 原生导航与搜索。

### Product Showcase

首页只展示现有部署器的真实截图，直接消费 chore/assets/readme/layerscape-deployer.jpg。保留原始界面与全部内容，图片直接置于主题浅层底面，柔和阴影为（0 28px 56px -28px #44358d66）。图片按自身比例完整呈现；Astro 提供多尺寸 WebP，点击或键盘打开原始 JPEG。首屏不设置截图页签或独立说明行。规划信息由产品 Markdown 表达。

原生 dialog 保留适应窗口／原始尺寸、关闭、Escape、焦点返回与加载失败提示；无脚本时链接打开原图。鼠标悬停与键盘聚焦显示放大操作，触摸设备保留图标。字体模块以简洁的能力列表介绍，不在首页重复展示字体设置与日志截图。

### Guide Links / Download Container

指南入口采用标题、短说明和方向 SVG 组成的分隔行；悬停强调标题及箭头，保持整行链接。下载入口使用较大圆角浅底容器，行动按钮与说明并列；手机按钮占满可用宽度。

### Reading Details / Tables

折叠说明为细边框容器，展开后使用浅层底面，标题行保留原生 summary 行为。数据表格使用表头底色、行底线和等宽数字；滚动、焦点与提示按实际溢出启用。代码文本保持可复制的完整名称。

首页动效围绕一段完整的功能叙事：两行收益标题和真实 UI 采用横向遮罩揭示（780ms，错开 90/100ms），轮廓品牌文字在（900ms）内绘出。功能区首次进入视野（30%）时，连接线在（1000ms）内贯穿三个节点，1100ms 光点沿线传递并在指针进入或键盘聚焦功能区时响应；节点按（160ms）间隔着色并由（.8）经过（1.12）归位。使用场景展开采用（350ms）遮罩反馈；上手步骤的有序编号首次进入视野时横向揭示（650ms，间隔120ms）。品牌背景横向鼠标位移最多（28px），纵向滚动最多（85px），软件 UI 保持平面。按钮扫光、按下和箭头保持原有反馈。仅使用原生 WAAPI、IntersectionObserver 与 CSS。

默认 HTML/CSS 中所有正文和图片均可见；无脚本时仍可阅读并打开原图。没有常驻循环，指针与滚动按需请求帧；装饰层离开视野后复位，页面隐藏时取消正在播放的动画。`prefers-reduced-motion:reduce` 初始加载及运行时切换均关闭非必要空间动效，保留即时颜色、焦点和进度反馈。文档阅读页不加载此首页动效组件。

## Do's and Don'ts

### Do:

- Do 复用现有语义颜色变量，并一起检查明暗主题。
- Do 使用本地 LayerScape Display / LayerScape Text 字体及完整回退字体栈。
- Do 保留真实截图的比例、替代文字和来源记录。
- Do 为链接、按钮、输入和可滚动表格保留清晰的键盘焦点。
- Do 在窄屏保留文件名和命令的完整表达，并提供表格横向滚动。

### Don't:

- Don't 把首页的大标题和大留白直接套用到密集阅读正文。
- Don't 将产品展示渲染图冒充原始截图；渲染图的替代文字、查看器标题及来源记录须准确，保留原始截图入口，软件功能和正文事实仍以产品 Markdown 为准。
- Don't 仅用颜色区别页签和当前导航；保留语义状态与焦点行为。
- Don't 隐藏溢出的表格内容，或缩小文件名来强行塞入手机视口。



## 插件使用者文档结构 · 2026-11-03

首页先说明插件收益与自动处理、字体覆盖、人工复核三项功能，再呈现收到外部图纸、设置常用字体、检查替换结果三个具体场景，最后提供下载、安装、字体设置和图纸检查的上手路径。首屏主操作为下载插件，次操作为跳转到三步上手，兼容性链接帮助判断适用版本。场景使用原生 details，支持键盘展开；功能入口直接定位并展开对应场景。常用指南与问题反馈继续保留。

导航与侧栏按开始使用、日常使用和获取帮助组织。公开页面关闭源码编辑入口；内部架构、开发接入和实施计划保留在仓库，旧站点地址转向相应使用指南。功能页使用真实字体配置与日志截图，下载页说明安装包选择、暂无附件和旧版升级。所有正文依然来自产品 Markdown，当前发布范围以正式发行内容为准。

## 使用者阅读页 · 2026-11-03

首页已获用户定稿，后续阅读页工作保持首页源码、内容与真实 UI 不变。功能介绍、安装指南、使用指南及配置与结果检查页使用独立 reading.css；选择器限定阅读容器，不将首页动效带入文档。

页首浅紫底面限制在与正文同宽的标题卡片内，使用12px圆角、紧凑内边距；外围留白沿用页面背景。原生 PageTitle 和来自现有 Markdown 的导语下提供两个直接的任务入口。正文宽度 46rem，二级标题 1.45rem（手机1.3rem），正文保持 1.95 行高。安装和配置步骤用有序编号与细连接线；原有提醒保留完整文字，用浅色框分组。使用指南的三类源表格投影为场景链接、顺序步骤和双列常用任务，手机单列。数据表格保留原生语义与溢出提示。

功能页图片保持真实来源与完整比例，桌面高度上限400px、手机320px。浅色图片底面与图注明确所属操作，点击或键盘打开原图，复用现有图片查看器；无脚本时链接仍有效。目录、搜索、手机导航、代码复制和翻页继续使用 Starlight。阅读交互仅保留180ms箭头反馈及主题颜色状态。

阅读风格同时覆盖常见问题、下载、兼容性、字体资源、旧版迁移、问题反馈和支持项目。页首使用同一个阅读页定义，色块始终限制在正文列内。下载入口集中在标题卡片中，正文说明安装包选择、公开附件状态和升级路径。常见问题保留原生 details，通过整行点击、键盘焦点和转向箭头提示展开；答案面向使用者，命令、能力限制与操作提醒保留。

字体清单保留74项原名、过滤与空结果状态，桌面三列、手机两列。兼容性表格桌面铺满阅读列，手机保留横向滚动。迁移说明按下载、备份、安装检查和恢复分段，步骤与注意事项来自 README。问题反馈保留官方入口与联系信息；支持项目保留原始二维码、赞助自愿及功能不受影响的说明，并去掉重复的一级标题。首页和此前四个阅读页的正文保持定稿状态。

## 全站定稿与维护入口 · 2026-11-03

用户已确认整个文档站定稿。本文件记录当前源码的视觉参数和组件实现；定稿范围、插件使用者内容要求及后续维护规则的唯一规范正文为本地 SPLRAD_MASTER_IMPLEMENTATION_BASELINE.md §7.2.3。后续任务沿用本文件的已采用视觉系统，实际编辑、构建和来源核对操作见 docs-site/README.md。
