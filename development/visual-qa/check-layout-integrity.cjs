const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "../..");
const port = 8777;
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".webp":"image/webp", ".avif":"image/avif", ".woff2":"font/woff2" };
const sitemapXml = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const routes = [...sitemapXml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => {
  const url = new URL(match[1].trim());
  if (!["www.kovcareeragency.org", "kovcareeragency.org"].includes(url.hostname)) {
    throw new Error(`Unexpected sitemap host: ${url.hostname}`);
  }
  return decodeURIComponent(url.pathname);
});
if (routes.length !== 703) {
  throw new Error(`Expected 703 approved public sitemap routes; found ${routes.length}`);
}
if (new Set(routes).size !== routes.length) {
  throw new Error("Duplicate routes found in sitemap.xml");
}
const viewports = [{name:"mobile",width:390,height:844},{name:"tablet",width:768,height:1024},{name:"desktop",width:1440,height:1000}];

function resolveFile(urlPath) {
  let pathname;
  try { pathname = decodeURIComponent(urlPath); } catch { return null; }
  if (pathname === "/") pathname = "/index.html";
  if (pathname.endsWith("/")) pathname += "index.html";
  const target = path.resolve(root, "." + pathname);
  return target === root || target.startsWith(root + path.sep) ? target : null;
}
const server = http.createServer((req,res) => {
  const target = resolveFile(new URL(req.url,"http://127.0.0.1").pathname);
  if (!target) return res.writeHead(403).end("Forbidden");
  fs.stat(target,(err,stat) => {
    if (err || !stat.isFile()) return res.writeHead(404).end("Not found");
    res.writeHead(200,{"Content-Type":mime[path.extname(target).toLowerCase()] || "application/octet-stream","Cache-Control":"no-store"});
    fs.createReadStream(target).pipe(res);
  });
});

