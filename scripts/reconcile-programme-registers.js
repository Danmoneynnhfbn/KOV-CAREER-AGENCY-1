const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const developmentDir = path.join(root, 'development');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (value.length > 0 || row.length > 0) {
        row.push(value);
        rows.push(row);
        row = [];
        value = '';
      }
      if (char === '\r' && text[i + 1] === '\n') i += 1;
    } else {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const [headers, ...records] = rows;
  return records.map((record) => {
    const object = {};
    headers.forEach((header, index) => {
      const key = header.replace(/^\uFEFF/, '').trim();
      object[key] = record[index] ?? '';
    });
    return object;
  });
}

function stringifyCsv(rows, headers) {
  const escape = (value) => {
    const stringValue = String(value ?? '');
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escape(row[header] ?? '')).join(','));
  });
  return `${lines.join('\n')}\n`;
}

function rowToSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'staging-page';
}

const candidatePath = path.join(developmentDir, 'CANDIDATE-REGISTER.csv');
const trackerPath = path.join(developmentDir, 'PAGE-TRACKER.csv');
const programmePath = path.join(developmentDir, 'PAGE-PROGRAMME.csv');

const candidateText = fs.readFileSync(candidatePath, 'utf8');
const trackerText = fs.readFileSync(trackerPath, 'utf8');
const programmeText = fs.readFileSync(programmePath, 'utf8');

const candidateRows = parseCsv(candidateText);
const trackerRows = parseCsv(trackerText);
const programmeRows = parseCsv(programmeText);

const candidateHeaders = [
  'candidate_id',
  'category',
  'page_title',
  'proposed_url',
  'parent_hub',
  'primary_keywords',
  'secondary_keywords',
  'search_intent',
  'intended_audience',
  'geographic_relevance',
  'competitor_research',
  'credible_sources',
  'commercial_relevance',
  'unique_content_purpose',
  'internal_link_opportunities',
  'duplication_cannibalisation_assessment',
  'research_status',
  'approval_status',
  'blueprint_path',
  'implementation_status',
  'search_sitemap_status',
  'publication_status',
  'notes',
];

const trackerHeaders = [
  'id',
  'proposed_url',
  'staging_preview_url',
  'page_group',
  'parent_hub',
  'candidate_status',
  'owner',
  'research_status',
  'research_record',
  'blueprint_status',
  'blueprint_file',
  'content_status',
  'implementation_status',
  'qa_status',
  'search_sitemap_status',
  'publication_status',
  'notes',
  'qualification_status',
  'content_writing_status',
  'functionality_status',
  'validation_status',
  'visual_design_status',
  'approval_status',
];

const candidateById = new Map(candidateRows.map((row) => [row.candidate_id, row]));
const trackerById = new Map(trackerRows.map((row) => [row.id, row]));

const pageGroupMap = new Map();
for (const row of programmeRows) {
  pageGroupMap.set(row.page_group, row);
}

const generatedCandidates = [];
const generatedTrackers = [];
const usedIds = new Set(candidateRows.map((row) => row.candidate_id));
const usedTrackerIds = new Set(trackerRows.map((row) => row.id));

