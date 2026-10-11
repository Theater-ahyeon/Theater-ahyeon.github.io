const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function showcaseArt(project){
 const s=project.showcase;if(!s)return '';
 return `<div class="repository-exhibit" data-repo="${escapeText(project.id)}"><div class="repository-exhibit-top"><span>GITHUB / README</span><b>${escapeText(s.commit.slice(0,7))}</b></div><span class="repository-exhibit-path">Theater-ahyeon / ${escapeText(project.repoName)}</span><strong class="repository-exhibit-title">${escapeText(project.title)}</strong><span class="repository-exhibit-subtitle">${escapeText(project.subtitle)}</span><div class="repository-exhibit-lines">${s.lines.map((text,i)=>`<span><i>${String(i+1).padStart(2,'0')}</i>${escapeText(text)}</span>`).join('')}</div><span class="repository-exhibit-status">${escapeText(s.notice)}</span><span class="repository-exhibit-corner" aria-hidden="true">↗</span></div>`;
}
export function showcaseSources(project){
 const s=project.showcase;if(!s)return '';
 return `<section class="project-showcase-sources" aria-label="原仓库项目展示"><h3>原仓库展示</h3><p>${escapeText(s.notice)}。${s.links.length?'以下链接打开仓库中的原始文件。':'当前以仓库文档摘要呈现，不使用虚构应用界面。'}</p>${s.links.length?`<div>${s.links.map(link=>`<a href="${escapeText(link.url)}" target="_blank" rel="noreferrer"><span>${escapeText(link.label)}</span><small>${escapeText(link.kind)}</small><b aria-hidden="true">↗</b></a>`).join('')}</div>`:''}<a class="showcase-readme" href="${escapeText(s.source)}" target="_blank" rel="noreferrer">阅读此版本 README <span>${escapeText(s.commit.slice(0,7))} ↗</span></a></section>`;
}
