import data from '../generated/site-data.json';

const product=data.product;
const description=(route:string)=>product.paths.find(path=>path.href.startsWith(route))?.description;
export const readingPages:Record<string,{intro?:string;links:{title:string;href:string}[]}>= {
  modules:{intro:product.moduleIntro,links:[{title:'安装插件',href:'/install/'},{title:'配置与使用',href:'/usage/'}]},
  install:{intro:product.steps[0].description,links:[{title:'下载安装包',href:'/downloads/'},{title:'核对兼容性',href:'/compatibility/'}]},
  guide:{intro:product.stepsIntro,links:[{title:'首次安装',href:'/install/'},{title:'已安装，开始配置',href:'/usage/'}]},
  usage:{intro:product.scenesIntro,links:[{title:'设置替换字体',href:product.steps[1].href},{title:'查看替换结果',href:product.steps[2].href}]},
  faq:{intro:description('/faq/'),links:[{title:'配置与使用',href:'/usage/'},{title:'仍有问题，反馈给我们',href:'/community/'}]},
  downloads:{intro:product.downloadNote,links:[{title:'前往 GitHub Releases',href:'https://github.com/splrad/LayerScape/releases'},{title:'安装指南',href:'/install/'}]},
  compatibility:{intro:description('/compatibility/'),links:[{title:'查看下载页面',href:'/downloads/'},{title:'安装指南',href:'/install/'}]},
  fonts:{intro:description('/fonts/'),links:[{title:'设置替换字体',href:product.steps[1].href},{title:'反馈字体问题',href:'/community/'}]},
  migration:{links:[{title:'查看下载页面',href:'/downloads/'},{title:'核对兼容性',href:'/compatibility/'}]},
  community:{intro:product.feedbackIntro,links:[{title:'报告使用问题',href:'https://github.com/splrad/LayerScape/issues/new?template=bug-report.yml'},{title:'提出功能建议',href:'https://github.com/splrad/LayerScape/discussions/new?category=ideas'}]},
  support:{links:[{title:'了解插件功能',href:'/modules/'},{title:'问题反馈',href:'/community/'}]},
};
