#!/usr/bin/env python3
"""Inspect published sitemap pages; does not change public files."""
from __future__ import annotations
import argparse, csv, posixpath, re, sys
from collections import Counter, defaultdict
from html.parser import HTMLParser
from itertools import combinations
from pathlib import Path
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
COVERAGE=ROOT/"development"/"PAGE-COVERAGE.csv"
SITEMAP=ROOT/"sitemap.xml"
TOKEN=re.compile(r"[a-z0-9]+", re.I)
SHINGLE=8
LIMIT=.30
SKIP={"head","script","style","noscript","template","header","footer","nav"}
HEADINGS={"h1","h2","h3","h4","h5","h6"}
SERVICES={
 "/services.html":"Private Career Representation",
 "/candidate-services.html":"Individual Career Services",
 "/resume-cv-writing.html":"Resume and CV Writing",
 "/linkedin-profile-optimization.html":"LinkedIn Profile Optimization",
 "/career-documents.html":"Career Documents",
 "/career-portfolio-development.html":"Career Portfolio Development",
 "/personal-career-website.html":"Personal Career Website",
 "/career-positioning-optimization.html":"Career Positioning",
 "/career-coaching.html":"Career Coaching",
 "/contact.html":"Contact",
}
PLACEHOLDERS=[re.compile(x,re.I) for x in (
 r"\blorem ipsum\b",r"\bcoming soon\b",r"\bcontent goes here\b",
 r"\bpage content\b",r"\bguide\s+0?\d+\b",r"\bmarket report\s+0?\d+\b")]

STAGING_MARKERS=[re.compile(x,re.I) for x in (
 r"research[- ]stage draft",r"staged for internal planning",r"placeholder route",
 r"route placeholder",r"not approved or published",r"internal planning aid only",
 r"published, indexable draft",r"evidence-gated development")]

class PageParser(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True)
  self.stack=[]; self.active=[]; self.text_parts=[]; self.headings=[]; self.paragraphs=[]; self.anchors=[]
  self.title_parts=[]; self.description=""; self.canonical=""; self.robots=""
 def hidden_parent(self): return any(hidden for _,hidden in self.stack)
 def handle_starttag(self,tag,attrs):
  a={k.lower():(v or "") for k,v in attrs}
  style=re.sub(r"\s+","",a.get("style","").lower())
  hidden=self.hidden_parent() or tag in SKIP or "hidden" in a or a.get("aria-hidden","").lower()=="true" or "display:none" in style or "visibility:hidden" in style
  self.stack.append((tag,hidden))
  if tag=="meta":
   meta_name=a.get("name","").lower()
   if meta_name=="description": self.description=a.get("content","").strip()
   elif meta_name in {"robots","googlebot"}: self.robots=(self.robots+"; "+a.get("content","").strip()).strip("; ")
  if tag=="link" and "canonical" in a.get("rel","").lower().split(): self.canonical=a.get("href","").strip()
  if tag=="title": self.active.append({"tag":tag,"kind":"title","parts":[]})
  elif not hidden and (tag in HEADINGS or tag=="p"):
   self.active.append({"tag":tag,"kind":tag,"parts":[]})
  if tag=="a" and not hidden: self.active.append({"tag":"a","kind":"a","parts":[],"href":a.get("href","").strip()})
 def handle_startendtag(self,tag,attrs): self.handle_starttag(tag,attrs); self.handle_endtag(tag)
 def handle_data(self,data):
  if any(tag=="title" for tag,_ in self.stack):
   for item in reversed(self.active):
    if item["kind"]=="title": item["parts"].append(data); break
  if not self.hidden_parent() and data.strip():
   self.text_parts.append(data)
   for item in self.active:
    if item["kind"]!="title": item["parts"].append(data)
 def handle_endtag(self,tag):
  for i in range(len(self.active)-1,-1,-1):
   item=self.active[i]
   if item["tag"]==tag:
    value=re.sub(r"\s+"," ","".join(item["parts"])).strip()
    if item["kind"]=="title": self.title_parts.append(value)
    elif item["kind"] in HEADINGS and value: self.headings.append((item["kind"],value))
    elif item["kind"]=="p" and value: self.paragraphs.append(value)
    elif item["kind"]=="a": self.anchors.append({"href":item.get("href",""),"text":value})
    self.active.pop(i); break
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag: self.stack=self.stack[:i]; break
 @property
 def text(self): return re.sub(r"\s+"," "," ".join(self.text_parts)).strip()
 @property
 def title(self): return " ".join(x for x in self.title_parts if x).strip()

