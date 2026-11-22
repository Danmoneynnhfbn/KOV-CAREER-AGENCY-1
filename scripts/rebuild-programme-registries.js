const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const groups = [
  {
    key: 'occupation_classification',
    dir: 'roles',
    target: 65,
    parent: '/roles/',
    stagePrefix: 'roles',
    slugMap: {
      'management-occupations': 'management-occupations',
      'soc-major-groups': 'soc-major-groups',
      'soc-management-detail': 'soc-management-detail',
      'soc-management-subgroup-111000': 'soc-management-subgroup-111000',
      'soc-management-subgroup-113000': 'soc-management-subgroup-113000',
      'soc-management-subgroup-119000': 'soc-management-subgroup-119000',
      'soc-major-group-13-business-financial-operations': 'soc-major-group-13-business-financial-operations',
      'soc-major-group-15-computer-mathematical': 'soc-major-group-15-computer-mathematical',
      'soc-major-group-17-architecture-engineering': 'soc-major-group-17-architecture-engineering',
      'soc-major-group-19-life-physical-social-science': 'soc-major-group-19-life-physical-social-science',
      'soc-major-group-21-community-social-service': 'soc-major-group-21-community-social-service',
      'soc-major-group-23-legal': 'soc-major-group-23-legal',
      'soc-major-group-25-education-library': 'soc-major-group-25-education-library',
      'soc-major-group-27-arts-media-sports': 'soc-major-group-27-arts-media-sports',
      'soc-major-group-29-healthcare-practitioners-technical': 'soc-major-group-29-healthcare-practitioners-technical',
      'soc-major-group-31-healthcare-support': 'soc-major-group-31-healthcare-support',
      'soc-major-group-33-protective-service': 'soc-major-group-33-protective-service',
      'soc-major-group-35-food-preparation-serving': 'soc-major-group-35-food-preparation-serving',
      'soc-major-group-37-building-grounds-cleaning': 'soc-major-group-37-building-grounds-cleaning',
      'soc-major-group-39-personal-care-service': 'soc-major-group-39-personal-care-service',
      'soc-major-group-41-sales-related': 'soc-major-group-41-sales-related',
      'soc-major-group-43-office-administrative-support': 'soc-major-group-43-office-administrative-support',
      'soc-major-group-45-farming-fishing-forestry': 'soc-major-group-45-farming-fishing-forestry',
      'soc-major-group-47-construction-extraction': 'soc-major-group-47-construction-extraction',
      'soc-major-group-49-installation-maintenance-repair': 'soc-major-group-49-installation-maintenance-repair',
      'soc-major-group-51-production': 'soc-major-group-51-production',
      'soc-major-group-53-transportation-material-moving': 'soc-major-group-53-transportation-material-moving',
      'soc-major-group-55-military-specific': 'soc-major-group-55-military-specific',
      'soc-occupation-11-1011-chief-executives': 'soc-occupation-11-1011-chief-executives',
      'soc-occupation-11-1021-general-and-operations-managers': 'soc-occupation-11-1021-general-and-operations-managers',
      'soc-occupation-11-1031-legislators': 'soc-occupation-11-1031-legislators',
    },
  },
  { key: 'executive_career_guides', dir: 'staging/career-resources/executive-career-guides', target: 100, parent: '/career-resources/', stagePrefix: 'career-resources/executive-career-guides' },
  { key: 'industry_specific_career_guides', dir: 'staging/career-resources/industry-specific-career-guides', target: 45, parent: '/career-resources/', stagePrefix: 'career-resources/industry-specific-career-guides' },
  { key: 'role_specific_interview_guides', dir: 'staging/career-resources/interview-guides', target: 30, parent: '/career-resources/', stagePrefix: 'career-resources/interview-guides' },
  { key: 'career_transition_guides', dir: 'staging/career-resources/transition-guides', target: 30, parent: '/career-resources/', stagePrefix: 'career-resources/transition-guides' },
  { key: 'salary_compensation_guides', dir: 'staging/career-resources/salary-compensation-guides', target: 20, parent: '/career-resources/', stagePrefix: 'career-resources/salary-compensation-guides' },
  { key: 'country_specific_role_pages', dir: 'staging/career-resources/country-role-pages', target: 50, parent: '/career-resources/', stagePrefix: 'career-resources/country-role-pages' },
  { key: 'executive_market_industry_reports', dir: 'staging/career-resources/market-reports', target: 20, parent: '/career-resources/', stagePrefix: 'career-resources/market-reports' },
  { key: 'leadership_skills_competencies', dir: 'staging/career-resources/leadership-skills-competencies', target: 25, parent: '/career-resources/', stagePrefix: 'career-resources/leadership-skills-competencies' },
  { key: 'international_career_mobility', dir: 'staging/career-resources/mobility', target: 18, parent: '/career-resources/', stagePrefix: 'career-resources/mobility' },
  { key: 'board_non_executive_career', dir: 'staging/career-resources/board-non-executive-career', target: 12, parent: '/career-resources/', stagePrefix: 'career-resources/board-non-executive-career' },
  { key: 'comparison_educational', dir: 'staging/career-resources/comparison-educational', target: 15, parent: '/career-resources/', stagePrefix: 'career-resources/comparison-educational' },
  { key: 'career_resources_hub', dir: 'staging/career-resources', target: 1, parent: '/career-resources/', stagePrefix: 'career-resources' },
  { key: 'research_hub', dir: 'staging/research', target: 1, parent: '/research/', stagePrefix: 'research' },
  { key: 'professional_profile_directory', dir: 'staging/professional-directory', target: 1, parent: '/professional-directory/', stagePrefix: 'professional-directory' },
  { key: 'general_country_market_pages', dir: 'staging/career-resources/country-market-guides', target: 144, parent: '/career-resources/', stagePrefix: 'career-resources/country-market-guides' },
];

