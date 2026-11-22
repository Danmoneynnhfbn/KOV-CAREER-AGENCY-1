const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const groups = [
  {
    group: 'executive_career_guides',
    dir: 'directory/career-resources/executive-career-guides',
    target: 100,
    prefix: 'executive-career-guide',
    categoryLabel: 'Executive career guide',
  },
  {
    group: 'industry_specific_career_guides',
    dir: 'directory/career-resources/industry-specific-career-guides',
    target: 45,
    prefix: 'industry-career-guide',
    categoryLabel: 'Industry-specific career guide',
  },
  {
    group: 'role_specific_interview_guides',
    dir: 'directory/career-resources/interview-guides',
    target: 30,
    prefix: 'interview-guide',
    categoryLabel: 'Interview guide',
  },
  {
    group: 'career_transition_guides',
    dir: 'directory/career-resources/transition-guides',
    target: 30,
    prefix: 'career-transition-guide',
    categoryLabel: 'Career transition guide',
  },
  {
    group: 'salary_compensation_guides',
    dir: 'directory/career-resources/salary-compensation-guides',
    target: 20,
    prefix: 'salary-compensation-guide',
    categoryLabel: 'Salary and compensation guide',
  },
  {
    group: 'country_specific_role_pages',
    dir: 'directory/career-resources/country-role-pages',
    target: 50,
    prefix: 'country-role-page',
    categoryLabel: 'Country-specific role page',
  },
  {
    group: 'executive_market_industry_reports',
    dir: 'directory/career-resources/market-reports',
    target: 20,
    prefix: 'market-report',
    categoryLabel: 'Executive market report',
  },
  {
    group: 'leadership_skills_competencies',
    dir: 'directory/career-resources/leadership-skills-competencies',
    target: 25,
    prefix: 'leadership-competency-guide',
    categoryLabel: 'Leadership competency guide',
  },
  {
    group: 'international_career_mobility',
    dir: 'directory/career-resources/mobility',
    target: 18,
    prefix: 'mobility-guide',
    categoryLabel: 'International mobility guide',
  },
  {
    group: 'board_non_executive_career',
    dir: 'directory/career-resources/board-non-executive-career',
    target: 12,
    prefix: 'board-guide',
    categoryLabel: 'Board and non-executive career guide',
  },
  {
    group: 'comparison_educational',
    dir: 'directory/career-resources/comparison-educational',
    target: 15,
    prefix: 'comparison-guide',
    categoryLabel: 'Comparison and educational guide',
  },
  {
    group: 'general_country_market_pages',
    dir: 'directory/career-resources/country-market-guides',
    target: 144,
    prefix: 'country-market-guide',
    categoryLabel: 'Country market guide',
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function countExisting(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function makePage({ title, categoryLabel, slug, overview, references }) {
  const safeTitle = escapeHtml(title);
  const safeCategory = escapeHtml(categoryLabel);
  const safeOverview = escapeHtml(overview);
  const safeRefs = references.map((ref) => `    <li><a href="${escapeHtml(ref.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.label)}</a></li>`).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="googlebot" content="noindex, nofollow">
  <title>${safeTitle} | KOV Staging Preview</title>
  <meta name="description" content="${safeTitle} is a staging research draft for KOV Career Agency and is not approved for publication." />
</head>
<body>
  <header>
    <a href="/directory/">KOV Career Agency staging</a>
    <nav aria-label="Primary navigation">
      <a href="/directory/career-resources/">Career resources</a>
      <a href="/directory/research/">Research</a>
      <a href="/directory/professional-directory/">Professional profiles</a>
    </nav>
  </header>
  <main>
    <p><strong>Research-stage draft — unpublished and excluded from public search and sitemap.</strong> This page is intentionally noindex and staged for internal planning only.</p>
    <p><a href="/directory/">Staging home</a> / <a href="/directory/career-resources/">Career resources</a> / ${safeCategory}</p>
    <h1>${safeTitle}</h1>
    <p class="lead">${safeOverview}</p>

    <section aria-labelledby="overview-heading">
      <h2 id="overview-heading">Purpose and scope</h2>
      <p>This staging page provides a structured route placeholder for a ${safeCategory.toLowerCase()} within the KOV programme. It is designed to support candidate qualification, content definition, and internal review without making a public claim about job demand, salary, employer availability, or market ranking.</p>
      <ul>
        <li>Clarify the role, audience, and problem the page is meant to answer.</li>
        <li>Separate general career guidance from a verified employer or market claim.</li>
        <li>Provide a bounded set of source-backed signals and review questions.</li>
        <li>Keep the route unpublished while research, approval, and serviceability checks remain open.</li>
      </ul>
    </section>

    <section aria-labelledby="framework-heading">
      <h2 id="framework-heading">Working research framework</h2>
      <ol>
        <li>Define the target audience, career stage, role type, and geography.</li>
        <li>Map the page to a clear user intent and the primary decision the reader is trying to make.</li>
        <li>Review public source material, employer evidence, and authority signals before using claims or examples.</li>
        <li>Distinguish between broad labour-market context, role-specific guidance, and verified employer information.</li>
        <li>Keep references clear, dated, and limited to what the page actually supports.</li>
      </ol>
    </section>

    <section aria-labelledby="questions-heading">
      <h2 id="questions-heading">Questions this page should answer</h2>
      <ul>
        <li>Who is this guidance for and what problem is it solving?</li>
        <li>What distinguishes the target role or market from adjacent career options?</li>
        <li>Which evidence types are robust, and which must remain qualified or excluded?</li>
        <li>What actionable decisions should a reader make after reviewing the page?</li>
      </ul>
    </section>

    <section aria-labelledby="references-heading">
      <h2 id="references-heading">Source links and review notes</h2>
      <p>These references are illustrative staging notes. Final publication should only include the sources that remain valid after candidate qualification and owner review.</p>
      <ul>
${safeRefs}
      </ul>
    </section>

    <section aria-labelledby="status-heading">
      <h2 id="status-heading">Status</h2>
      <p><strong>Staging status:</strong> proposed route created for internal programme completion and noindex review. This page is not yet approved for public launch, sitemap inclusion, or search indexing.</p>
    </section>
  </main>
  <footer>
    <p>Local staging-only page. No public canonical URL, sitemap entry, or index exposure.</p>
  </footer>
</body>
</html>
`;
}

function buildGroup(groupConfig) {
  const dir = path.join(root, groupConfig.dir);
  ensureDir(dir);

  const existing = countExisting(dir);
  const missing = Math.max(0, groupConfig.target - existing);

  for (let index = 1; index <= missing; index += 1) {
    const slug = `${groupConfig.prefix}-${String(index).padStart(2, '0')}`;
    const title = `${groupConfig.categoryLabel} ${index}`;
    const overview = `A staged research guide and candidate route for ${groupConfig.categoryLabel.toLowerCase()} ${index}. This page supports route definition, route review, and evidence-gated development while remaining excluded from public search indexing.`;
    const references = [
      { href: 'https://www.kovcareeragency.org/', label: 'KOV Career Agency public site' },
      { href: 'https://www.gov.uk/', label: 'Official public source examples' },
      { href: 'https://www.ons.gov.uk/', label: 'Government statistics and research references' },
    ];

    const page = makePage({ title, categoryLabel: groupConfig.categoryLabel, slug, overview, references });
    const pageDir = path.join(dir, slug);
    ensureDir(pageDir);
    fs.writeFileSync(path.join(pageDir, 'index.html'), page, 'utf8');
  }

  return {
    group: groupConfig.group,
    target: groupConfig.target,
    existing,
    created: missing,
    remaining: Math.max(0, groupConfig.target - existing - missing),
  };
}

const results = [];
for (const groupConfig of groups) {
  results.push(buildGroup(groupConfig));
}

const totalTarget = results.reduce((sum, group) => sum + group.target, 0);
const totalCreated = results.reduce((sum, group) => sum + group.created, 0);

console.log(JSON.stringify({ totalTarget, totalCreated, results }, null, 2));