async function inspect(browser,route,viewport) {
  const page = await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
  const errors = [];
  page.on("pageerror",e=>errors.push(e.message));
  try {
    const response = await page.goto("http://127.0.0.1:" + port + route,{waitUntil:"domcontentloaded",timeout:45000});
    if (!response || !response.ok()) {
      const status = response?.status() ?? null;
      return {
        route,
        viewport: viewport.name,
        httpStatus: status,
        failures: [`page request failed with HTTP ${status ?? "no response"}`],
        errors,
        failed: true,
      };
    }
    await page.evaluate(async()=>{ if(document.fonts?.ready) await document.fonts.ready; });
    await page.waitForTimeout(200);
    const metrics = await page.evaluate(() => {
      const round = n => Math.round(n*10)/10;
      const rect = el => { const r=el.getBoundingClientRect(); return {left:round(r.left),right:round(r.right),top:round(r.top),bottom:round(r.bottom),width:round(r.width)}; };
      const main = document.querySelector("main");
      const width = Math.max(document.documentElement.scrollWidth,document.body.scrollWidth);
      const overflowElements = [...document.querySelectorAll("body *")]
        .map(el => {
          const r = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id || "",
            className: String(el.className?.baseVal ?? el.className ?? "").slice(0,120),
            left: round(r.left), right: round(r.right), width: round(r.width),
            position: s.position, display: s.display, overflowX: s.overflowX,
            cssWidth: s.width, minWidth: s.minWidth, maxWidth: s.maxWidth,
            text: (el.textContent || "").trim().replace(/\s+/g," ").slice(0,90)
          };
        })
        .filter(item => item.right > innerWidth + 1 || item.left < -1)
        .sort((a,b) => Math.max(b.right-innerWidth,-b.left) - Math.max(a.right-innerWidth,-a.left))
        .slice(0,24);
      const centered = [...document.querySelectorAll(".ceo-shell,.ceo-reading-layout,.max-w-7xl.mx-auto")]
        .filter(el=>el.offsetWidth>0).map(el=>{const r=rect(el);return {className:String(el.className).slice(0,80),centerDelta:round((r.left+r.right)/2-innerWidth/2)};});
      let articleCenterDelta = null;
      const reading = document.querySelector(".ceo-reading-layout");
      const article = reading?.querySelector(":scope > .ceo-prose");
      if (reading && article && getComputedStyle(reading).display === "grid") {
        const gr=reading.getBoundingClientRect(), ar=article.getBoundingClientRect(), s=getComputedStyle(reading);
        const cols=s.gridTemplateColumns.split(/\s+/).map(parseFloat).filter(Number.isFinite);
        if(cols.length>=2) articleCenterDelta=round((ar.left+ar.right)/2-(gr.left+cols[0]+(parseFloat(s.columnGap)||0)+cols[1]/2));
      }
      const responsive=[];
      const colsCount=s=>s.trim().split(/\s+/).filter(Boolean).length;
      for(const [token,expected] of [["md:grid-cols-2",2],["md:grid-cols-3",3],["md:grid-cols-4",4],["lg:grid-cols-2",2],["lg:grid-cols-3",3],["lg:grid-cols-4",4],["lg:grid-cols-12",12]]) {
        const el=document.querySelector('[class~="'+token+'"]'); if(!el) continue;
        const s=getComputedStyle(el), enabled=token.startsWith("md:")?innerWidth>=768:innerWidth>=1024;
        responsive.push({token,enabled,display:s.display,columns:colsCount(s.gridTemplateColumns),ok:!enabled||(s.display==="grid"&&colsCount(s.gridTemplateColumns)===expected)});
      }
      for(const token of ["lg:col-span-4","lg:col-span-5","lg:col-span-7","lg:col-span-8"]) {
        const el=document.querySelector('[class~="'+token+'"]'); if(!el) continue;
        const enabled=innerWidth>=1024, expected="span "+token.match(/col-span-(\d+)/)[1];
        const actual=getComputedStyle(el).gridColumnEnd;
        responsive.push({token,enabled,gridColumnEnd:actual,ok:!enabled||actual===expected});
      }
      const desktopNavigation=document.querySelector('[class~="hidden"][class~="lg:flex"]');
      if(desktopNavigation) {
        const enabled=innerWidth>=1024, display=getComputedStyle(desktopNavigation).display;
        responsive.push({token:"hidden lg:flex",enabled,display,ok:enabled?display==="flex":display==="none"});
      }
      const desktopHidden=document.querySelector('[class~="lg:hidden"]');
      if(desktopHidden) {
        const enabled=innerWidth>=1024, display=getComputedStyle(desktopHidden).display;
        responsive.push({token:"lg:hidden",enabled,display,ok:enabled?display==="none":display!=="none"});
      }
      for(const token of ["md:flex-row","lg:flex-row"]) {
        const el=document.querySelector('[class~="'+token+'"]'); if(!el) continue;
        const enabled=token.startsWith("md:")?innerWidth>=768:innerWidth>=1024;
        responsive.push({token,enabled,direction:getComputedStyle(el).flexDirection,ok:!enabled||getComputedStyle(el).flexDirection==="row"});
      }
      const mainSections=main?[...main.children].filter(el=>el.matches("section,article,.ceo-reading-layout")):[];
      const overlaps=[];
      for(let i=0;i<mainSections.length-1;i++){
        const a=mainSections[i],b=mainSections[i+1],sa=getComputedStyle(a),sb=getComputedStyle(b);
        if(["absolute","fixed"].includes(sa.position)||["absolute","fixed"].includes(sb.position)) continue;
        const ar=rect(a),br=rect(b),ix=Math.min(ar.right,br.right)-Math.max(ar.left,br.left),iy=Math.min(ar.bottom,br.bottom)-Math.max(ar.top,br.top);
        if(ix>20&&iy>2)overlaps.push({first:String(a.className).slice(0,70),second:String(b.className).slice(0,70),verticalIntersection:iy});
      }
      return {
        viewport:innerWidth,
        documentWidth:width,
        horizontalOverflow:width-innerWidth,
        overflowElements,
        mainFound:Boolean(main),
        centeredContainers:centered,
        articleCenterDelta,
        responsive,
        mainSiblingOverlaps:overlaps,
        revealCount:document.querySelectorAll(".kov-reveal").length,
        revealTransforms:[...document.querySelectorAll(".kov-reveal")].map(el=>getComputedStyle(el).transform).filter(value=>value!=="none"),
        motionReady:document.documentElement.classList.contains("kov-motion-ready")
      };
    });
    metrics.initialMainSiblingOverlaps=[...metrics.mainSiblingOverlaps];
    const revealState=await page.evaluate(()=>{
      const all=[...document.querySelectorAll(".kov-reveal")];
      // Content is intentionally visible immediately, including elements below the fold.
      const visible=all.every(el=>{const s=getComputedStyle(el);return s.visibility!=="hidden"&&Number(s.opacity)>.95;});
      const main=document.querySelector("main");
      const sections=main?[...main.children].filter(el=>el.matches("section,article,.ceo-reading-layout")):[];
      const overlaps=[];
      for(let i=0;i<sections.length-1;i++){
        const a=sections[i],b=sections[i+1],sa=getComputedStyle(a),sb=getComputedStyle(b);
        if(["absolute","fixed"].includes(sa.position)||["absolute","fixed"].includes(sb.position)) continue;
        const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
        const ix=Math.min(ar.right,br.right)-Math.max(ar.left,br.left);
        const iy=Math.min(ar.bottom,br.bottom)-Math.max(ar.top,br.top);
        if(ix>20&&iy>2) overlaps.push({
          first:String(a.className).slice(0,70),
          second:String(b.className).slice(0,70),
          verticalIntersection:Math.round(iy*10)/10
        });
      }
      return {visible,overlaps};
    });
    const revealsVisible=revealState.visible;
    // Ignore the transient translateY entrance offset; detect collisions after reveal settles.
    metrics.mainSiblingOverlaps=revealState.overlaps;
    const failures=[];
    if(metrics.horizontalOverflow>2)failures.push("horizontal overflow "+metrics.horizontalOverflow+"px");
    if(!metrics.mainFound)failures.push("missing main element");
    if(metrics.articleCenterDelta!==null&&viewport.width>768&&Math.abs(metrics.articleCenterDelta)>18)failures.push("editorial article off-centre by "+metrics.articleCenterDelta+"px");
    const brokenResponsive = metrics.responsive.filter(item => !item.ok);
    if(brokenResponsive.length) failures.push("responsive utilities failed: "+brokenResponsive.map(item=>item.token).join(", "));
    const initialOverlaps=metrics.initialMainSiblingOverlaps||[];
    const settledOverlaps=metrics.mainSiblingOverlaps||[];
    if(initialOverlaps.length||settledOverlaps.length) failures.push("adjacent main sections overlap: "+[...initialOverlaps,...settledOverlaps].map(item=>item.first+" / "+item.second).join("; "));
    if(metrics.revealTransforms.length) failures.push("reveal animation translates section boxes and may cause transient overlap");
    if(!revealsVisible)failures.push("a reveal section remained hidden after scrolling");
    if(errors.length)failures.push("uncaught browser JavaScript errors");
    return {route,viewport:viewport.name,httpStatus:response.status(),failures,errors,metrics,revealsVisible};
  } finally { await page.close(); }
}

(async()=>{
  let browser; const results=[];
  try {
    await new Promise(resolve=>server.listen(port,"127.0.0.1",resolve));
    browser=await chromium.launch({headless:true});
    for(const route of routes)for(const viewport of viewports)results.push(await inspect(browser,route,viewport));
  } finally {
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
  const report={generatedAt:new Date().toISOString(),routes:routes.length,viewports,checks:results.length,failedChecks:results.filter(x=>x.failures?.length),results};
  const output=path.join(root,"development/visual-qa/layout-integrity-report.json");
  fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({routes:report.routes,checks:report.checks,failures:report.failedChecks.length,report:path.relative(root,output),failedChecks:report.failedChecks.map(x=>({route:x.route,viewport:x.viewport,failures:x.failures,overflowElements:x.metrics?.overflowElements?.slice(0,12)}))},null,2));
  if(report.failedChecks.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