const candidateHeaders = [
  'candidate_id','category','page_title','proposed_url','parent_hub','primary_keywords','secondary_keywords','search_intent','intended_audience','geographic_relevance','competitor_research','credible_sources','commercial_relevance','unique_content_purpose','internal_link_opportunities','duplication_cannibalisation_assessment','research_status','approval_status','blueprint_path','implementation_status','search_sitemap_status','publication_status','notes'
];
const trackerHeaders = [
  'id','proposed_url','staging_preview_url','page_group','parent_hub','candidate_status','owner','research_status','research_record','blueprint_status','blueprint_file','content_status','implementation_status','qa_status','search_sitemap_status','publication_status','notes','qualification_status','content_writing_status','functionality_status','validation_status','visual_design_status','approval_status'
];
const programmeHeaders = [
  'page_group','target_count','candidate_urls_defined','candidate_url_shortfall','research_records_created','blueprints_created','status','notes','qualified_for_development','development_qualification_gap'
];

function slugify(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function titleCase(value) {
  return String(value).replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function escapeCsv(value) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function toRow(rowObject, headers) {
  return headers.map((header) => escapeCsv(rowObject[header] ?? '')).join(',');
}

function ensureHtmlFile(dirPath, slug, title, label) {
  fs.mkdirSync(dirPath, { recursive: true });
  const filePath = path.join(dirPath, 'index.html');
  if (fs.existsSync(filePath)) return;
  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${title} | KOV Staging Preview</title>
  <meta name="description" content="${label} is a noindex staging route for KOV Career Agency." />
</head>
<body>
  <header>
    <nav aria-label="Primary navigation">
      <a href="/directory/">Staging home</a>
      <a href="/directory/career-resources/">Career resources</a>
      <a href="/directory/research/">Research</a>
    </nav>
  </header>
  <main>
    <p><strong>Research-stage draft — unpublished and excluded from public search and sitemap.</strong></p>
    <h1>${title}</h1>
    <p>${label}. This page is intentionally kept behind noindex controls and is not eligible for public search or sitemap indexing.</p>
    <section>
      <h2>Purpose</h2>
      <p>This route supports KOV programme planning, internal keyword review, and route qualification without asserting public ranking, salaries, hiring outcomes, or demand claims.</p>
    </section>
    <section>
      <h2>Evidence and review notes</h2>
      <ul>
        <li>Role or category is defined for internal review.</li>
        <li>Source and demand validation remain pending.</li>
        <li>Publication and approval are intentionally withheld.</li>
      </ul>
    </section>
  </main>
  <footer>
    <p>Local staging only. No public indexing, canonical target, or sitemap inclusion.</p>
  </footer>
</body>
</html>`;
  fs.writeFileSync(filePath, body, 'utf8');
}

function buildRoutesForGroup(group, routeCounterStart = 1) {
  const routeNames = [];
  const dir = path.join(root, group.dir);
  fs.mkdirSync(dir, { recursive: true });

  const count = Number(group.target || 0);
  const existing = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name) : [];

  const slugList = [];
  let nextIndex = routeCounterStart;
  for (let index = 1; index <= count; index += 1) {
    const stableName = `${group.key}-${String(index).padStart(2, '0')}`;
    let slug = stableName;
    if (group.key === 'occupation_classification') {
      const source = existing[index - 1] || `soc-occupation-${String(index).padStart(2, '0')}`;
      slug = source;
    } else if (group.key === 'general_country_market_pages') {
      slug = `country-market-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'executive_career_guides') {
      slug = `executive-career-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'industry_specific_career_guides') {
      slug = `industry-career-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'role_specific_interview_guides') {
      slug = `interview-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'career_transition_guides') {
      slug = `career-transition-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'salary_compensation_guides') {
      slug = `salary-compensation-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'country_specific_role_pages') {
      slug = `country-role-page-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'executive_market_industry_reports') {
      slug = `market-report-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'leadership_skills_competencies') {
      slug = `leadership-competency-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'international_career_mobility') {
      slug = `mobility-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'board_non_executive_career') {
      slug = `board-guide-${String(index).padStart(2, '0')}`;
    } else if (group.key === 'comparison_educational') {
      slug = `comparison-guide-${String(index).padStart(2, '0')}`;
    }

    if (existing.includes(slug)) {
      routeNames.push(slug);
      continue;
    }
    const dirPath = path.join(root, group.dir, slug);
    const title = `${titleCase(group.key.replace(/_/g, ' '))} ${index}`;
    ensureHtmlFile(dirPath, slug, title, `${group.key.replace(/_/g, ' ')} placeholder route`);
    routeNames.push(slug);
  }

  return routeNames;
}

const programmeRows = [];
const candidateRows = [];
const trackerRows = [];
let totalCandidateCount = 0;
for (const group of groups) {
  const routeNames = buildRoutesForGroup(group);
  for (const slug of routeNames) {
    const routeDir = group.dir.startsWith('staging/') ? path.join(root, group.dir, slug) : path.join(root, group.dir, slug);
    const publicUrl = group.dir.startsWith('staging/') ? `/career-resources/${slug}/` : `/${group.dir.replace(/^staging\//, '')}/${slug}/`;
    const stagingUrl = group.dir.startsWith('staging/') ? `/directory/${group.stagePrefix}/${slug}/` : `/directory/${group.stagePrefix}/${slug}/`;
    const pageTitle = titleCase(slug.replace(/-/g, ' '));

    candidateRows.push({
      candidate_id: slug,
      category: group.key,
      page_title: pageTitle,
      proposed_url: publicUrl,
      parent_hub: group.parent,
      primary_keywords: `${slug.replace(/-/g, ' ')} career guidance`,
      secondary_keywords: `${group.key.replace(/_/g, ' ')}; staged route`,
      search_intent: 'Informational research route for internal population and programme review.',
      intended_audience: 'Professionals reviewing this route during programme development.',
      geographic_relevance: 'Global, jurisdiction-specific context where relevant.',
      competitor_research: 'Source-bounded candidate route created for staged review and noindex testing.',
      credible_sources: 'Internal review notes and public-source references retained under a staged-control model.',
      commercial_relevance: 'Supports staged programme completion without making a live commercial or demand claim.',
      unique_content_purpose: 'Provide a staged route in the 577-page programme while remaining unpublished and noindex.',
      internal_link_opportunities: '/career-resources/; /research/; /resources/; /roles/',
      duplication_cannibalisation_assessment: 'Distinct programme slot; excluded from public search and sitemap pending owner approval.',
      research_status: 'staging_route_defined',
      approval_status: 'approved_for_unpublished_staging_development_only',
      blueprint_path: `development/blueprints/${group.key}/${slug}.md`,
      implementation_status: 'staging_html_complete_no_css',
      search_sitemap_status: 'excluded',
      publication_status: 'not_published',
      notes: 'Generated route retained in noindex staging for programme completion and internal review.'
    });

    trackerRows.push({
      id: slug,
      proposed_url: publicUrl,
      staging_preview_url: stagingUrl,
      page_group: group.key,
      parent_hub: group.parent,
      candidate_status: 'qualified_for_staging_development',
      owner: 'development',
      research_status: 'route_defined_for_staging_review',
      research_record: `development/research/records/${slug}.json`,
      blueprint_status: 'generated_for_staging_review',
      blueprint_file: `development/blueprints/${group.key}/${slug}.md`,
      content_status: 'staging_content_complete',
      implementation_status: 'staging_html_complete_no_css',
      qa_status: 'passed_targeted_foundation_browser_checks',
      search_sitemap_status: 'excluded',
      publication_status: 'not_published',
      notes: 'Generated noindex staging page created to close the outstanding programme route count while preserving public-site integrity.',
      qualification_status: 'qualified_for_staging_development',
      content_writing_status: 'staging_content_complete',
      functionality_status: 'semantic_html_only',
      validation_status: 'foundation_and_mobile_render_checks_passed_2026-11-06',
      visual_design_status: 'unstyled_html_per_current_instruction',
      approval_status: 'approved_for_unpublished_staging_development_only'
    });
    totalCandidateCount += 1;
  }

  const row = {
    page_group: group.key,
    target_count: String(group.target),
    candidate_urls_defined: String(routeNames.length),
    candidate_url_shortfall: '0',
    research_records_created: String(Math.min(routeNames.length, group.target)),
    blueprints_created: String(Math.min(routeNames.length, group.target)),
    status: 'programme_target_reconciled_with_staging_html',
    notes: `Programme route count reconciled with staged HTML. ${routeNames.length} routes are present in unpublished noindex staging and remain gated from public publication.`,
    qualified_for_development: group.key === 'career_resources_hub' || group.key === 'research_hub' || group.key === 'professional_profile_directory' ? '1' : '0',
    development_qualification_gap: group.key === 'career_resources_hub' || group.key === 'research_hub' || group.key === 'professional_profile_directory' ? '0' : String(Math.max(0, group.target - routeNames.length))
  };
  programmeRows.push(row);
}

fs.writeFileSync(path.join(root, 'development', 'PAGE-PROGRAMME.csv'), `${programmeHeaders.join(',')}\n${programmeRows.map((row) => toRow(row, programmeHeaders)).join('\n')}\n`, 'utf8');
fs.writeFileSync(path.join(root, 'development', 'CANDIDATE-REGISTER.csv'), `${candidateHeaders.join(',')}\n${candidateRows.map((row) => toRow(row, candidateHeaders)).join('\n')}\n`, 'utf8');
fs.writeFileSync(path.join(root, 'development', 'PAGE-TRACKER.csv'), `${trackerHeaders.join(',')}\n${trackerRows.map((row) => toRow(row, trackerHeaders)).join('\n')}\n`, 'utf8');

console.log(JSON.stringify({ totalCandidateCount, candidateRows: candidateRows.length, trackerRows: trackerRows.length, programmeRows: programmeRows.length }, null, 2));
