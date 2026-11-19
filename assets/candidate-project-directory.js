(() => {
'use strict';
const data=window.KOV_CANDIDATE_PROJECTS;if(!data)return;
const $=id=>document.getElementById(id),grid=$('profile-grid'),summary=$('results-summary'),pager=$('pagination'),search=$('profile-search'),country=$('country-filter'),industry=$('industry-filter'),service=$('service-filter'),size=$('page-size');let page=1;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=v=>{if(!v)return '';const d=new Date(v+'T00:00:00Z');return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('en',{day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'}).format(d);};

const avatarArt=id=>{
 const n=Math.max(1,Number(id)||1),h=(n*137.508)%360,h2=(h+42+(n%5)*9)%360;
 const skin=['#f2c9a5','#d8a078','#b97651','#8a563d','#f0d1bd','#c58b68'][n%6];
 const hair=['#25212a','#47342c','#161b25','#76513c','#b68b45','#34292a'][Math.floor(n/3)%6];
 const shirt=['#234b5b','#8b5b45','#425b43','#594c78','#315d77','#855b72'][Math.floor(n/7)%6];
 const cuts=[
 'M25 42 Q27 13 50 14 Q75 13 76 43 L72 54 Q68 28 50 29 Q31 29 28 54Z',
 'M23 46 Q20 17 49 13 Q80 12 78 49 L73 38 Q69 28 58 27 Q42 22 29 40Z',
 'M26 37 Q30 10 52 15 Q74 16 76 40 Q68 30 57 31 Q42 31 28 46Z',
 'M24 48 Q20 21 42 14 Q69 5 79 35 L73 57 Q69 31 51 29 Q34 28 27 55Z',
 'M25 38 Q28 12 51 12 Q73 13 77 39 L72 47 Q68 27 50 27 Q31 28 28 47Z',
 'M22 45 Q24 13 52 14 Q79 15 79 47 Q69 32 62 31 Q42 22 27 50Z'
 ][n%6];
 const accessory=n%4===0?'<circle cx="77" cy="28" r="5" fill="#f1c56a"/>':n%4===1?'<path d="M20 65 Q7 76 16 92" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="3"/>':n%4===2?'<circle cx="23" cy="28" r="4" fill="#fff" fill-opacity=".45"/>':'<path d="M78 76 l7 8 -7 8 -7 -8Z" fill="#fff" fill-opacity=".45"/>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl('+h+' 43% 91%)"/><stop offset="1" stop-color="hsl('+h2+' 48% 78%)"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(#g)"/><path d="M9 100 Q14 69 39 66 L61 66 Q87 69 92 100" fill="'+shirt+'"/><path d="M42 62 L58 62 L59 74 Q50 83 41 74Z" fill="'+skin+'"/><ellipse cx="50" cy="44" rx="23" ry="27" fill="'+skin+'"/><path d="M39 45 h5 M56 45 h5" stroke="#352c2b" stroke-linecap="round" stroke-width="2.4"/><path d="M46 56 Q50 59 54 56" fill="none" stroke="#8b4c49" stroke-linecap="round" stroke-width="2"/><path d="'+cuts+'" fill="'+hair+'"/>'+accessory+'<circle cx="50" cy="50" r="48" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2"/></svg>';
 return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
};

const money=v=>v===null||v===undefined||v===''?'':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(v));
data.countries.forEach(n=>country.add(new Option(n,n)));
[...new Set(data.profiles.map(p=>p.industry).filter(Boolean))].sort().forEach(n=>industry.add(new Option(n,n)));
[...new Set(data.profiles.map(p=>p.service).filter(Boolean))].sort().forEach(n=>service.add(new Option(n,n)));
function filtered(){const q=search.value.trim().toLowerCase();return data.profiles.filter(p=>(!q||[p.name,p.jobTitle,p.industry,p.service,p.project,p.projectDetails,p.country].join(' ').toLowerCase().includes(q))&&(!country.value||p.country===country.value)&&(!industry.value||p.industry===industry.value)&&(!service.value||p.service===service.value));}
function rating(p){const n=Number(p.rating);if(!Number.isFinite(n)||n<1||n>5)return '';const whole=Math.floor(n),stars='★'.repeat(whole)+'☆'.repeat(5-whole);return '<div class="kov-project-rating"><span>Client rating</span><strong><span class="kov-project-stars" aria-label="'+esc(n)+' out of 5 stars">'+stars+'</span><span class="kov-project-rating-value">'+esc(n.toFixed(1))+' / 5</span></strong></div>';}
function render(){const rows=filtered(),per=Number(size.value),pages=Math.max(1,Math.ceil(rows.length/per));page=Math.min(page,pages);const visible=rows.slice((page-1)*per,page*per);
summary.textContent=rows.length?'Showing '+((page-1)*per+1)+'–'+Math.min(page*per,rows.length)+' of '+rows.length.toLocaleString()+' profiles':'No profiles have been added yet. Add your records in assets/candidate-project-directory-data.js.';
grid.innerHTML=visible.map((p,i)=>{const variant=['profile-layout-a','profile-layout-b','profile-layout-c','profile-layout-d'][i%4];const profileNumber=String(p.id||'').replace('profile-','').padStart(4,'0');const profileLabel=p.name||('Profile '+profileNumber);const initials=p.name?p.name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase():profileNumber.slice(-2);const hue=(Number(profileNumber)||i)*137.508%360;const photo='<img class="kov-project-avatar kov-project-avatar-illustrated" src="'+(p.portrait?esc(p.portrait):avatarArt(profileNumber))+'" alt="'+esc('Illustrative avatar for fictional profile '+profileNumber)+'" loading="lazy">';const countryLine='<p class="kov-project-country"><span class="kov-project-flag" aria-hidden="true">'+esc(p.flag||'🌍')+'</span><span>Target market:</span> '+esc(p.country||'Select market')+'</p>';const details=[['Job title',p.jobTitle],['Project name',p.project],['Project details',p.projectDetails],['Project date',date(p.date)],['Amount spent',money(p.amount)],['Industry',p.industry],['Service area',p.service],['Location',p.location],['Engagement',p.engagement]].filter(x=>x[1]);const detailHtml=details.map((x,k)=>'<div class="kov-project-field field-'+k+'"><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>').join('');const review=p.review?'<section class="kov-project-review"><span>Candidate review</span><p>'+esc(p.review)+'</p></section>':'';return '<article class="kov-project-card '+variant+'"><header class="kov-project-card-head"><div class="kov-project-avatar-wrap">'+photo+'</div><div class="kov-project-identity"><h2>'+esc(profileLabel)+'</h2>'+countryLine+(p.jobTitle?'<p class="kov-project-role">'+esc(p.jobTitle||'Add job title')+'</p>':'')+'</div>'+rating(p)+'</header><div class="kov-project-card-content">'+(detailHtml?'<div class="kov-project-fields">'+detailHtml+'</div>':'')+review+'</div></article>';}).join('');
pager.innerHTML='';const add=(label,target,disabled,current)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled;if(current)b.setAttribute('aria-current','page');b.addEventListener('click',()=>{page=target;render();grid.scrollIntoView({behavior:'smooth',block:'start'});});pager.append(b);};if(rows.length){add('Previous',page-1,page===1,false);const first=Math.max(1,Math.min(page-2,pages-4)),last=Math.min(pages,first+4);for(let n=first;n<=last;n++)add(String(n),n,false,n===page);add('Next',page+1,page===pages,false);}
}
[search,country,industry,service,size].forEach(el=>el.addEventListener(el===search?'input':'change',()=>{page=1;render();}));
$('clear-filters').addEventListener('click',()=>{search.value='';country.value='';industry.value='';service.value='';size.value='24';page=1;render();});
$('total-count').textContent=data.profiles.length.toLocaleString();render();
})();