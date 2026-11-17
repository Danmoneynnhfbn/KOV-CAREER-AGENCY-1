const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req,res) => {
  const urlPath = decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const file = path.resolve(root,urlPath==='/'?'index.html':`.${urlPath}`);
  if (!file.startsWith(root+path.sep)) return res.writeHead(403).end();
  fs.stat(file,(err,stat)=>{ if(err||!stat.isFile()) return res.writeHead(404).end(); res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream'}); fs.createReadStream(file).pipe(res); });
});
(async()=>{
  let browser;
  try {
    await new Promise(resolve=>server.listen(8777,'127.0.0.1',resolve));
    browser=await chromium.launch({headless:true,channel:'chrome'});
    const routes=[['service','/services.html'],['role-directory','/roles/index.html'],['industry','/industries/wholesale-distribution/index.html'],['geography','/countries-we-serve.html'],['professional-directory','/professional-directory/index.html'],['career-resources','/career-resources/index.html']];
    const results=[];
    for(const [family,route] of routes){
      for(const [device,width,height] of [['desktop',1440,1000],...(family==='service'||family==='career-resources'?[['mobile',390,844]]:[])]){
        const page=await browser.newPage({viewport:{width,height},isMobile:device==='mobile'}),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('requestfailed',r=>errors.push(`${r.url()} ${r.failure()?.errorText||''}`));
        const response=await page.goto(`http://127.0.0.1:8777${route}`,{waitUntil:'domcontentloaded',timeout:30000});
        await page.waitForTimeout(450);
        const report=await page.evaluate(()=>{
          const candidates=[...document.querySelectorAll('main .mx-auto.max-w-7xl,main.kov-expansion-page,main .ceo-shell,main > section:first-of-type')].slice(0,4);
          return {width:innerWidth,docWidth:document.documentElement.scrollWidth,bodyClass:document.body.className,globalCss:[...document.styleSheets].some(s=>s.href?.includes('kov-global-redesign.css?v=26')),boxes:candidates.map(el=>{const r=el.getBoundingClientRect();return {class:String(el.className).slice(0,60),left:Math.round(r.left),width:Math.round(r.width),center:Math.round(r.left+r.width/2-innerWidth/2)}}),font:document.fonts.check('400 48px Boska'),resourceCards:document.querySelectorAll('.kov-expansion-card').length};
        });
        await page.screenshot({path:path.join(__dirname,`family-centered-${family}-${device}.png`),timeout:45000,animations:'disabled'});
        results.push({family,device,status:response.status(),errors,...report}); await page.close();
      }
    }
    console.log(JSON.stringify(results,null,2));
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
