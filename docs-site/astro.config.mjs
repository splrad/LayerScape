import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site:'https://layerscape.splrad.com',
  output:'static',
  redirects:{'/architecture/':'/compatibility/','/extend/':'/community/','/deployment/':'/install/','/roadmap/':'/downloads/'},
  integrations:[starlight({
    title:'LayerScape · 叠境',
    description:'LayerScape 插件使用指南：下载安装、缺失字体替换、字体配置、兼容性与常见问题',
    favicon:'/media/chore/assets/readme/layerscape-icon.png',
    defaultLocale:'root',
    locales:{root:{label:'简体中文',lang:'zh-CN'}},
    social:[{icon:'github',label:'GitHub',href:'https://github.com/splrad/LayerScape'}],
    sidebar:[
      {label:'开始使用',items:[{label:'使用指南',slug:'guide'},{label:'功能介绍',slug:'modules'},{label:'下载插件',slug:'downloads'},{label:'安装指南',slug:'install'},{label:'兼容性与运行环境',slug:'compatibility'}]},
      {label:'日常使用',items:[{label:'配置字体与查看结果',slug:'usage'},{label:'字体资源与来源',slug:'fonts'},{label:'旧版升级与恢复',slug:'migration'}]},
      {label:'获取帮助',items:[{label:'常见问题',slug:'faq'},{label:'问题反馈',slug:'community'},{label:'支持项目',slug:'support'}]},
    ],
    components:{Header:'./src/components/SiteHeader.astro',Hero:'./src/components/LandingHero.astro',Footer:'./src/components/SiteFooter.astro',MarkdownContent:'./src/components/MarkdownContent.astro',PageTitle:'./src/components/ReadingTitle.astro'},
    customCss:['./src/styles/site.css','./src/styles/reading.css'],
    tableOfContents:{minHeadingLevel:2,maxHeadingLevel:3},
  })],
});
