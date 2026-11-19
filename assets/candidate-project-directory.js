(() => {
'use strict';
const data=window.KOV_CANDIDATE_PROJECTS;if(!data)return;
const $=id=>document.getElementById(id),grid=$('profile-grid'),summary=$('results-summary'),pager=$('pagination'),search=$('profile-search'),country=$('country-filter'),industry=$('industry-filter'),service=$('service-filter'),size=$('page-size');let page=1;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>new Intl.DateTimeFormat('en',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(v+'T00:00:00Z'));
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);
data.countries.forEach(n=>country.add(new Option(n,n)));
[...new Set(data.profiles.map(p=>p.industry))].sort().forEach(n=>industry.add(new Option(n,n)));
[...new Set(data.profiles.map(p=>p.service))].sort().forEach(n=>service.add(new Option(n,n)));
function filtered(){const q=search.value.trim().toLowerCase();return data.profiles.filter(p=>(!q||[p.name,p.jobTitle,p.industry,p.service,p.project,p.country].join(' ').toLowerCase().includes(q))&&(!country.value||p.country===country.value)&&(!industry.value||p.industry===industry.value)&&(!service.value||p.service===service.value));}
function render(){const rows=filtered(),per=Number(size.value),pages=Math.max(1,Math.ceil(rows.length/per));page=Math.min(page,pages);const visible=rows.slice((page-1)*per,page*per);
summary.textContent=rows.length?'Showing '+((page-1)*per+1)+'–'+Math.min(page*per,rows.length)+' of '+rows.length.toLocaleString()+' sample profiles':'No profiles match these filters.';
grid.innerHTML=visible.map(p=>`<article class="kov-project-card"><div class="kov-project-photo-wrap"><img class="kov-project-photo" src="${esc(p.portrait)}" alt="AI-generated demo portrait" loading="lazy"><span class="kov-project-country-badge">${esc(p.flag)} ${esc(p.country)}</span><span class="kov-project-id">PROFILE ${esc(p.id)}</span></div><div class="kov-project-card-body"><div class="kov-project-person"><div><h2>${esc(p.name)}</h2><p class="kov-project-role">${esc(p.jobTitle)} · ${esc(p.industry)}</p></div><span class="kov-project-demo">DEMO</span></div><h3>${esc(p.project)}</h3><div class="kov-project-service"><span>Service area</span><strong>${esc(p.service)}</strong></div><div class="kov-project-rating"><span>Rating</span><strong>Not yet rated</strong></div><div class="kov-project-details"><div><span>Example timeline</span><strong>${date(p.date)}</strong></div><div><span>Sample amount</span><strong>${money(p.amount)}</strong></div></div></div></article>`).join("");
pager.innerHTML='';const add=(label,target,disabled,current)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled;if(current)b.setAttribute('aria-current','page');b.addEventListener('click',()=>{page=target;render();grid.scrollIntoView({behavior:'smooth',block:'start'});});pager.append(b);};add('Previous',page-1,page===1,false);const first=Math.max(1,Math.min(page-2,pages-4)),last=Math.min(pages,first+4);for(let n=first;n<=last;n++)add(String(n),n,false,n===page);add('Next',page+1,page===pages,false);}
[search,country,industry,service,size].forEach(el=>el.addEventListener(el===search?'input':'change',()=>{page=1;render();}));
$('clear-filters').addEventListener('click',()=>{search.value='';country.value='';industry.value='';service.value='';size.value='24';page=1;render();});
$('total-count').textContent=data.profiles.length.toLocaleString();render();
})();