def family(path):
 p=path.lstrip("/")
 if p in ("","index.html"): return "Homepage"
 if p in {"services.html","candidate-services.html","how-it-works.html","pricing.html","contact.html","about.html","candidate-proof.html"}: return "Commercial conversion"
 if p in {"resume-cv-writing.html","linkedin-profile-optimization.html","career-documents.html","career-portfolio-development.html","personal-career-website.html","career-positioning-optimization.html","career-coaching.html"}: return "Individual service"
 if p.startswith("services/"): return "Specialist service"
 if p.startswith("roles/"): return "Role/occupation subject"
 if p.startswith("industries/"): return "Industry subject"
 if p.startswith(("markets/","countries/")): return "Geography/market subject"
 if p.startswith("faq/"): return "FAQ"
 if p.startswith(("resources/","career-resources/")) or p.startswith("blog"): return "Career resource/research"
 if p.startswith("directory/"): return "Directory/reference subject"
 return "Other public page"

def local_path(href,current_path):
 if not href or href.startswith(("#","mailto:","tel:","javascript:","data:")): return None
 u=urlsplit(href)
 if u.scheme and u.scheme not in ("http","https"): return None
 if u.netloc and u.netloc.lower() not in ("kovcareeragency.org","www.kovcareeragency.org"): return None
 target=u.path or ""
 if target.startswith("/"): return posixpath.normpath(target)
 return posixpath.normpath(posixpath.join("/",posixpath.dirname(current_path.lstrip("/")),target))

def service_links(anchors,current_path):
 found={SERVICES[path] for a in anchors if (path:=local_path(a["href"],current_path)) in SERVICES}
 return "; ".join(name for name in SERVICES.values() if name in found)

def shingles(words):
 return {tuple(words[i:i+SHINGLE]) for i in range(max(0,len(words)-SHINGLE+1))}

def similarity(a,b):
 if not a or not b: return 0
 n=len(a&b); return n/(len(a)+len(b)-n)

def groups_for(path):
 parts=path.strip("/").split("/")
 role=industry=None
 if len(parts)>1 and parts[0]=="roles":
  role=parts[1]
  if len(parts)>2 and parts[2].endswith(".html") and parts[2]!="index.html": industry=parts[2][:-5]
 elif len(parts)>1 and parts[0]=="industries":
  industry=parts[1][:-5] if parts[1].endswith(".html") else parts[1]
 return role,industry

