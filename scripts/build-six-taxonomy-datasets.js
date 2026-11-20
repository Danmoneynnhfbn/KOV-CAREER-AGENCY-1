'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.kovcareeragency.org';
const OUTPUT = path.join(ROOT, 'data/taxonomy/kov-six-category-taxonomies.json');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'PAGE_MANIFEST.json'), 'utf8'));
const pageItems = manifest.repository_html_inventory.files.map((item) => ({
  path: item.path.replace(/\\/g, '/'), indexable: Boolean(item.indexable),
}));
const pageByPath = new Map(pageItems.map((item) => [item.path, item]));
const faqDirectory = require('../assets/faq-directory.js').faqDirectory;
const keywordCsv = fs.readFileSync(path.join(ROOT, 'development/KEYWORD-INTENT-MAP.csv'), 'utf8');

const SOURCE = {
  icse18: 'https://webapps.ilo.org/ilostat-files/Documents/ICSE-18_manual.pdf',
  iloTemporary: 'https://www.ilo.org/resource/other/what-temporary-employment',
  iloNonstandard: 'https://www.ilo.org/wcmsp5/groups/public/---dgreports/---dcomm/---publ/documents/publication/wcms_534326.pdf',
  iloJobSharing: 'https://www.ilo.org/resource/article/work-sharing-strategy-preserve-jobs-during-global-jobs-crisis',
  euHours: 'https://employment-social-affairs.ec.europa.eu/policies-and-activities/rights-work/labour-law/working-conditions/transparent-and-predictable-working-conditions_en',
  ukEmployment: 'https://www.gov.uk/government/publications/employment-status-and-employment-rights/employment-status-and-employment-rights-guidance-for-hr-professionals-legal-professionals-and-other-groups',
  iloRemote: 'https://www.ilo.org/publications/defining-and-measuring-remote-work-telework-work-home-and-home-based-work',
  iloHome: 'https://www.ilo.org/resource/other/working-home',
  iloPlatform: 'https://www.ilo.org/resource/other/c193-decent-work-platform-economy-convention-2026',
  gscDocs: 'https://developers.google.com/webmaster-tools/v1/searchanalytics/query',
  kovSeniority: SITE + '/career-strategy-senior-leaders.html',
};
const TARGETS = {
  'professional-audience': 471, 'job-function': 100, 'seniority-level': 10,
  'employment-type': 30, 'career-challenge': 250, 'career-search-intent': 5000,
};

