import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectMarkdown,projectPage,rewriteHtml,section,subsection,legacyRoutes,landingData,productData,releaseNotes,presentUserMarkdown} from '../prepare-docs.mjs';
import {readFile} from 'node:fs/promises';

test('extract the exact source section without parsing headings inside fences',()=>{
  const input='# Product\n\n## 快速开始\n\n```md\n## example\n```\n\n### Step\n\nText\n\n## Other\n';
  assert.equal(section(input,'快速开始'),'## 快速开始\n\n```md\n## example\n```\n\n### Step\n\nText');
  assert.throws(()=>section(input,'Missing'),/DOCS_SECTION/);
  assert.throws(()=>section(input+'\n## 快速开始\n','快速开始'),/DOCS_SECTION/);
});
test('Markdown tables, code and details preserve source semantics',async()=>{
  const result=await projectMarkdown('| A | B |\n|---|---|\n| 字体 | `AFR` |\n\n<details>\n<summary>Details</summary>\n\nUse **AFRLOG**.\n\n</details>\n','README.md');
  assert.match(result,/\| 字体 \| `AFR` \|/);assert.match(result,/<details>/);assert.match(result,/<summary>Details<\/summary>/);assert.match(result,/\*\*AFRLOG\*\*/);
});
test('relative documents and Chinese anchor become site routes; other files use the exact source SHA',async()=>{
  const ref='a'.repeat(40);
  const result=await projectMarkdown('[Fonts](docs/autodesk-fonts.md) [Source](#📜-字体来源声明) [License](LICENSE)','README.md',{ref});
  assert.match(result,/\(\/fonts\/\)/);assert.ok(result.includes('(/fonts/#'+encodeURIComponent('-字体来源声明')+')'));
  assert.ok(result.includes(`https://github.com/splrad/LayerScape/blob/${ref}/LICENSE`));
  assert.match(await projectMarkdown('[Home](../README.md#快速开始)','docs/autodesk-fonts.md'),/\(\/install\/#%E5/);
});
test('Markdown and referenced images join local media without changing originals',async()=>{
  const media=new Set();
  const result=await projectMarkdown('![one](chore/assets/brand/a.png) ![two][logo]\n\n[logo]: chore/assets/brand/b.png','README.md',{media});
  assert.equal(media.size,2);assert.match(result,/\/media\/chore\/assets\/brand\/a.png/);assert.match(result,/\/media\/chore\/assets\/brand\/b.png/);
});
test('HTML table, partial wrapper, details and srcset retain structure and descriptors',()=>{
  const input='<div align="center">\n<table><tr><td><img src="a.png" srcset="b.png 1x, c.png 2x"></td></tr></table>\n<details><summary>Text</summary>';
  const result=rewriteHtml(input,value=>'/media/'+value);
  assert.ok(result.startsWith('<div align="center">'));assert.ok(result.endsWith('<details><summary>Text</summary>'));
  assert.match(result,/src="\/media\/a.png"/);assert.match(result,/srcset="\/media\/b.png 1x, \/media\/c.png 2x"/);
  assert.equal(rewriteHtml('<a href="a?x=1&amp;y=2">x</a>',v=>v),'<a href="a?x=1&amp;y=2">x</a>');
});
test('image URLs, encoded paths and arbitrary source refs cannot escape fixed inputs',async()=>{
  for(const url of ['javascript:alert(1)','//evil.test/img.png','chore/assets/%2e%2e%2f%2e%2e%2fsecret.png','../secret.png','chore/assets/a%5cb.png']) {
    await assert.rejects(projectMarkdown(`<img src="${url}">`,'README.md'),/DOCS_/);
  }
  await assert.rejects(projectMarkdown('x','README.md',{ref:'feature/branch'}),/DOCS_SOURCE_REF/);
  await assert.rejects(projectMarkdown('x','outside.md'),/DOCS_SOURCE_FILE/);
});
test('summary followed immediately by Markdown gets a parser boundary without changing text',async()=>{
  const result=await projectMarkdown('<details>\n<summary>Note</summary>\n**不要保存。** Use `AFRLOG`.\n\n</details>','README.md');
  assert.match(result,/<\/summary>\n\n\n\*\*不要保存。\*\* Use `AFRLOG`\./);
});

test('combined pages resolve anchors and relative links from each original Markdown file',async()=>{
  const output=await projectPage([
    {source:'README.md',body:'[安装](#快速开始)\n'},
    {source:'CHANGELOG.md',body:'## 1.0.0\n\n[版本](#100)\n'},
    {source:'docs/autodesk-fonts.md',body:'[授权](../LICENSE.txt)\n'},
  ],{ref:'b'.repeat(40)});
  assert.ok(output.includes('(/install/#'+encodeURIComponent('快速开始')+')'));
  assert.ok(output.includes('(/downloads/#100)'));
  assert.ok(output.includes('/blob/'+ 'b'.repeat(40) +'/LICENSE.txt'));
  assert.ok(!output.includes('(/#100)'));
});

test('task extraction stops at the next peer heading but keeps nested steps and fences',()=>{
  const input='## Start\n\n### Install\n\n1. Close CAD\n2. Install\n\n#### Note\n\n```md\n### Fake\n```\n\n### Use\n\nRun AFR\n\n## Next\n';
  const selected=subsection(input,'Install');
  assert.ok(selected.includes('Close CAD'));assert.ok(selected.includes('### Fake'));assert.ok(!selected.includes('Run AFR'));
  assert.throws(()=>subsection(input,'Missing'),/DOCS_SUBSECTION/);
});

test('legacy README anchors map to the relevant task page while unknown anchors remain in the guide',async()=>{
  assert.ok(legacyRoutes['兼容范围'].startsWith('/compatibility/'));
  assert.ok(legacyRoutes['手动替换'].startsWith('/usage/'));
  assert.ok(legacyRoutes['9x-手动迁移与恢复'].startsWith('/migration/'));
  assert.match(await projectMarkdown('[Other](#future-heading)','README.md'),/\(\/guide\/#future-heading\)/);
});

test('README media extraction preserves actual product screenshots and excludes donation badges and remote images',async()=>{
  const readme=await readFile(new URL('../../../README.md',import.meta.url),'utf8');
  const data=landingData(readme);
  assert.equal(data.screenshots.length,3);
  assert.ok(data.screenshots.every(image=>image.src.startsWith('/media/chore/assets/readme/')&&image.alt));
  assert.ok(!data.screenshots.some(image=>image.src.includes('https:')));
  assert.equal(data.features.length,3);assert.equal(data.commands.length,3);
});

for (const window of ['新系列尚无发行。','## 1.0.0\n候选已合入，附件待公开。','## 1.0.0\n对应正式版本已公开。']) {
  test('downloads preserves source provenance across release window: '+window.split('\n').at(-1),async()=>{
    const changelog='更新记录来自源码；已公开版本及可下载附件以 GitHub Releases 为准。\n\n[查看 GitHub Releases](https://github.com/splrad/LayerScape/releases)\n\n'+window;
    const output=await projectPage([{source:'README.md',body:'下载部署器。'},{source:'CHANGELOG.md',body:changelog}]);
    assert.ok(output.includes('更新记录来自源码；已公开版本及可下载附件以 GitHub Releases 为准。'));
    assert.ok(output.includes('(https://github.com/splrad/LayerScape/releases)'));
    for (const line of window.split('\n')) assert.ok(output.includes(line));assert.ok(!output.includes('releases/latest'));
  });
}

test('user homepage takes its copy and task paths from product Markdown',async()=>{
  const markdown=await readFile(new URL('../../../docs/product/overview.md',import.meta.url),'utf8');
  const data=productData(markdown);
  assert.ok(markdown.includes(data.title)&&markdown.includes(data.intro)&&markdown.includes(data.downloadNote));
  assert.match(data.downloadNote,/AFR 部署工具/);
  assert.deepEqual(data.scenes.map(p=>p.href),['/modules/',legacyRoutes['首次配置与验证'],legacyRoutes['手动替换']]);
  assert.ok(data.scenes.every(p=>markdown.includes(p.title)&&markdown.includes(p.description)&&markdown.includes(p.action)));
  assert.deepEqual(data.steps.map(p=>p.href),[legacyRoutes['快速开始'],legacyRoutes['首次配置与验证'],legacyRoutes['手动替换']]);
  assert.deepEqual(data.paths.map(p=>p.href),[legacyRoutes['快速开始'],legacyRoutes['首次配置与验证'],legacyRoutes['手动替换'],legacyRoutes['兼容范围'],'/fonts/',legacyRoutes['afr-常见问题']]);
  assert.ok(!JSON.stringify(data).match(/模块接入|公共基础|实施验收|架构方案/));
});

test('install and download pages keep the independent DLL download tied to v1.0.0',async()=>{
  const readme=await readFile(new URL('../../../README.md',import.meta.url),'utf8');
  const downloads=await readFile(new URL('../../../docs/product/downloads.md',import.meta.url),'utf8');
  const currentInstall=subsection(readme,'推荐：部署工具一键安装');
  const currentDownloads=section(downloads,'选择安装包');
  for(const body of [currentInstall,currentDownloads]){
    assert.ok(body.includes('LayerScape-vX.Y.Z.exe')&&body.includes('Fonts.zip'));
    assert.doesNotMatch(body,/AFR-DLL|NETLOAD/);
  }
  const manualInstall=subsection(readme,'单 DLL 手动安装');
  const historicalDownloads=section(downloads,'v1.0.0 历史安装包');
  for(const body of [manualInstall,historicalDownloads]){
    assert.ok(body.includes('https://github.com/splrad/LayerScape/releases/download/v1.0.0/AFR-DLL_v1.0.0.zip'));
  }
  const rendered=await projectMarkdown(downloads,'docs/product/downloads.md');
  assert.ok(rendered.includes('(/install/#'+encodeURIComponent('单-dll-手动安装')+')'));
});

test('user source navigation fails closed for missing required sections or an external replacement',async()=>{
  const markdown=await readFile(new URL('../../../docs/product/overview.md',import.meta.url),'utf8');
  assert.throws(()=>productData(markdown.replace('## 产品介绍','## Removed')),/DOCS_SECTION/);
  assert.throws(()=>productData(markdown.replace('[安装指南](../../README.md#快速开始)','[安装指南](https://example.com/install)')),/DOCS_PRODUCT_ROUTE/);
});

test('user documents stay on the site while internal planning documents remain repository links',async()=>{
  const output=await projectMarkdown('[新安装](deployment.md) [架构](architecture.md) [接入](extension-guide.md) [演进](roadmap.md) [现有安装](../../README.md#快速开始)','docs/product/overview.md');
  for(const file of ['deployment.md','architecture.md','extension-guide.md','roadmap.md'])assert.ok(output.includes('/blob/main/docs/product/'+file));
  assert.ok(output.includes('(/install/#'+encodeURIComponent('快速开始')+')'));
  const old=await projectMarkdown('[功能](#功能) [AFR](#afr--缺失字体自动替换)','README.md');
  assert.equal((old.match(/\/modules\//g)??[]).length,2);
});

test('only reader-facing release excerpts enter the downloads page and search',()=>{
  const markdown='# Changelog\n\n## 1.0.0 (2026-11-13)\n\n### 维护\n\n内部流程。\n\n## 更新记录\n\n维护者前言。';
  assert.equal(releaseNotes(markdown),'');
  const entry=markdown.replace('### 维护','### 插件使用说明\n\n保留 **事实**。\n\n### 维护');
  assert.equal(releaseNotes(entry),'## 1.0.0 (2026-11-13)\n\n保留 **事实**。');
});

test('reading task presentation preserves all source text and routes while leaving data tables and homepage intact',()=>{
  const body='## Tasks\n\n| 步骤 | 操作 | 入口 |\n| --- | --- | --- |\n| 安装 & 设置 | 使用 AFR <字体> | [安装指南](/install/#快速开始) |\n\n## Data\n\n| 类型 | 字体 |\n| --- | --- |\n| SHX | ming.shx |';
  const result=presentUserMarkdown(body,'guide');
  assert.ok(result.includes('<ol class="doc-route-list doc-route-steps" role="list">'));
  assert.ok(result.includes('安装 &amp; 设置')&&result.includes('使用 AFR &lt;字体&gt;')&&result.includes('href="/install/#快速开始"'));
  assert.ok(result.includes('| SHX | ming.shx |')&&result.includes('## Tasks'));
  assert.equal(presentUserMarkdown(body,'index'),body);
});

test('real image presentation preserves source URL and alt and does not transform example fences',()=>{
  const body='![字体 "配置"](/media/chore/assets/readme/afr-font-config.jpg)\n\n```md\n![example](example.png)\n```';
  const result=presentUserMarkdown(body,'modules');
  assert.ok(result.includes('href="/media/chore/assets/readme/afr-font-config.jpg"')&&result.includes('alt="字体 &quot;配置&quot;"'));
  assert.ok(result.includes('data-image-viewer')&&result.includes('```md\n![example](example.png)\n```'));
});
