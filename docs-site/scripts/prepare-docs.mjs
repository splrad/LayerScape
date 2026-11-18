import {readFile,writeFile,mkdir,copyFile,realpath,rm,lstat} from 'node:fs/promises';
import {dirname,resolve,relative,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import {visit} from 'unist-util-visit';
import {parseFragment} from 'parse5';
import parseSrcset from 'parse-srcset';
import {slug} from 'github-slugger';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),repository=resolve(root,'..');
const sourceRoutes=new Map([['README.md','/guide/'],['docs/autodesk-fonts.md','/fonts/'],['SUPPORT.md','/support/'],['CHANGELOG.md','/downloads/']]);
const productPages=[
  {id:'guide',file:'overview',title:'使用指南'},
  {id:'modules',file:'modules',title:'功能介绍'},
  {id:'downloads',file:'downloads',title:'下载插件'},
].map(page=>({...page,source:`docs/product/${page.file}.md`}));
for(const page of productPages)sourceRoutes.set(page.source,`/${page.id}/`);
const readmeSections={
  guide:['功能','AFR · 缺失字体自动替换'],
  install:['快速开始','推荐：部署工具一键安装','单 DLL 手动安装'],
  usage:['首次配置与验证','手动替换','AFR 命令说明'],
  migration:['9.x 手动迁移与恢复'],
  compatibility:['兼容范围'],
  faq:['AFR 常见问题'],
  community:['反馈与建议','报告问题','提出功能建议','联系作者'],
  fonts:['📜 字体来源声明'],
  support:['☕ 支持项目'],
};
export const legacyRoutes=Object.fromEntries(Object.entries(readmeSections).flatMap(([route,labels])=>labels.map(label=>[slug(label),'/'+route+'/#'+encodeURIComponent(slug(label))])));
for(const label of readmeSections.guide)legacyRoutes[slug(label)]='/modules/#'+encodeURIComponent(slug('AFR · 缺失字体自动替换'));
const check=(ok,code)=>{if(!ok)throw Error('DOCS_'+code);};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const parser=()=>unified().use(remarkParse).use(remarkGfm);
const text=node=>typeof node.value==='string'?node.value:(node.children??[]).map(text).join('');
export function section(markdown,label) {
  const headings=parser().parse(markdown).children.filter(n=>n.type==='heading'&&n.depth===2);
  const matches=headings.filter(n=>text(n)===label);check(matches.length===1,'SECTION');
  const selected=matches[0],i=headings.indexOf(selected);
  return markdown.slice(selected.position.start.offset,headings[i+1]?.position.start.offset??markdown.length).trim();
}
export function subsection(markdown,label) {
  const headings=parser().parse(markdown).children.filter(n=>n.type==='heading');
  const found=headings.filter(n=>text(n)===label);check(found.length===1,'SUBSECTION');
  const selected=found[0],next=headings.find(n=>n.position.start.offset>selected.position.start.offset&&n.depth<=selected.depth);
  return markdown.slice(selected.position.start.offset,next?.position.start.offset??markdown.length).trim();
}
export function releaseNotes(markdown) {
  const nodes=parser().parse(markdown).children;
  const excerpts=[];
  let version;
  for (const [index,node] of nodes.entries()) {
    if (node.type!=='heading') continue;
    if (node.depth===1) version=undefined;
    if (node.depth===2) version=/^v?\d+\.\d+\.\d+\b/.test(text(node)) ? node : undefined;
    if (!version || node.depth!==3 || text(node)!=='插件使用说明') continue;
    const end=nodes.slice(index+1).find(next=>next.type==='heading' && next.depth<=3);
    const body=markdown.slice(node.position.end.offset,end?.position.start.offset??markdown.length).trim();
    if (body) excerpts.push(markdown.slice(version.position.start.offset,version.position.end.offset)+'\n\n'+body);
  }
  return excerpts.join('\n\n');
}
export function landingData(readme) {
  const tree=parser().parse(readme),featureTree=parser().parse(section(readme,'功能'));
  const intro=tree.children.find(n=>n.type==='paragraph'&&text(n).startsWith('LayerScape 的所有功能'));
  const featureIntro=featureTree.children.find(n=>n.type==='paragraph');
  const featureTable=featureTree.children.find(n=>n.type==='table');
  const commandTable=parser().parse(section(readme,'AFR 命令说明')).children.find(n=>n.type==='table');
  const imagePattern=/<img\b[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g;
  const images=Array.from(readme.matchAll(imagePattern)).map(m=>({src:'/media/'+m[1],alt:m[2]}));
  const title=images.find(i=>i.src.includes('layerscape-hero'))?.alt.split('，')[1];
  const compatibility=readme.match(/<details id="兼容范围">([\s\S]*?)<\/details>/)?.[1];
  check(intro&&featureIntro&&featureTable&&commandTable&&title&&compatibility,'LANDING_SOURCES');
  const screenshots=['layerscape-deployer.jpg','afr-font-config.jpg','afr-log.jpg'].map(name=>images.find(i=>i.src==='/media/chore/assets/readme/'+name));
  check(screenshots.every(Boolean),'PRODUCT_SCREENSHOTS');
  return {title,intro:text(intro),featureTitle:text(featureTree.children.find(n=>n.type==='heading'&&n.depth===3)),featureIntro:text(featureIntro),
    features:featureTable.children[1].children.map((cell,i)=>({title:text(featureTable.children[0].children[i]),body:text(cell)})),
    commands:commandTable.children.slice(1).map(row=>({name:text(row.children[0]),body:text(row.children[1])})),
    screenshots,
    compatibility,legacyRoutes};
}
export function productData(markdown) {
  const nodes=label=>parser().parse(section(markdown,label)).children;
  const paragraphs=label=>nodes(label).filter(n=>n.type==='paragraph').map(text);
  const rows=label=>{
    const table=nodes(label).find(n=>n.type==='table');check(table&&table.children.length>1,'PRODUCT_TABLE');
    return table.children.slice(1).map(row=>row.children);
  };
  const links=label=>rows(label).map(cells=>{
    const link=cells[2]?.children.find(n=>n.type==='link');check(cells.length===3&&link,'PRODUCT_LINK');
    const path=new URL(link.url,'https://source.invalid/docs/product/overview.md');
    const source=decodeURIComponent(path.pathname.slice(1));
    const href=source==='README.md'&&path.hash?legacyRoutes[slug(decodeURIComponent(path.hash.slice(1)))]:sourceRoutes.get(source);
    check(path.origin==='https://source.invalid'&&href,'PRODUCT_ROUTE');
    return {title:text(cells[0]),description:text(cells[1]),href,action:text(link)};
  });
  const [title,intro]=paragraphs('产品介绍');
  const downloadNote=paragraphs('下载提示')[0];
  check(title&&intro&&downloadNote,'PRODUCT_OVERVIEW');
  return {title,intro,downloadNote,
    scenesTitle:'从打开图纸，到核对文字',scenesIntro:paragraphs('从打开图纸，到核对文字')[0],scenes:links('从打开图纸，到核对文字'),
    stepsTitle:'三步开始使用',stepsIntro:paragraphs('三步开始使用')[0],steps:links('三步开始使用'),
    moduleTitle:'缺失字体，自动处理',moduleIntro:paragraphs('缺失字体，自动处理')[0],
    paths:links('常用指南'),pathsIntro:paragraphs('常用指南')[0],
    feedbackTitle:'遇到问题，告诉我们',feedbackIntro:paragraphs('遇到问题，告诉我们')[0]};
}
const attribute=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function presentUserMarkdown(markdown,route) {
  if(!['modules','install','guide','usage'].includes(route))return markdown;
  const edits=[];
  const arrow='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
  for(const node of parser().parse(markdown).children) {
    if(route==='guide'&&node.type==='table') {
      const label=text(node.children[0].children[0]);
      const kind={'使用场景':'scenarios','步骤':'steps','指南':'links'}[label];
      if(!kind)continue;
      const tag=kind==='steps'?'ol':'ul';
      const rows=node.children.slice(1).map(row=>{
        const [title,description,action]=row.children;
        const link=action?.children.find(n=>n.type==='link');check(row.children.length===3&&link,'READING_TASK_LINK');
        return '<li><a href="'+attribute(link.url)+'"><strong>'+attribute(text(title))+'</strong><p>'+attribute(text(description))+'</p><span class="doc-route-action">'+attribute(text(link))+arrow+'</span></a></li>';
      });
      edits.push({start:node.position.start.offset,end:node.position.end.offset,value:'<'+tag+' class="doc-route-list doc-route-'+kind+'" role="list">'+rows.join('')+'</'+tag+'>'});
    }
    if(node.type==='paragraph'&&node.children.length===1&&node.children[0].type==='image') {
      const image=node.children[0],src=attribute(image.url),alt=attribute(image.alt??'产品界面');
      const value='<figure class="doc-screenshot"><a href="'+src+'" data-image-viewer data-caption="'+alt+'" aria-label="放大查看：'+alt+'"><img src="'+src+'" alt="'+alt+'" loading="lazy" decoding="async" /><span class="doc-image-action" aria-hidden="true">查看大图'+arrow+'</span></a><figcaption>'+alt+'</figcaption></figure>';
      edits.push({start:node.position.start.offset,end:node.position.end.offset,value});
    }
  }
  for(const edit of edits.sort((a,b)=>b.start-a.start))markdown=markdown.slice(0,edit.start)+edit.value+markdown.slice(edit.end);
  return markdown;
}
export function rewriteHtml(fragment,map) {
  const tree=parseFragment(fragment,{sourceCodeLocationInfo:true}),edits=[];
  function walk(node) {
    const end=node.tagName==='summary'?node.sourceCodeLocation?.endTag?.endOffset:null;
    if(end&&fragment.slice(end).trim()&&!/^\s*\n\s*\n/.test(fragment.slice(end)))edits.push({start:end,end,value:'\n\n'});
    for(const a of node.attrs??[])if(['href','src','srcset'].includes(a.name)) {
      const location=node.sourceCodeLocation?.attrs?.[a.name];if(!location)continue;
      let value;
      if(a.name==='srcset') {
        const candidates=parseSrcset(a.value);check(candidates.length>0,'SRCSET');
        value=candidates.map(c=>map(c.url,true)+(c.w?` ${c.w}w`:c.d?` ${c.d}x`:'' )).join(', ');
      } else value=map(a.value,a.name==='src');
      edits.push({start:location.startOffset,end:location.endOffset,value:`${a.name}="${attribute(value)}"`});
    }
    for(const child of node.childNodes??[])walk(child);
  }
  walk(tree);
  for(const e of edits.sort((a,b)=>b.start-a.start))fragment=fragment.slice(0,e.start)+e.value+fragment.slice(e.end);
  return fragment;
}
export async function projectMarkdown(markdown,source,{ref='main',media=new Set()}={}) {
  check(ref==='main'||/^[a-f0-9]{40}$/.test(ref),'SOURCE_REF');
  check(sourceRoutes.has(source),'SOURCE_FILE');
  const map=(value,image=false)=>{
    if(/^(?:https?:|mailto:|tel:)/i.test(value))return value;
    check(!/^[a-z][a-z0-9+.-]*:/i.test(value)&&!value.startsWith('//')&&!value.includes('\\'),'URL');
    const url=new URL(value,`https://source.invalid/${source}`),path=decodeURIComponent(url.pathname.slice(1));
    check(!path.split('/').some(part=>['.git','..','.'].includes(part))&&!/[\\\0-\x1f]/.test(path),'PATH');
    const fragment=url.hash?'#'+encodeURIComponent(slug(decodeURIComponent(url.hash.slice(1)))):'';
    if(path==='README.md'&&fragment&&legacyRoutes[slug(decodeURIComponent(url.hash.slice(1)))])return legacyRoutes[slug(decodeURIComponent(url.hash.slice(1)))];
    if(sourceRoutes.has(path))return sourceRoutes.get(path)+fragment;
    if(image) {
      check(path.startsWith('chore/assets/')&&/\.(?:png|jpe?g|gif|webp|svg)$/i.test(path),'IMAGE_PATH');
      media.add(path);return '/media/'+path.split('/').map(encodeURIComponent).join('/')+url.search+fragment;
    }
    return `https://github.com/splrad/LayerScape/blob/${ref}/${path.split('/').map(encodeURIComponent).join('/')}${url.search}${url.hash}`;
  };
  const plugin=()=>tree=>{
    const images=new Set();visit(tree,'imageReference',n=>images.add(n.identifier));
    visit(tree,node=>{
      if(['link','image','definition'].includes(node.type))node.url=map(node.url,node.type==='image'||node.type==='definition'&&images.has(node.identifier));
      if(node.type==='html')node.value=rewriteHtml(node.value,map);
    });
  };
  return String(await parser().use(plugin).use(remarkStringify,{bullet:'-',fences:true}).process(markdown));
}
export async function projectPage(parts,options) {
  const rendered=[];
  for(const part of parts){
    const body=await projectMarkdown(part.body,part.source,options);
    rendered.push(part.presentation==='note'?body.replace(/^## [^\n]+\n\n/,'').trim().split('\n').map(line=>'> '+line).join('\n')+'\n':body);
  }
  return rendered.join('\n');
}
export async function prepare() {
  const readme=await readFile(resolve(repository,'README.md'),'utf8'),fonts=await readFile(resolve(repository,'docs/autodesk-fonts.md'),'utf8');
  const changelog=await readFile(resolve(repository,'CHANGELOG.md'),'utf8'),support=await readFile(resolve(repository,'SUPPORT.md'),'utf8');
  const productSources=Object.fromEntries(await Promise.all(productPages.map(async p=>[p.source,await readFile(resolve(repository,p.source),'utf8')])));
  const overview=productSources['docs/product/overview.md'];
  const fontSource=section(readme,'📜 字体来源声明'),landing=landingData(readme),history=releaseNotes(changelog);
  landing.product=productData(overview);
  landing.title=landing.product.title;landing.intro=landing.product.intro;
  const part=(label)=>({source:'README.md',selection:label,body:subsection(readme,label)});
  const pages=[{id:'index',title:landing.title,source:'docs/product/overview.md',parts:[{source:'docs/product/overview.md',selection:'document',body:overview},{source:'README.md',selection:'document',body:readme}],ext:'mdx'},
    ...productPages.map(p=>({...p,parts:[{source:p.source,selection:'document',body:productSources[p.source]},...(p.id==='downloads'&&history?[{source:'CHANGELOG.md',selection:'版本条目',body:history}]:[])]})),
    {id:'install',title:'安装与快速开始',source:'README.md',parts:[part('推荐：部署工具一键安装'),part('单 DLL 手动安装')]},
    {id:'usage',title:'使用 AFR',source:'README.md',parts:[part('首次配置与验证'),part('手动替换'),part('AFR 命令说明')]},
    {id:'migration',title:'从旧版迁移',source:'README.md',parts:[part('9.x 手动迁移与恢复')]},
    {id:'compatibility',title:'兼容性与运行环境',source:'README.md',parts:[{source:'README.md',selection:'兼容范围',body:landing.compatibility}]},
    {id:'faq',title:'常见问题',source:'README.md',parts:[part('AFR 常见问题')]},
    {id:'community',title:'问题反馈',source:'README.md',parts:[part('反馈与建议')]},
    {id:'fonts',title:'字体资源与来源',source:'docs/autodesk-fonts.md',parts:[{source:'docs/autodesk-fonts.md',selection:'document',body:fonts},
      {source:'README.md',selection:'📜 字体来源声明',body:fontSource}]},
    {id:'support',title:'支持项目',source:'SUPPORT.md',parts:[{source:'SUPPORT.md',selection:'document',body:support}]}];
  const media=new Set(['chore/assets/readme/layerscape-icon.png']),output=resolve(root,'src/content/docs'),mediaOutput=resolve(root,'public/media');
  const ref=process.env.DOCS_SOURCE_SHA??'main',rendered=new Map(),pageSources={};
  for(const p of pages) {
    if(['install','usage','migration','compatibility'].includes(p.id))p.parts.unshift({source:'docs/product/overview.md',selection:'现有版本阅读提示',body:section(overview,'现有版本阅读提示'),presentation:'note'});
    let body=await projectPage(p.parts,{ref,media});
    if(productPages.some(page=>page.id===p.id))body=body.replace(/^# [^\n]+\n/,'');
    let extra='';
    if(p.id==='index') {
      extra='template: splash\nhero:\n  title: '+JSON.stringify(landing.title)+'\n';
      body="import LandingSections from '../../components/LandingSections.astro';\n\n<LandingSections />\n";
    }
    if(p.id==='fonts') {
      const fontCode=parser().parse(fonts).children.find(n=>n.type==='code'&&n.lang==='text');check(fontCode,'FONT_CATALOGUE');
      landing.fonts=fontCode.value.split(/\r?\n/).filter(Boolean);
      const catalogue='<section class="font-catalogue" aria-label="原版 SHX 字体文件"><div class="font-filter"><label for="font-query">查找字体文件</label><input id="font-query" type="search" placeholder="例如：romans.shx" autocomplete="off" /><span id="font-count" role="status" aria-live="polite">'+landing.fonts.length+' 个文件</span></div><ul class="font-files">'+landing.fonts.map(font=>'<li><code>'+attribute(font)+'</code></li>').join('')+'</ul><p id="font-empty" hidden>没有匹配的字体文件，请尝试其他名称。</p></section>';
      const oldHeading=parser().parse(fonts).children.find(n=>n.type==='heading');
      body=body.replace(/^# [^\n]+\n/,'<span id="'+slug(text(oldHeading))+'"></span>\n').replace(/```text\n[\s\S]*?```/,catalogue);
    }
    if(['install','usage','migration'].includes(p.id))body=body.replace(/^### /gm,'## ');
    if(p.id==='migration')body=body.replace(/^#### /gm,'### ');
    if(p.id==='install')body='<span id="快速开始"></span>\n\n'+body;
    if(p.id==='support')body='<span id="-支持项目"></span>\n\n'+body.replace(/^# ([^\n]+)\n/,(_,title)=>'<span id="'+slug(title)+'"></span>\n');
    if(p.id==='compatibility')body=body.replace(/<summary>[\s\S]*?<\/summary>/,'## 兼容范围\n');
    body=presentUserMarkdown(body,p.id);
    const frontmatter=`---\ntitle: ${JSON.stringify(p.title)}\n${extra}editUrl: false\n---\n\n`;
    const file=p.id+'.'+(p.ext??'md');rendered.set(file,frontmatter+body);
    const introSources=({modules:['缺失字体，自动处理'],install:['三步开始使用'],usage:['从打开图纸，到核对文字','三步开始使用'],faq:['常用指南'],downloads:['下载提示'],compatibility:['常用指南'],fonts:['常用指南'],community:['遇到问题，告诉我们']}[p.id]??[])
      .map(selection=>({source:'docs/product/overview.md',selection,body:section(overview,selection),presentation:'page-introduction'}));
    pageSources[p.id==='index'?'/':'/'+p.id+'/']={
      generatedFile:'src/content/docs/'+file,generatedSha256:hash(frontmatter+body),
      sources:[...p.parts,...introSources].map(part=>({path:part.source,selection:part.selection,...(part.presentation?{presentation:part.presentation}:{}),contentSha256:hash(part.body)})),
    };
  }
  rendered.set('404.md','---\ntitle: 页面未找到\neditUrl: false\n---\n\n[返回首页](/)或使用顶部搜索查找内容。\n');
  const assets=new Map(),sources={'README.md':hash(readme),'docs/autodesk-fonts.md':hash(fonts),'SUPPORT.md':hash(support),'CHANGELOG.md':hash(changelog)};
  for(const [path,body] of Object.entries(productSources))sources[path]=hash(body);
  for(const path of media) {
    const from=await realpath(resolve(repository,path));check(from.startsWith(repository+sep),'IMAGE_ESCAPE');
    for(let at=resolve(repository,path);at!==repository;at=dirname(at))check(!(await lstat(at)).isSymbolicLink(),'IMAGE_SYMLINK');
    check((await lstat(from)).isFile(),'IMAGE_FILE');
    assets.set(path,from);sources[path]=hash(await readFile(from));
  }
  // Only these generated directories are replaceable; product Markdown is never written.
  for(const [directory,parts] of [[output,['src','content','docs']],[mediaOutput,['public','media']]]) {
    check(relative(root,directory)===parts.join(sep),'OUTPUT');
    for(let at=directory;at!==root;at=dirname(at)) {
      try {check(!(await lstat(at)).isSymbolicLink(),'OUTPUT_SYMLINK');}catch(error){if(error.code!=='ENOENT')throw error;}
    }
    await rm(directory,{recursive:true,force:true});await mkdir(directory,{recursive:true});
  }
  for(const [file,body] of rendered)await writeFile(resolve(output,file),body);
  for(const [path,from] of assets){const to=resolve(mediaOutput,path);await mkdir(dirname(to),{recursive:true});await copyFile(from,to);}
  await mkdir(resolve(root,'public'),{recursive:true});
  await mkdir(resolve(root,'src/generated'),{recursive:true});
  const generatedData=JSON.stringify(landing,null,2)+'\n';
  await writeFile(resolve(root,'src/generated/site-data.json'),generatedData);
  await writeFile(resolve(root,'public/source-digest.json'),JSON.stringify({schemaVersion:1,sourceSha:ref,sources:Object.fromEntries(Object.entries(sources).sort()),pages:pageSources,generatedData:{path:'src/generated/site-data.json',sha256:hash(generatedData)}},null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,media:media.size}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await prepare();