function decode(text) {
  return String(text || '').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
}
function normalize(text) {
  return String(text || '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('en');
}
function stableId(category, label) {
  const digest = crypto.createHash('sha256').update(normalize(label)).digest('hex').slice(0, 16);
  const token = normalize(label).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36);
  return category + ':' + token + ':' + digest;
}
function pageUrl(pagePath) { return SITE + '/' + pagePath.replace(/^\/+/, ''); }
function titleCase(slug) {
  return slug.replace(/\.html$/i, '').split(/[-_]+/).filter(Boolean)
    .map((word) => word.length <= 3 && word === word.toUpperCase()
      ? word : word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
function heading(html) {
  const found = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i);
  return found ? decode(found[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) : '';
}
function routeAudienceRecords() {
  const byLabel = new Map();
  for (const item of pageItems) {
    const match = item.path.match(/^roles\/([^/]+)\/([^/]+)\.html$/i);
    if (!match || !item.indexable) continue;
    const html = fs.readFileSync(path.join(ROOT, item.path), 'utf8');
    const h1 = heading(html);
    if (!h1) continue;
    const subject = h1.match(/^(.*?)\s+career representation in\s+(.+)$/i);
    const role = subject ? subject[1].trim() : titleCase(match[1]);
    const industry = subject ? subject[2].trim() : titleCase(match[2]);
    const name = role + ' professionals in ' + industry;
    const key = normalize(name);
    const record = byLabel.get(key) || {
      id: stableId('audience', name), name,
      description: 'KOV-defined role-and-industry audience segment derived from one or more indexed role-page headings. This is a site-content classification, not an externally measured population.',
      identifier: 'KOV audience segment: ' + name, sourceType: 'site_page',
      sourcePath: item.path, sourceUrl: pageUrl(item.path), citation: pageUrl(item.path),
      sourcePaths: [], sourceUrls: [], pagePaths: [],
      relatedRole: role, relatedIndustry: industry,
    };
    record.sourcePaths.push(item.path);
    record.sourceUrls.push(pageUrl(item.path));
    record.pagePaths.push(item.path);
    if (!record.sourceHeadings) record.sourceHeadings = [];
    record.sourceHeadings.push(h1);
    byLabel.set(key, record);
  }
  return [...byLabel.values()];
}
function rolePaths() {
  const result = new Map();
  for (const item of pageItems) {
    const match = item.path.match(/^roles\/([^/]+)\/([^/]+)\.html$/i);
    if (!match || !item.indexable) continue;
    if (!result.has(match[1])) result.set(match[1], []);
    result.get(match[1]).push(item.path);
  }
  return result;
}
function jobFunctionRecords(roleMap) {
  const groupMap = [
    ['Corporate governance', ['board-director', 'non-executive-director', 'chair']],
    ['Executive leadership', ['ceo', 'managing-director', 'managing-partner']],
    ['Finance', ['cfo', 'director-finance', 'vp-finance']],
    ['Engineering', ['cto', 'director-engineering', 'vp-engineering']],
    ['Marketing', ['cmo', 'director-marketing', 'vp-marketing']],
    ['Operations', ['coo', 'director-operations', 'vp-operations']],
    ['People and human resources', ['chro', 'director-people', 'vp-people']],
    ['Product management', ['chief-product-officer', 'director-product', 'vp-product']],
    ['Sales', ['director-sales', 'vp-sales']],
    ['Strategy', ['chief-strategy-officer', 'head-strategy', 'vp-strategy']],
    ['Revenue management', ['chief-revenue-officer']],
    ['Legal affairs', ['general-counsel', 'head-legal', 'director-legal']],
    ['Compliance', ['head-compliance']],
    ['Information technology', ['cio']],
    ['Information security', ['ciso']],
    ['Business development', ['head-business-development']],
    ['Data and artificial intelligence', ['head-data-ai']],
    ['Growth', ['head-growth']],
    ['Procurement', ['chief-procurement-officer']],
  ];
  return groupMap.map(([name, slugs]) => {
    let paths = [...new Set(slugs.flatMap((slug) => roleMap.get(slug) || []))];
    if (!paths.length && name === 'Procurement') {
      const sourceFaq = faqDirectory.find((item) => /Chief Procurement Officers/i.test(item.question));
      const sourcePath = String(sourceFaq?.source || '').replace(/^\/+/, '');
      if (pageByPath.get(sourcePath)?.indexable) paths = [sourcePath];
    }
    return {
      id: stableId('job-function', name), name,
      description: 'Internally classified KOV leadership function supported by the linked role-and-industry pages. It describes functional responsibility, not a regulated occupation or standardized international job-family code.',
      identifier: 'KOV-JF-' + String(groupMap.findIndex((item) => item[0] === name) + 1).padStart(3, '0'),
      sourceType: 'internal_role_crosswalk', sourcePaths: paths,
      sourceUrls: paths.slice(0, 3).map(pageUrl), citation: paths.length ? pageUrl(paths[0]) : SITE + '/roles/',
      pagePaths: paths, relatedRoleSlugs: slugs,
    };
  }).filter((record) => record.pagePaths.length);
}
function seniorityRecords(roleMap) {
  const levels = [
    ['Senior individual contributor', 'An experienced specialist without a stated people-management remit.', []],
    ['Lead professional', 'A specialist or lead role with broader technical or professional coordination.', []],
    ['Manager', 'A role explicitly titled manager in the mapped role directory.', []],
    ['Senior manager', 'A senior management scope where the source page uses a senior-manager or head-of-function title.', ['head-business-development', 'head-compliance', 'head-data-ai', 'head-growth', 'head-legal', 'head-strategy']],
    ['Functional head', 'A role explicitly identified as a head of a business function.', ['head-business-development', 'head-compliance', 'head-data-ai', 'head-growth', 'head-legal', 'head-strategy']],
    ['Director', 'A director-level functional role or board director as named by the source page.', ['director-engineering', 'director-finance', 'director-legal', 'director-marketing', 'director-operations', 'director-people', 'director-product', 'director-sales', 'board-director', 'non-executive-director']],
    ['Vice president', 'A role explicitly titled vice president in the mapped role directory.', ['vp-engineering', 'vp-finance', 'vp-marketing', 'vp-operations', 'vp-people', 'vp-product', 'vp-sales', 'vp-strategy']],
    ['Chief executive officer', 'A role explicitly titled chief executive officer or CEO.', ['ceo']],
    ['C-suite executive', 'A mapped chief officer role other than chief executive officer.', ['cfo', 'cmo', 'coo', 'cto', 'chro', 'cio', 'ciso', 'chief-product-officer', 'chief-revenue-officer', 'chief-strategy-officer']],
    ['Board chair', 'A chair or chairperson role in the mapped board-leadership directory.', ['chair']],
  ];
  return levels.map(([name, description, slugs], index) => {
    const paths = [...new Set(slugs.flatMap((slug) => roleMap.get(slug) || []))];
    return {
      id: stableId('seniority', name), name,
      description: 'KOV-defined descriptive level. ' + description + ' Title conventions vary by employer and market; this is not a universal rank scale.',
      identifier: 'KOV-SL-' + String(index + 1).padStart(2, '0'),
      sourceType: 'internal_taxonomy', sourcePaths: paths.length ? paths : ['career-strategy-senior-leaders.html'],
      sourceUrls: [SOURCE.kovSeniority], citation: SOURCE.kovSeniority,
      pagePaths: paths, methodology: 'KOV role-title classification; no years-of-experience thresholds are inferred.',
    };
  });
}
function employmentRecords() {
  const records = [
    ['11', 'Employers in corporations', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['12', 'Employers in household market enterprises', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['21', 'Owner-operators of corporations without employees', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['22', 'Own-account workers in household market enterprises without employees', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['30', 'Dependent contractors', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['41', 'Permanent employees', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['42', 'Fixed-term employees', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['43', 'Short-term and casual employees', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['44', 'Paid apprentices, trainees and interns', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['51', 'Contributing family workers', 'ICSE-18 detailed status-in-employment category.', SOURCE.icse18, 'status_in_employment'],
    ['arrangement-01', 'Full-time indefinite employment', 'Regular employment described by the ILO as full-time and indefinite.', SOURCE.iloNonstandard, 'work_arrangement'],
    ['arrangement-02', 'Part-time employment', 'Non-standard working-time arrangement discussed by the ILO.', SOURCE.iloNonstandard, 'work_arrangement'],
    ['arrangement-03', 'Temporary employment', 'Employment for a specific period, including fixed-term, project/task-based, seasonal or casual work.', SOURCE.iloTemporary, 'contract_duration'],
    ['arrangement-04', 'Project-based contract', 'Temporary employment arrangement tied to a project or specified event.', SOURCE.iloTemporary, 'contract_duration'],
    ['arrangement-05', 'Task-based contract', 'Temporary employment arrangement tied to a task or specified event.', SOURCE.iloTemporary, 'contract_duration'],
    ['arrangement-06', 'Seasonal employment', 'Temporary arrangement associated with seasonal work.', SOURCE.iloTemporary, 'contract_duration'],
    ['arrangement-07', 'Day labour', 'Short-duration temporary work identified by the ILO.', SOURCE.iloTemporary, 'contract_duration'],
    ['arrangement-08', 'Temporary agency work', 'Work performed temporarily for a user enterprise through an agency relationship.', SOURCE.iloNonstandard, 'intermediary_relationship'],
    ['arrangement-09', 'On-call work', 'Work performed when called as needed; hours may vary with workload.', SOURCE.euHours, 'working_time'],
    ['arrangement-10', 'Zero-hours contract', 'A contract without a fixed amount of working hours, as described in EU working-conditions guidance.', SOURCE.euHours, 'working_time'],
    ['arrangement-11', 'Job sharing', 'Two people voluntarily share responsibility for one full-time job.', SOURCE.iloJobSharing, 'working_time'],
    ['arrangement-12', 'Multi-party employment relationship', 'Work arranged through more than two contractual parties or an intermediary.', SOURCE.iloNonstandard, 'intermediary_relationship'],
    ['arrangement-13', 'Subcontracted work', 'Work delivered through a subcontracting relationship; the legal status depends on the actual relationship.', SOURCE.iloNonstandard, 'intermediary_relationship'],
    ['arrangement-14', 'Dependent self-employment', 'An ILO-described relationship where a formally self-employed worker is economically dependent.', SOURCE.iloNonstandard, 'work_relationship'],
    ['arrangement-15', 'Disguised employment relationship', 'A work relationship whose presentation obscures the underlying employment relationship.', SOURCE.iloNonstandard, 'work_relationship'],
    ['arrangement-16', 'Freelance work', 'A common label that does not itself determine legal status; classification depends on the actual relationship.', SOURCE.ukEmployment, 'work_relationship'],
    ['arrangement-17', 'Agency worker', 'A worker contracted through an agency to work temporarily for a hirer.', SOURCE.ukEmployment, 'intermediary_relationship'],
    ['arrangement-18', 'Telework', 'Work outside the employer premises using information and communications technology.', SOURCE.iloRemote, 'work_modality'],
    ['arrangement-19', 'Home-based work', 'Work performed at home or another chosen premise other than the employer workplace, as defined in ILO materials.', SOURCE.iloHome, 'work_modality'],
    ['arrangement-20', 'Digital platform work', 'Work organized or facilitated through a digital labour platform; status is determined separately.', SOURCE.iloPlatform, 'work_modality'],
  ];
  return records.map(([code, name, definition, citation, dimension]) => ({
    id: stableId('employment', code), name, description: definition + ' This classification is not mutually exclusive with records in other dimensions; legal meanings vary by jurisdiction.',
    identifier: code, sourceType: code.startsWith('arrangement-') ? 'external_classification_or_guidance' : 'external_classification',
    dimension, sourceUrls: [citation], citation, pagePaths: [],
  }));
}
function challengeRecords() {
  const rules = [
    [/^What should a senior candidate learn about a (.+) employer first\?$/i, (m) => 'Research employer context in ' + m[1]],
    [/^How does KOV adapt career materials for (.+)\?$/i, (m) => 'Adapt career materials to ' + m[1]],
    [/^What belongs on the first-discussion agenda for a (.+) in (.+)\?$/i, (m) => 'Prepare a first-discussion agenda for ' + m[1] + ' roles in ' + m[2]],
    [/^How can a (.+) make prior work relevant to (.+)\?$/i, (m) => 'Translate prior experience for ' + m[1] + ' roles in ' + m[2]],
    [/^How can a (.+) choose documents for conversations about (.+)\?$/i, (m) => 'Select career evidence for ' + m[1] + ' conversations in ' + m[2]],
    [/^How can KOV and a (.+) plan contact with (.+) organizations\?$/i, (m) => 'Plan approved outreach by ' + m[1] + ' candidates to ' + m[2] + ' organizations'],
    [/^How can a (.+) assess fit with (.+) responsibilities\?$/i, (m) => 'Assess fit between ' + m[1] + ' experience and ' + m[2] + ' responsibilities'],
    [/^What should a (.+) prepare in writing before targeting (.+)\?$/i, (m) => 'Prepare written evidence for ' + m[1] + ' opportunities in ' + m[2]],
    [/^What should a (.+) approve before outreach in (.+)\?$/i, (m) => 'Set outreach approval boundaries for ' + m[1] + ' opportunities in ' + m[2]],
    [/^What should a (.+) clarify before considering work in (.+)\?$/i, (m) => 'Clarify role scope for ' + m[1] + ' opportunities in ' + m[2]],
    [/^How can a (.+) test the scope of work in (.+)\?$/i, (m) => 'Test role scope for ' + m[1] + ' opportunities in ' + m[2]],
    [/^Can a (.+) rely on title alone when targeting (.+)\?$/i, (m) => 'Validate title-to-scope fit for ' + m[1] + ' roles in ' + m[2]],
    [/^Which questions should a (.+) resolve before a target discussion in (.+)\?$/i, (m) => 'Resolve target-discussion questions for ' + m[1] + ' roles in ' + m[2]],
    [/^Which parts of a (.+) career story fit the needs of (.+)\?$/i, (m) => 'Match ' + m[1] + ' career evidence to ' + m[2] + ' needs'],
    [/^How should a (.+) describe transferable experience for (.+) work\?$/i, (m) => 'Explain transferable experience for ' + m[1] + ' roles in ' + m[2]],
    [/^What makes a (.+) background relevant to work in (.+)\?$/i, (m) => 'Establish background relevance for ' + m[1] + ' roles in ' + m[2]],
    [/^What evidence can a (.+) use to explain experience in (.+)\?$/i, (m) => 'Select evidence to explain ' + m[1] + ' experience in ' + m[2]],
    [/^How should a (.+) compare title and remit in (.+)\?$/i, (m) => 'Compare role title with actual remit for ' + m[1] + ' work in ' + m[2]],
    [/^Which questions should a (.+) resolve before a target discussion(?: for| in) (.+)\?$/i, (m) => 'Resolve target-discussion questions for ' + m[1] + ' opportunities in ' + m[2]],
    [/^How should I compare two (.+) opportunities\?$/i, (m) => 'Compare role opportunities in ' + m[1]],
    [/^Which career materials can help a (.+) explore work in (.+)\?$/i, (m) => 'Select career evidence for ' + m[1] + ' opportunities in ' + m[2]],
    [/^Which outreach choices belong to a (.+) considering (.+)\?$/i, (m) => 'Set appropriate outreach boundaries for ' + m[1] + ' opportunities in ' + m[2]],
    [/^What can KOV promise a (.+) candidate considering (.+)\?$/i, (m) => 'Set realistic service expectations for ' + m[1] + ' candidates considering ' + m[2]],
    [/^What should a (.+) establish before approaching a new employer\?$/i, (m) => 'Establish target-role fit and evidence before ' + m[1] + ' employer outreach'],
    [/^Which documents help explain a (.+) career\?$/i, (m) => 'Select documents to explain a ' + m[1] + ' career'],
    [/^How should a (.+) describe shared outcomes\?$/i, (m) => 'Attribute shared outcomes accurately in a ' + m[1] + ' career story'],
    [/^Can KOV (?:guarantee|arrange) (.+)\?$/i, (m) => 'Clarify limits and external dependencies for ' + m[1]],
  ];
  const records = [];
  const seen = new Set();
  let matchedQuestions = 0;
  let duplicatesMerged = 0;
  for (const faq of faqDirectory) {
    let name = '';
    let ruleUsed = null;
    for (const [pattern, build] of rules) {
      const match = faq.question.match(pattern);
      if (match) { name = build(match); ruleUsed = pattern.toString(); break; }
    }
    if (!name && /^How should I approach (writing an executive resume|optimising a LinkedIn profile|preparing interview stories|preparing for panel interviews|contacting hiring managers)\?$/i.test(faq.question)) {
      name = faq.question.replace(/^How should I approach /i, '').replace(/\?$/, '').replace(/^./, (x) => x.toUpperCase());
      ruleUsed = 'direct KOV FAQ on executive career-preparation difficulty';
    }
    if (!name && /^How should I approach (.+)\?$/i.test(faq.question)) {
      name = 'Plan an effective approach to ' + faq.question.match(/^How should I approach (.+)\?$/i)[1];
      ruleUsed = 'direct KOV FAQ asking how to approach a career-search or career-positioning task';
    }
    if (!name && /^What if my work is confidential\?$/i.test(faq.question)) {
      name = 'Protect confidential information while presenting career evidence';
      ruleUsed = 'direct KOV FAQ identifying a confidentiality and disclosure concern';
    }
    if (!name && /^How long does an executive job search take\?$/i.test(faq.question)) {
      name = 'Set realistic expectations for executive job-search duration';
      ruleUsed = 'direct KOV FAQ addressing executive-search timing uncertainty';
    }
    if (!name && /^Can you help describe projects if I do not have formal case studies\?$/i.test(faq.question)) {
      name = 'Present project evidence when formal case studies are unavailable';
      ruleUsed = 'direct KOV FAQ identifying a career-evidence presentation need';
    }
    if (!name && /^What belongs on the first-discussion agenda for a (.+) in (.+)\?$/i.test(faq.question)) {
      const match = faq.question.match(/^What belongs on the first-discussion agenda for a (.+) in (.+)\?$/i);
      name = 'Prepare a first-discussion agenda for ' + match[1] + ' roles in ' + match[2];
      ruleUsed = 'direct KOV role-and-industry FAQ about target-discussion preparation';
    }
    if (!name && /^What can a (.+) promise (.+)\?$/i.test(faq.question)) {
      const match = faq.question.match(/^What can a (.+) promise (.+)\?$/i);
      name = 'Set realistic expectations for ' + match[1] + ' candidates considering ' + match[2];
      ruleUsed = 'direct KOV FAQ about expectation-setting and outcome uncertainty';
    }
    if (!name && /career changers|changing industries|relocation support|returning from sabbatical|professionals returning to employment/i.test(faq.question)) {
      name = faq.question.replace(/\?$/, '');
      ruleUsed = 'direct KOV FAQ on career transition or mobility concern';
    }
    if (!name) continue;
    matchedQuestions += 1;
    if (seen.has(normalize(name))) { duplicatesMerged += 1; continue; }
    seen.add(normalize(name));
    const sourcePath = String(faq.source || '').replace(/^\/+/, '');
    const pagePath = pageByPath.has(sourcePath) && pageByPath.get(sourcePath).indexable ? sourcePath : '';
    records.push({
      id: stableId('challenge', name), name,
      description: 'KOV-authored FAQ-derived challenge topic. The source question identifies a planning or career-positioning issue; it does not claim prevalence or that every professional experiences it.',
      identifier: 'KOV-CH-' + String(records.length + 1).padStart(3, '0'),
      sourceType: 'site_faq_classification', sourceQuestion: faq.question, sourcePath,
      sourceUrl: pagePath ? pageUrl(pagePath) : pageUrl(sourcePath),
      citation: pagePath ? pageUrl(pagePath) : pageUrl(sourcePath),
      pagePaths: pagePath ? [pagePath] : [], classificationRule: ruleUsed,
    });
  }
  return { records, matchedQuestions, duplicatesMerged };
}
function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if ((ch === ',' || ch === '\n' || ch === '\r') && !quoted) {
      row.push(value); value = '';
      if (ch !== ',') {
        if (ch === '\r' && text[i + 1] === '\n') i += 1;
        if (row.some((cell) => cell !== '')) rows.push(row);
        row = [];
      }
    } else value += ch;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const header = rows.shift().map((key) => key.replace(/^\uFEFF/, ''));
  return rows.map((cells) => Object.fromEntries(header.map((key, index) => [key, cells[index] || ''])));
}
function routeForUrl(url) {
  if (!url || !url.startsWith('/')) return '';
  const clean = decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\/+|\/+$/g, '');
  const options = [clean, clean + '/index.html', clean + '.html'].filter(Boolean);
  for (const option of options) if (pageByPath.get(option)?.indexable) return option;
  return '';
}
function searchIntentRecords() {
  const records = [];
  const rows = parseCsv(keywordCsv);
  const seen = new Set();
  for (const row of rows) {
    const pathName = routeForUrl(row.proposed_url);
    const notObserved = /not_available/i.test(row.search_volume_status || '')
      || /no keyword tool|no search console|editorial hypothesis|unmeasured/i.test(row.keyword_source + ' ' + row.search_intent);
    const queries = [row.primary_keyword, ...String(row.secondary_keywords || '').split(';')]
      .map((value) => String(value || '').trim()).filter(Boolean);
    for (const query of queries) {
      const key = normalize(query);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      records.push({
        id: stableId('search-intent', (row.candidate_id || 'candidate') + ':' + query), name: query,
        description: String(row.search_intent || 'KOV editorial search-intent hypothesis.') + ' Classification evidence: researched editorial candidate; not an observed Google Search Console query, and no search volume is asserted.',
        identifier: (row.candidate_id || 'candidate') + ':' + query, sourceType: notObserved ? 'editorial_hypothesis' : 'researched_hypothesis',
        keywordSource: row.keyword_source, searchVolumeStatus: row.search_volume_status || 'not_available',
        geography: row.geography, researchStatus: row.research_status, sourcePath: 'development/KEYWORD-INTENT-MAP.csv',
        citation: pathName ? pageUrl(pathName) : undefined, proposedUrl: row.proposed_url,
        pagePaths: pathName ? [pathName] : [],
        observedSearchConsoleQuery: false,
      });
    }
  }
  const researchRoot = path.join(ROOT, 'development/research/records');
  const researchFiles = fs.readdirSync(researchRoot).filter((name) => name.endsWith('.json')).sort();
  const mapTermCount = rows.reduce((sum, row) => sum + 1 + String(row.secondary_keywords || '').split(';').filter((value) => value.trim()).length, 0);
  const researchFailures = [];
  for (const fileName of researchFiles) {
    const relativePath = 'development/research/records/' + fileName;
    let item;
    try {
      item = JSON.parse(fs.readFileSync(path.join(researchRoot, fileName), 'utf8').replace(/^\uFEFF/, ''));
    }
    catch (error) { researchFailures.push({ file: relativePath, error: error.message }); continue; }
    const proposedPath = routeForUrl(item.proposed_url || '');
    const terms = [...(item.primary_keywords || []), ...(item.secondary_keywords || [])];
    for (const queryValue of terms) {
      const query = String(queryValue || '').trim();
      const key = normalize(query);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const intent = item.search_intent;
      const intentDescription = typeof intent === 'string' ? intent : intent?.intent || '';
      const evidenceNote = Array.isArray(intent?.evidence)
        ? intent.evidence.join(' ') : '';
      const volumeStatus = item.keyword_metrics?.volume_status || 'not_available';
      records.push({
        id: stableId('search-intent', item.id + ':' + query),
        identifier: item.id + ':' + query,
        name: query,
        description: (intentDescription || 'KOV editorial search-intent hypothesis for a researched content candidate.')
          + ' Classification evidence: researched hypothesis from an individual KOV research record; not an observed Google Search Console query. '
          + (evidenceNote ? 'Supporting research note: ' + evidenceNote : ''),
        sourceType: 'researched_hypothesis',
        searchVolumeStatus: volumeStatus === 'not_available' ? 'not_available' : volumeStatus,
        candidateStatus: item.candidate_status || '',
        approvalStatus: item.approval_status || '',
        researchStatus: item.record_status || '',
        sourcePath: relativePath,
        citation: proposedPath ? pageUrl(proposedPath) : undefined,
        researchEvidence: evidenceNote,
        proposedUrl: item.proposed_url || '',
        pagePaths: proposedPath ? [proposedPath] : [],
        observedSearchConsoleQuery: false,
      });
    }
  }
  for (const item of faqDirectory) {
    const query = String(item.question || '').trim();
    const key = normalize(query);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const sourcePath = String(item.source || '').replace(/^\/+/, '');
    const pagePath = pageByPath.get(sourcePath)?.indexable && !sourcePath.startsWith('staging/') ? sourcePath : '';
    const intentType = /^(can|does|do|is|are)\b/i.test(query)
      ? 'eligibility, service capability, or suitability question'
      : /^(how|what steps|how long)\b/i.test(query)
        ? 'process or guidance question' : 'informational explanation question';
    records.push({
      id: stableId('search-intent', 'faq:' + query),
      identifier: 'FAQ:' + stableId('question', query),
      name: query,
      description: 'KOV FAQ-derived search-intent hypothesis: ' + intentType + '. This question is present in KOV-authored FAQ content; it is not an observed Google Search Console query and has no measured volume.',
      sourceType: 'faq_derived_hypothesis',
      searchVolumeStatus: 'not_available',
      sourcePath: 'assets/faq-directory.js',
      sourceQuestion: query,
      sourceUrl: pagePath ? pageUrl(pagePath) : undefined,
      citation: pagePath ? pageUrl(pagePath) : pageUrl(sourcePath),
      pagePaths: pagePath ? [pagePath] : [],
      observedSearchConsoleQuery: false,
    });
  }
  const gscSourcePath = 'data/taxonomy/gsc-observed-search-queries.json';
  const gscSource = JSON.parse(fs.readFileSync(path.join(ROOT, gscSourcePath), 'utf8'));
  const gscQueries = (gscSource.records || []).filter((item) => item.includedInTaxonomy);
  let gscQueryDuplicatesMerged = 0;
  for (const item of gscQueries) {
    const query = String(item.query || '').trim();
    const key = normalize(query);
    if (!key || seen.has(key)) { gscQueryDuplicatesMerged += 1; continue; }
    seen.add(key);
    records.push({
      id: stableId('search-intent', 'gsc:' + query),
      identifier: 'GSC:' + stableId('query', query),
      name: query,
      description: 'Observed Google Search Console query for the KOV Career Agency property during '
        + gscSource.dateRange.start + ' to ' + gscSource.dateRange.end
        + '. Clicks, impressions, CTR and average position are retained as property observations; they are not search-volume estimates.',
      sourceType: 'observed_search_console_query',
      sourcePath: gscSourcePath,
      sourceUrl: gscSource.sourceUrl,
      citation: gscSource.sourceUrl,
      searchVolumeStatus: 'not_available',
      searchConsolePeriod: gscSource.dateRange,
      searchConsoleClicks: Number(item.clicks || 0),
      searchConsoleImpressions: Number(item.impressions || 0),
      searchConsoleCtr: Number(item.ctr || 0),
      searchConsoleAveragePosition: Number(item.position || 0),
      observedSearchConsoleQuery: true,
      pagePaths: [],
    });
  }
  records.gscQuerySourceRows = gscSource.totalRows || gscSource.records?.length || 0;
  records.gscQueryCandidates = gscQueries.length;
  records.gscQueryDuplicatesMerged = gscQueryDuplicatesMerged;
  records.researchFileCount = researchFiles.length;
  records.researchParseFailures = researchFailures;
  records.keywordMapTermCount = mapTermCount;
  return records;
}
function addMentionedEmploymentPages(records) {
  const candidates = pageItems.filter((item) => item.indexable && !item.path.startsWith('staging/'));
  const terms = records.map((record) => ({
    record, needle: record.name.toLocaleLowerCase('en'),
  })).filter((entry) => entry.needle.length >= 7);
  for (const record of records) {
    record.pagePaths = [];
  }
  for (const item of candidates) {
    const source = fs.readFileSync(path.join(ROOT, item.path), 'utf8');
    const body = source.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] || '';
    const html = body.replace(/<script\b[\s\S]*?<\/script\s*>/gi, ' ')
      .replace(/<style\b[\s\S]*?<\/style\s*>/gi, ' ')
      .replace(/<[^>]+>/g, ' ').replace(/&(?:amp|quot|apos|#39|lt|gt);/gi, ' ')
      .toLocaleLowerCase('en');
    for (const { record, needle } of terms) {
      if (record.pagePaths.length < 15 && html.includes(needle)) record.pagePaths.push(item.path);
    }
  }
}
function validate(categories) {
  for (const [category, records] of Object.entries(categories)) {
    const labels = new Set();
    const ids = new Set();
    for (const record of records) {
      const key = normalize(record.name);
      if (!key || labels.has(key)) throw new Error(category + ': duplicate or empty label ' + record.name);
      if (!record.id || ids.has(record.id)) throw new Error(category + ': duplicate or missing identifier');
      if (!record.description || !record.sourceType || !record.sourcePaths && !record.sourcePath && !record.sourceUrls && !record.citation) {
        throw new Error(category + ': missing definition or provenance for ' + record.name);
      }
      if (!Array.isArray(record.pagePaths)) throw new Error(category + ': pagePaths must be an array for ' + record.name);
      for (const page of record.pagePaths) {
        if (!pageByPath.get(page)?.indexable || page.startsWith('staging/')) throw new Error(category + ': invalid or nonindexable page map ' + page);
      }
      if (category === 'career-search-intent') {
        if (record.observedSearchConsoleQuery === true) {
          if (record.sourcePath !== 'data/taxonomy/gsc-observed-search-queries.json'
            || record.sourceType !== 'observed_search_console_query') {
            throw new Error('Observed Search Console query is missing its source classification: ' + record.name);
          }
          if (record.searchVolumeStatus === 'available') {
            throw new Error('Search Console impressions cannot be represented as search volume: ' + record.name);
          }
        } else if (record.observedSearchConsoleQuery !== false) {
          throw new Error('Search intent must retain evidence classification: ' + record.name);
        }
      }
      labels.add(key); ids.add(record.id);
    }
  }
}
function main() {
  const roles = rolePaths();
  const audiences = routeAudienceRecords();
  const functions = jobFunctionRecords(roles);
  const seniority = seniorityRecords(roles);
  const employment = employmentRecords();
  addMentionedEmploymentPages(employment);
  const challengeSource = challengeRecords();
  const challenges = challengeSource.records;
  const intents = searchIntentRecords();
  const categories = {
    'professional-audience': audiences, 'job-function': functions,
    'seniority-level': seniority, 'employment-type': employment,
    'career-challenge': challenges, 'career-search-intent': intents,
  };
  validate(categories);
  const result = {
    schemaVersion: 1, generatedAt: new Date().toISOString().slice(0, 10),
    targetCounts: TARGETS,
    sourceAssessment: {
      audiences: 'KOV internal role/industry audience crosswalk extracted from indexable role pages; one record per unique mapped route.',
      jobFunctions: 'KOV internal functional groupings evidenced by mapped leadership role directories; this source supports fewer than the 100 target records.',
      seniorityLevels: 'KOV internal title-scope descriptors. These are not a universal seniority scale and contain no years-of-experience thresholds.',
      employmentTypes: 'A 30-record cross-dimensional collection: 10 ICSE-18 status categories and 20 externally documented work arrangements/modalities. These records overlap and are not a mutually-exclusive classification.',
      careerChallenges: 'KOV FAQ-derived planning and career-positioning topics. These describe authored content, not measured prevalence.',
      careerSearchIntents: 'Primary and secondary keyword candidates from the KOV keyword map and research records, exact KOV FAQ questions, and relevant Google Search Console query rows. Editorial/researched candidates remain explicitly marked as hypotheses; the 2026-11-20 source export retains actual query clicks, impressions, CTR and average position for observed queries. No Search Console metric is described as search volume.',
      googleSearchConsole: 'A connected KOV Career Agency property export covering 2025-07-20 to 2026-11-17 is retained in data/taxonomy/gsc-observed-search-queries.json. Relevant queries retain actual clicks, impressions, CTR and average position; impressions are not described as search volume. Google API documentation: ' + SOURCE.gscDocs,
    },
    sourceRegistry: SOURCE,
    recordStatistics: {
      professionalAudienceSourceRoutes: pageItems.filter((item) => item.indexable && /^roles\/[^/]+\/[^/]+\.html$/i.test(item.path)).length,
      professionalAudienceLabelsMerged: pageItems.filter((item) => item.indexable && /^roles\/[^/]+\/[^/]+\.html$/i.test(item.path)).length - audiences.length,
      jobFunctionCandidates: 19, jobFunctionRecordsWithSourcePages: functions.length,
      seniorityCandidateRecords: seniority.length, employmentTypeSourceRecords: employment.length,
      careerChallengeFaqQuestionsMatched: challengeSource.matchedQuestions,
      duplicateCareerChallengeLabelsMerged: challengeSource.duplicatesMerged,
      keywordMapRows: parseCsv(keywordCsv).length, uniqueCareerSearchIntents: intents.length,
      duplicateKeywordTermsRemoved: intents.keywordMapTermCount - intents.filter((record) => record.sourcePath === 'development/KEYWORD-INTENT-MAP.csv').length,
      keywordMapUniquePrimaryAndSecondaryTerms: intents.filter((record) => record.sourcePath === 'development/KEYWORD-INTENT-MAP.csv').length,
      researchRecordFiles: intents.researchFileCount,
      researchRecordParseFailures: intents.researchParseFailures,
      researchRecordIntentRecords: intents.filter((record) => record.sourcePath.startsWith('development/research/records/')).length,
      faqIntentQuestionRows: intents.filter((record) => record.sourcePath === 'assets/faq-directory.js').length,
      careerSearchConsoleSourceRows: intents.gscQuerySourceRows,
      careerSearchConsoleCandidateRows: intents.gscQueryCandidates,
      careerSearchConsoleDuplicatesMerged: intents.gscQueryDuplicatesMerged,
      careerSearchConsoleIntentRecords: intents.filter((record) => record.sourceType === 'observed_search_console_query').length,
    },
    categories,
  };
  fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify(Object.fromEntries(Object.entries(categories).map(([key, records]) => [key, {
    count: records.length, uniqueNames: new Set(records.map((record) => normalize(record.name))).size,
    withProvenance: records.filter((record) => record.sourceType && (record.citation || record.sourceUrls || record.sourcePath || record.sourcePaths)).length,
    withPageMappings: records.filter((record) => record.pagePaths.length).length,
  }])), null, 2));
  console.log('Wrote ' + path.relative(ROOT, OUTPUT));
}

main();