def handoff(fam,path,txt):
 if fam in {"Role/occupation subject","Industry subject","Geography/market subject"}:
  return "Private Career Representation or Career Positioning"
 return "No automatic handoff"

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument("--output-dir",default=str(ROOT/"development"/"audit-output"))
 out=Path(ap.parse_args().output_dir); out.mkdir(parents=True,exist_ok=True)
 if not COVERAGE.is_file() or not SITEMAP.is_file(): print("Missing coverage or sitemap",file=sys.stderr); return 2
 with COVERAGE.open(encoding="utf-8-sig",newline="") as f: coverage=list(csv.DictReader(f))
 xml=SITEMAP.read_text(encoding="utf-8")
 sitemap=set(re.findall(r"<loc>\s*(.*?)\s*</loc>",xml,re.I))
 published=[r for r in coverage if r.get("eligibility","").lower()=="published" and r.get("sitemap","").lower()=="yes"]
 urls={r.get("canonical","").strip() for r in published}
 baseline=[] 
 if len(sitemap)!=len(re.findall(r"<loc>\s*(.*?)\s*</loc>",xml,re.I)): baseline.append("Duplicate sitemap loc entries detected.")
 if sitemap!=urls: baseline.append(f"Coverage mismatch: sitemap {len(sitemap)}, coverage {len(urls)}, missing {len(urls-sitemap)}, extra {len(sitemap-urls)}.")

 results=[]; missing=[]; roles=defaultdict(list); industries=defaultdict(list)
 paragraphs=defaultdict(set); famcounts=Counter(); flags=Counter()
 for r in sorted(published,key=lambda x:x.get("path","")):
  path=r.get("path","").replace("\\","/").lstrip("/")
  file=ROOT/path
  if not file.is_file(): missing.append(path); continue
  p=PageParser(); p.feed(file.read_text(encoding="utf-8",errors="replace"))
  txt=p.text; words=TOKEN.findall(txt.lower()); n=len(words); fam=family(path); famcounts[fam]+=1
  h1=[v for t,v in p.headings if t=="h1"]; h2=[v for t,v in p.headings if t=="h2"]
  links=service_links(p.anchors,path); expected=handoff(fam,path,txt); issues=[]
  if not h1: issues.append("missing_h1"); flags["missing_h1"]+=1
  if len(h1)>1: issues.append("multiple_h1"); flags["multiple_h1"]+=1
  if not h2: issues.append("no_h2"); flags["no_h2"]+=1
  threshold=250 if fam in {"Commercial conversion","Individual service"} else 180
  if n<threshold: issues.append(f"low_words_under_{threshold}"); flags["low_word_count"]+=1
  if expected not in {"No automatic handoff","Editorial review only; no default service handoff"} and not links: issues.append("no_service_link_detected"); flags["no_service_link_detected"]+=1
  placeholder=any(rx.search(txt) for rx in PLACEHOLDERS)
  if placeholder: issues.append("possible_placeholder_or_staging_label"); flags["possible_placeholder"]+=1
  stage_disclosure=any(rx.search(txt) for rx in STAGING_MARKERS)
  coverage_status=r.get("eligibility","").strip().lower()
  coverage_sitemap=r.get("sitemap","").strip().lower()
  index_allowed=bool(re.search(r"\bindex\b",p.robots,re.I)) and not bool(re.search(r"\bnoindex\b",p.robots,re.I))
  staging_conflict=stage_disclosure and coverage_status=="published" and coverage_sitemap=="yes" and index_allowed
  if staging_conflict: flags["staging_disclosure_but_publicly_indexable"]+=1
  opening="customer-situation language detected" if re.search(r"\b(you|your|when|if|struggling|uncertain|difficult|need to)\b",txt[:500],re.I) else "editorial review needed"
  for para in p.paragraphs:
   norm=re.sub(r"[^a-z0-9]+"," ",para.lower()).strip()
   if len(norm)>=180: paragraphs[norm].add(path)
  rg,ig=groups_for(path); item={"path":path,"title":p.title or r.get("title",""),"canonical":r.get("canonical",""),"family":fam,"words":words,"shingles":shingles(words)}
  if rg: roles[rg].append(item)
  if ig: industries[ig].append(item)
  results.append({
   "path":path,"canonical":r.get("canonical",""),"title":item["title"],"family":fam,
   "source_robots":p.robots,"coverage_eligibility":coverage_status,"coverage_sitemap":coverage_sitemap,
   "stage_disclosure":"yes" if stage_disclosure else "no",
   "source_publication_status_conflict":"yes" if staging_conflict else "no",
   "visible_words":n,"h1_count":len(h1),"h1":" | ".join(h1),"h2_count":len(h2),
   "paragraph_count":len(p.paragraphs),"description_length":len(p.description),
   "service_links":links,"expected_handoff":expected,"opening_signal":opening,
   "possible_placeholder":"yes" if placeholder else "no","issue_flags":"; ".join(issues),
   "opening_excerpt":txt[:700]})
 duplicates=[(len(paths),text,sorted(paths)) for text,paths in paragraphs.items() if len(paths)>1]
 duplicates.sort(reverse=True)
 pairs=[]; failed=[]
 for kind,groups in (("role",roles),("industry",industries)):
  for group,pages in sorted(groups.items()):
   for a,b in combinations(pages,2):
    score=similarity(a["shingles"],b["shingles"])
    row=(score,kind,group,a["path"],b["path"]); pairs.append(row)
    if score>LIMIT: failed.append(row)
 pairs.sort(reverse=True); failed.sort(reverse=True)
 csvpath=out/"kov-commercial-content-audit.csv"
 fields=["path","canonical","title","family","source_robots","coverage_eligibility","coverage_sitemap","stage_disclosure","source_publication_status_conflict","visible_words","h1_count","h1","h2_count","paragraph_count","description_length","service_links","expected_handoff","opening_signal","possible_placeholder","issue_flags","opening_excerpt"]
 with csvpath.open("w",encoding="utf-8-sig",newline="") as f:
  w=csv.DictWriter(f,fieldnames=fields); w.writeheader(); w.writerows(results)
 total=len(results); no_link=flags["no_service_link_detected"]
 stage_rows=[x for x in results if x["source_publication_status_conflict"]=="yes"]
 stage_path=out/"kov-staging-routes-review.csv"
 with stage_path.open("w",encoding="utf-8-sig",newline="") as f:
  stage_fields=["path","canonical","title","source_robots","coverage_eligibility","coverage_sitemap","visible_words","opening_excerpt"]
  sw=csv.DictWriter(f,fieldnames=stage_fields); sw.writeheader()
  for x in stage_rows: sw.writerow({k:x[k] for k in stage_fields})
 lines=["# KOV commercial content audit","","Read-only audit of sitemap-published HTML. It does not edit HTML, metadata, canonicals, robots directives, sitemap or dataset content.","",
 "## Scope and reconciliation","",f"- Sitemap URLs: {len(sitemap):,}",f"- Published coverage rows: {len(published):,}",f"- Pages read: {total:,}",f"- Missing source HTML files: {len(missing):,}",f"- Reconciliation warnings: {len(baseline):,}","","## Page families","","| Family | Pages |","|---|---:|"]
 lines += [f"| {k} | {v:,} |" for k,v in sorted(famcounts.items())]
 lines += ["","## Structure and handoff review","","| Flag | Pages |","|---|---:|"]
 lines += [f"| {k.replace('_',' ')} | {v:,} |" for k,v in sorted(flags.items())]
 lines += ["","These are review flags, not automatic instructions to add text or links. A reference page should remain useful as a reference, and a service link should be inserted only when genuinely relevant.","",
 "## Source-file staging disclosure versus publication status","",
 f"- Pages whose source HTML identifies them as staged/draft/internal planning, while the source coverage register says published and sitemap=yes and the source robots directive appears to permit indexing: {len(stage_rows):,}.",
 "- This is a source-repository consistency flag, not proof of Google indexing status or a claim about the deployed response.",
 "- Google Search Console URL Inspection can report a different robots/canonical state; inspect the exact URL before changing anything.",
 "- The current sitemap contains no `/staging/` URLs, but selected legacy `/staging/` URLs are still reported by Google as indexed; these are recorded separately in the publication-status exceptions note.",
 f"- Detailed route list: {stage_path.name}.","","## Repeated substantial paragraphs","",f"- Shared paragraphs of 180+ characters: {len(duplicates):,}.","",
 "| Pages | Paragraph excerpt |","|---:|---|"]
 for count,text,_ in duplicates[:25]: lines.append(f"| {count} | {text[:180].replace('|','\\|')} |")
 lines += ["","## Exact eight-word passage overlap","",f"- Within-role and within-industry comparisons: {len(pairs):,}.",f"- Comparisons above {LIMIT:.0%}: {len(failed):,}.","- Metric: Jaccard overlap of exact contiguous eight-word passages, consistent with scripts/check-research-pages.py.","","| Overlap | Group | Page A | Page B |","|---:|---|---|---|"]
 for score,kind,group,a,b in pairs[:25]: lines.append(f"| {score:.2%} | {kind}: {group} | {a} | {b} |")
 if failed:
  lines += ["","### Above-threshold comparisons","","| Overlap | Group | Page A | Page B |","|---:|---|---|---|"]
  for score,kind,group,a,b in failed: lines.append(f"| {score:.2%} | {kind}: {group} | {a} | {b} |")
 lines += ["","## Missing source files",""]+[f"- {x}" for x in missing[:100]]
 lines += ["","## Reconciliation warnings",""]+[f"- {x}" for x in baseline]
 if not missing and not baseline: lines.append("- None.")
 lines += ["","## Outputs","",f"- Page-level CSV: {csvpath.name}","- The detailed CSV includes the opening copy for manual review, page-level headings and detected service links."]
 report=out/"kov-commercial-content-audit-summary.md"; report.write_text("\n".join(lines)+"\n",encoding="utf-8")
 print(f"Pages audited: {total:,}; missing files: {len(missing):,}; handoff flags: {no_link:,}")
 print(f"Eight-word comparisons: {len(pairs):,}; above {LIMIT:.0%}: {len(failed):,}")
 print(f"CSV: {csvpath}; summary: {report}")
 return 1 if baseline or missing else 0

if __name__=="__main__": sys.exit(main())