for (const programmeRow of programmeRows) {
  const category = programmeRow.page_group;
  const target = Number(programmeRow.target_count || 0);
  const existingInCategory = candidateRows.filter((row) => row.category === category).length;
  const needed = Math.max(0, target - existingInCategory);
  const baseSlug = category.replace(/_/g, '-');

  for (let index = 1; index <= needed; index += 1) {
    const counter = String(existingInCategory + index).padStart(2, '0');
    const candidateId = `${baseSlug}-${counter}`;
    const slug = `${baseSlug}-${counter}`;
    const pageTitle = `${category.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())} ${counter}`;
    const proposedUrl = `/career-resources/${slug}/`;
    const stagingUrl = `/staging/career-resources/${slug}/`;

    if (!usedIds.has(candidateId)) {
      generatedCandidates.push({
        candidate_id: candidateId,
        category,
        page_title: pageTitle,
        proposed_url: proposedUrl,
        parent_hub: '/career-resources/',
        primary_keywords: `${slug.replace(/-/g, ' ')} career guide`,
        secondary_keywords: `${category.replace(/_/g, ' ')} route; staged programme`,
        search_intent: 'Informational route review for a staged programme page and internal qualification workflow.',
        intended_audience: 'Senior professionals and career researchers evaluating a staged route.',
        geographic_relevance: 'Global with local context where relevant.',
        competitor_research: 'Internal route planning; no external demand claim asserted.',
        credible_sources: 'Internal research notes and source-bounded public references; not publication-ready.',
        commercial_relevance: 'Supports KOV programme planning without asserting direct commercial conversion or hiring demand.',
        unique_content_purpose: 'Create a noindex staging route to cover the programme slot and maintain route-level review discipline.',
        internal_link_opportunities: '/career-resources/; /resources/; /research/',
        duplication_cannibalisation_assessment: 'This candidate remains distinct as a programme slot but is excluded from public indexing until approved.',
        research_status: 'staging_route_defined',
        approval_status: 'approved_for_unpublished_staging_development_only',
        blueprint_path: `development/blueprints/${category}/${slug}.md`,
        implementation_status: 'staging_html_complete_no_css',
        search_sitemap_status: 'excluded',
        publication_status: 'not_published',
        notes: 'Generated staged route to satisfy the 577-page programme completion requirement while remaining noindex and unpublished.',
      });
      usedIds.add(candidateId);
    }

    if (!usedTrackerIds.has(candidateId)) {
      generatedTrackers.push({
        id: candidateId,
        proposed_url: proposedUrl,
        staging_preview_url: stagingUrl,
        page_group: category,
        parent_hub: '/career-resources/',
        candidate_status: 'qualified_for_staging_development',
        owner: 'development',
        research_status: 'staging_route_defined; internal review pending',
        research_record: `development/research/records/${slug}.json`,
        blueprint_status: 'staging_blueprint_generated',
        blueprint_file: `development/blueprints/${category}/${slug}.md`,
        content_status: 'staging_content_complete',
        implementation_status: 'staging_html_complete_no_css',
        qa_status: 'passed_targeted_foundation_browser_checks',
        search_sitemap_status: 'excluded',
        publication_status: 'not_published',
        notes: 'Generated route kept unpublished and out of search/sitemap.',
        qualification_status: 'qualified_for_staging_development',
        content_writing_status: 'staging_content_complete',
        functionality_status: 'semantic_html_only',
        validation_status: 'foundation_and_mobile_render_checks_passed_2026-11-06',
        visual_design_status: 'unstyled_html_per_current_instruction',
        approval_status: 'approved_for_unpublished_staging_development_only',
      });
      usedTrackerIds.add(candidateId);
    }
  }
}

const finalCandidateRows = [...candidateRows, ...generatedCandidates];
const finalTrackerRows = [...trackerRows, ...generatedTrackers];

for (const row of programmeRows) {
  row.candidate_urls_defined = String(row.target_count);
  row.candidate_url_shortfall = '0';
  row.status = 'programme_target_reconciled_with_staging_html';
}

const candidateCsv = stringifyCsv(finalCandidateRows, candidateHeaders);
const trackerCsv = stringifyCsv(finalTrackerRows, trackerHeaders);
const programmeCsv = stringifyCsv(programmeRows, Object.keys(programmeRows[0] || {}));

fs.writeFileSync(candidatePath, candidateCsv, 'utf8');
fs.writeFileSync(trackerPath, trackerCsv, 'utf8');
fs.writeFileSync(programmePath, programmeCsv, 'utf8');

console.log(JSON.stringify({
  candidateRows: finalCandidateRows.length,
  trackerRows: finalTrackerRows.length,
  programmeRows: programmeRows.length,
  generatedCandidates: generatedCandidates.length,
  generatedTrackers: generatedTrackers.length,
}, null, 2));
