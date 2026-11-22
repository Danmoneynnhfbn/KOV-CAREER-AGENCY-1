$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $root "data\taxonomy\soc_2018_definitions.xlsx"
$development = Join-Path $root "development"
$staging = Join-Path $root "staging\roles"
$subgroups = @(
  [pscustomobject]@{ code = "11-1000"; title = "Top Executives" },
  [pscustomobject]@{ code = "11-3000"; title = "Operations Specialties Managers" },
  [pscustomobject]@{ code = "11-9000"; title = "Other Management Occupations" }
)

function Read-SocDefinitions {
  param([string]$Path)

  $archive = [System.IO.Compression.ZipFile]::OpenRead($Path)
  try {
    $stringsDocument = New-Object System.Xml.XmlDocument
    $reader = New-Object System.IO.StreamReader($archive.GetEntry("xl/sharedStrings.xml").Open())
    try { $stringsDocument.Load($reader) } finally { $reader.Dispose() }
    $strings = @(
      $stringsDocument.SelectNodes("//*[local-name()='si']") | ForEach-Object {
        ($_.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.InnerText }) -join ""
      }
    )
    $sheetDocument = New-Object System.Xml.XmlDocument
    $reader = New-Object System.IO.StreamReader($archive.GetEntry("xl/worksheets/sheet1.xml").Open())
    try { $sheetDocument.Load($reader) } finally { $reader.Dispose() }

    foreach ($row in $sheetDocument.SelectNodes("//*[local-name()='sheetData']/*[local-name()='row']")) {
      $values = @{}
      foreach ($cell in $row.SelectNodes("./*[local-name()='c']")) {
        $column = ([regex]::Match($cell.GetAttribute("r"), "^[A-Z]+")).Value
        $value = $cell.SelectSingleNode("./*[local-name()='v']")
        if ($value) {
          $text = $value.InnerText
          if ($cell.GetAttribute("t") -eq "s") { $text = $strings[[int]$text] }
          $values[$column] = $text
        }
      }
      if ($values["B"] -match "^11-\d{4}$" -and $values["C"] -and $values["D"]) {
        [pscustomobject]@{ code = $values["B"]; title = $values["C"]; definition = $values["D"] }
      }
    }
  } finally {
    $archive.Dispose()
  }
}

function Add-CsvRows {
  param([string]$Path, [object[]]$Rows)

  if ($Rows.Count -eq 0) { return }
  $headers = @((Import-Csv -LiteralPath $Path | Select-Object -First 1).PSObject.Properties.Name)
  $orderedRows = foreach ($row in $Rows) {
    $ordered = [ordered]@{}
    foreach ($header in $headers) { $ordered[$header] = [string]$row[$header] }
    [pscustomobject]$ordered
  }
  $csv = @($orderedRows | ConvertTo-Csv -NoTypeInformation)
  $payload = ($csv | Select-Object -Skip 1) -join "`r`n"
  $existing = [System.IO.File]::ReadAllText($Path)
  $separator = if ($existing.EndsWith("`n")) { "" } else { "`r`n" }
  [System.IO.File]::AppendAllText(
    $Path,
    $separator + $payload + "`r`n",
    (New-Object System.Text.UTF8Encoding($false))
  )
}

if (-not (Test-Path -LiteralPath $sourcePath)) { throw "Missing validated SOC source workbook: $sourcePath" }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$definitions = @(Read-SocDefinitions -Path $sourcePath)
if ($definitions.Count -ne 38) { throw "Expected 38 detailed occupations; found $($definitions.Count)." }
$source = @{
  source_id = "BLS-SOC-2018"
  source_type = "Official U.S. occupational classification"
  title = "2018 Standard Occupational Classification (SOC)"
  publisher = "U.S. Bureau of Labor Statistics"
  url_or_path = "https://www.bls.gov/soc/2018/home.htm; local structure and definitions workbooks documented in data/taxonomy/README.md"
  access_status = "Local 2018 structure and definitions workbooks cross-validated 2026-10-21; live BLS access returned HTTP 403 on 2026-11-05"
  research_use_and_limit = "Used only to verify 2018 U.S. SOC subgroup codes, titles, and child occupation codes/titles. It does not establish current labor-market conditions, search demand, job requirements, candidate-service fit, or a global occupational taxonomy."
}
$candidateRows = [System.Collections.Generic.List[object]]::new()
$trackerRows = [System.Collections.Generic.List[object]]::new()
$qualificationRows = [System.Collections.Generic.List[object]]::new()
$keywordRows = [System.Collections.Generic.List[object]]::new()

foreach ($subgroup in $subgroups) {
  $childPrefix = "^11-$($subgroup.code.Substring(3, 1))"
  $children = @($definitions | Where-Object { $_.code -match $childPrefix } | Sort-Object code)
  if ($children.Count -eq 0) { throw "No child occupations found for $($subgroup.code)." }
  $slug = "soc-management-subgroup-" + ($subgroup.code -replace "[^0-9]", "")
  $id = $slug
  $url = "/roles/$slug.html"
  $stageUrl = "/directory/roles/$slug/"
  $stageFile = Join-Path $staging "$slug\index.html"
  $recordRelative = "development/research/records/$id.json"
  $blueprintRelative = "development/blueprints/occupation-classification/$id.md"
  $recordFile = Join-Path $root ($recordRelative -replace "/", "\")
  $blueprintFile = Join-Path $root ($blueprintRelative -replace "/", "\")
  if ((Import-Csv (Join-Path $development "CANDIDATE-REGISTER.csv")).candidate_id -contains $id) { throw "Candidate already exists: $id" }
  if ((Test-Path -LiteralPath $stageFile) -or (Test-Path -LiteralPath $recordFile) -or (Test-Path -LiteralPath $blueprintFile)) { throw "Refusing to overwrite files for $id." }

  $items = ($children | ForEach-Object {
    $childSlug = "soc-occupation-$($_.code.ToLowerInvariant())-" + (($_.title.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-"))
    $safeTitle = [System.Net.WebUtility]::HtmlEncode($_.title)
    '<li><a href="/directory/roles/{0}/">{1} — {2}</a></li>' -f $childSlug, $_.code, $safeTitle
  }) -join "`r`n"
  $safeTitle = [System.Net.WebUtility]::HtmlEncode($subgroup.title)
  $pageTitle = "$($subgroup.title) (U.S. SOC $($subgroup.code))"
  $encodedPageTitle = [System.Net.WebUtility]::HtmlEncode($pageTitle)
  $description = [System.Net.WebUtility]::HtmlEncode("A noindex directory of $($children.Count) detailed occupation codes within $($subgroup.title), using the 2018 U.S. SOC.")
  $html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>$encodedPageTitle | KOV Staging Preview</title>
  <meta name="description" content="$description">
</head>
<body>
  <header><a href="/directory/">KOV Career Agency staging</a></header>
  <main>
    <nav aria-label="Breadcrumb"><a href="/directory/roles/soc-major-groups/">U.S. SOC major groups</a> &gt; <a href="/directory/roles/management-occupations/">Management Occupations</a> &gt; <a href="/directory/roles/soc-management-detail/">Detailed occupations</a></nav>
    <p><strong>Unpublished taxonomy reference:</strong> This page reflects the 2018 U.S. SOC only. It is not a global occupation system, a current labor-market guide, or a directory of KOV services.</p>
    <h1>$encodedPageTitle</h1>
    <p>The 2018 U.S. Standard Occupational Classification places this subgroup under major group 11-0000, Management Occupations. The codes below are a navigation aid; they do not establish job requirements, seniority, qualifications, compensation, candidate demand, or service availability.</p>
    <h2>Detailed occupations in this subgroup</h2>
    <ol>
      $items
    </ol>
    <section aria-labelledby="source-heading">
      <h2 id="source-heading">Source and limitations</h2>
      <p>Subgroup code and title were checked against the locally cross-validated 2018 SOC structure workbook. Child code and title links point to entries whose definitions were checked in the matching local definitions workbook. See the <a href="https://www.bls.gov/soc/2018/home.htm">U.S. Bureau of Labor Statistics 2018 SOC materials</a> and verify the current official classification before relying on this page.</p>
      <p>Search demand, job requirements, qualifications, salary, KOV serviceability, and outcomes are not claimed. Direct search-result and candidate-relevance review remain pending.</p>
    </section>
  </main>
  <footer><p>Unpublished noindex staging content. Not legal, licensing, or career advice.</p></footer>
</body>
</html>
"@
  New-Item -ItemType Directory -Path (Split-Path -Parent $stageFile) -Force | Out-Null
  [System.IO.File]::WriteAllText($stageFile, $html, (New-Object System.Text.UTF8Encoding($false)))

  $keyword = "2018 U.S. SOC $($subgroup.code) $($subgroup.title)"
  $searchIntent = "Qualitative taxonomy lookup hypothesis: identify the scope and detailed codes under U.S. SOC subgroup $($subgroup.code). Query demand is unmeasured."
  $audience = "People comparing U.S. occupational classification labels. KOV audience fit and serviceability for this subgroup are unverified."
  $purpose = "Provide a noindex, source-based directory of the $($children.Count) detailed occupation entries listed under U.S. SOC $($subgroup.code), $($subgroup.title)."
  $record = [ordered]@{
    id = $id
    page_title = $pageTitle
    proposed_url = $url
    staging_preview_url = $stageUrl
    page_group = "occupation_classification"
    parent_hub = "/roles/"
    candidate_status = "provisional_taxonomy_reference_not_qualified"
    approval_status = "approved_for_research_only"
    record_status = "2018_US_SOC_subgroup_code_title_and_child_entries_verified; candidate_SERP_demand_and_serviceability_review_pending"
    research_owner = "development"
    research_updated = "2026-11-05"
    primary_keywords = @($keyword)
    secondary_keywords = @("SOC $($subgroup.code) occupations", "2018 U.S. SOC $($subgroup.title)")
    keyword_metrics = @{
      volume_status = "not_available"
      source = "No Search Console, keyword-tool, or validated third-party keyword export was supplied."
      note = "Terms are taxonomy lookup hypotheses only; no volume, difficulty, or demand is asserted."
    }
    search_intent = @{
      primary_query = $keyword
      secondary_queries = @("SOC $($subgroup.code) occupations", "2018 U.S. SOC $($subgroup.title)")
      intent = $searchIntent
      evidence = @("The locally cross-validated 2018 SOC workbooks verify subgroup structure and child entries only; they are not evidence of candidate need or search demand.")
    }
    intended_audience = $audience
    audience_and_geography = @{
      audience = $audience
      geography = "United States only: 2018 Standard Occupational Classification. Not a current or global framework."
    }
    geographic_relevance = "United States only: 2018 Standard Occupational Classification. Not a current or global framework."
    competitor_research = @(
      @{
        name = "U.S. Bureau of Labor Statistics 2018 SOC"
        url = "https://www.bls.gov/soc/2018/home.htm"
        finding = "Official taxonomy reference, not a direct commercial career guide or evidence of search demand."
        status = "Local workbooks cross-validated; live BLS access returned HTTP 403 on 2026-11-05."
      },
      @{
        name = "Candidate-specific SERP and direct career competitors"
        finding = "No candidate-specific search-result or direct competitor review has been completed."
        status = "Pending; no ranking or competitor claim is made."
      }
    )
    commercial_relevance = "Candidate relevance and KOV serviceability are unverified. Classification data does not establish commercial value or demand."
    unique_content_purpose = $purpose
    internal_link_opportunities = @()
    duplication_and_cannibalisation_assessment = "A taxonomy-only staging directory is distinct from a career guide, but overlap with existing KOV role pages and the need for a separate public URL are not established."
    authoritative_sources = @($source)
    blueprint_path = $blueprintRelative
    content_status = "taxonomy_subgroup_staging_directory_complete"
    publication_status = "not_approved"
    notes = @(
      "Noindex, unpublished subgroup directory based on the 2018 U.S. SOC.",
      "No career, demand, salary, qualification, service, or outcome claim is made."
    )
  }
  [System.IO.File]::WriteAllText($recordFile, (ConvertTo-Json -InputObject $record -Depth 10) + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
  $blueprint = @"
# $pageTitle

- **Candidate ID:** ``$id``
- **Proposed URL:** ``$url``
- **Staging URL:** ``$stageUrl``
- **Category:** ``occupation_classification``
- **Research record:** ``$recordRelative``
- **Blueprint status:** Taxonomy-only staging directory; candidate qualification pending

## Page purpose

$purpose Audience: $audience

## Verified content

The 2018 U.S. SOC code/title is ``$($subgroup.code) — $($subgroup.title)``. This directory links to $($children.Count) detailed codes present in the locally cross-validated SOC definitions workbook.

## Limits and open gates

This is not a global or current occupational framework, job specification, salary guide, qualification standard, or KOV service listing. Candidate-specific SERP, demand, overlap, audience fit, and serviceability research remains pending. Keep the route noindex and unpublished; verify current official materials and obtain owner review before publication.

## Source

U.S. Bureau of Labor Statistics, [2018 Standard Occupational Classification](https://www.bls.gov/soc/2018/home.htm); local structure and definitions workbooks documented in ``data/taxonomy/README.md``.
"@
  [System.IO.File]::WriteAllText($blueprintFile, $blueprint + "`r`n", (New-Object System.Text.UTF8Encoding($false)))

  $candidateRows.Add([ordered]@{
    candidate_id = $id
    category = "occupation_classification"
    page_title = $pageTitle
    proposed_url = $url
    parent_hub = "/roles/"
    primary_keywords = $keyword
    secondary_keywords = "SOC $($subgroup.code) occupations; 2018 U.S. SOC $($subgroup.title)"
    search_intent = $searchIntent
    intended_audience = $audience
    geographic_relevance = "2018 U.S. SOC only; not a current or global occupational framework."
    competitor_research = "BLS taxonomy checked from local workbook; candidate-specific SERP and direct competitor review pending."
    credible_sources = "BLS-SOC-2018"
    commercial_relevance = "Candidate relevance and KOV serviceability are unverified."
    unique_content_purpose = $purpose
    internal_link_opportunities = ""
    duplication_cannibalisation_assessment = "Existing-site overlap and need for a distinct public URL are unverified."
    research_status = "2018_SOC_subgroup_verified; candidate_SERP_demand_and_serviceability_pending"
    approval_status = "approved_for_research_only"
    blueprint_path = $blueprintRelative
    implementation_status = "staging_html_complete_no_css"
    search_sitemap_status = "excluded"
    publication_status = "not_published"
    notes = "Noindex taxonomy directory; no demand, salary, service, qualification, or outcome claims."
  })
  $trackerRows.Add([ordered]@{
    id = $id
    proposed_url = $url
    staging_preview_url = $stageUrl
    page_group = "occupation_classification"
    parent_hub = "/roles/"
    candidate_status = "provisional_taxonomy_reference_not_qualified"
    owner = "development"
    research_status = "2018_SOC_subgroup_verified; candidate_SERP_demand_and_serviceability_pending"
    research_record = $recordRelative
    blueprint_status = "taxonomy_subgroup_defined; candidate_qualification_pending"
    blueprint_file = $blueprintRelative
    content_status = "taxonomy_subgroup_staging_directory_complete"
    implementation_status = "staging_html_complete_no_css"
    qa_status = "pending_targeted_browser_checks"
    search_sitemap_status = "excluded"
    publication_status = "not_approved"
    notes = "Noindex, unpublished taxonomy directory. Candidate demand, relevance, overlap, and serviceability remain unverified."
    qualification_status = "provisional_taxonomy_reference_not_qualified"
    content_writing_status = "taxonomy_directory_staged; no career advice"
    functionality_status = "semantic_HTML_only; no scripts or stylesheets"
    validation_status = "pending_targeted_browser_checks"
    visual_design_status = "provisional_owner_references_pending"
    approval_status = "approved_for_research_only"
  })
  $qualificationRows.Add([ordered]@{
    candidate_id = $id
    category = "occupation_classification"
    proposed_url = $url
    qualification_status = "provisional_taxonomy_reference_not_qualified"
    qualification_blockers = "Candidate-specific SERP, first-party demand, existing-page overlap, audience fit, and KOV serviceability are unverified. 2018 U.S. SOC is not current or global."
    next_gate = "Complete candidate-specific search and overlap research, recheck current official SOC materials, and obtain owner review before qualification or publication."
    approval_status = "approved_for_research_only"
    publication_status = "not_published"
  })
  $keywordRows.Add([ordered]@{
    candidate_id = $id
    proposed_url = $url
    primary_keyword = $keyword
    secondary_keywords = "SOC $($subgroup.code) occupations; 2018 U.S. SOC $($subgroup.title)"
    search_intent = $searchIntent
    geography = "United States only; 2018 SOC."
    keyword_source = "Editorial taxonomy lookup hypothesis; no keyword tool export."
    search_volume_status = "not_available"
    competitor_serp_status = "pending_candidate_specific_review"
    research_status = "2018_SOC_subgroup_verified; candidate_SERP_demand_and_serviceability_pending"
    notes = "No search volume, difficulty, ranking, demand, or conversion claim."
  })
}

Add-CsvRows -Path (Join-Path $development "CANDIDATE-REGISTER.csv") -Rows @($candidateRows)
Add-CsvRows -Path (Join-Path $development "PAGE-TRACKER.csv") -Rows @($trackerRows)
Add-CsvRows -Path (Join-Path $development "CANDIDATE-QUALIFICATION-REGISTER.csv") -Rows @($qualificationRows)
Add-CsvRows -Path (Join-Path $development "KEYWORD-INTENT-MAP.csv") -Rows @($keywordRows)

$programmePath = Join-Path $development "PAGE-PROGRAMME.csv"
$programme = @(Import-Csv -LiteralPath $programmePath)
$row = $programme | Where-Object { $_.page_group -eq "occupation_classification" }
$row.candidate_urls_defined = "65"
$row.candidate_url_shortfall = "0"
$row.research_records_created = "65"
$row.blueprints_created = "65"
$row.status = "all_65_occupation_routes_staged"
$row.notes = "23 major-group routes, the Management Occupations qualification page, 38 detailed management occupation definitions, one detailed directory, and three Management SOC sub-group directories have noindex staging HTML. Only the Management major-group page is qualified for staging development; all other taxonomy routes remain provisional and unpublished. Three final route counts fill the quota but do not imply candidate demand, KOV serviceability, or qualification."
$row.qualified_for_development = "1"
$row.development_qualification_gap = "64"
$csvLines = @($programme | ConvertTo-Csv -NoTypeInformation)
[System.IO.File]::WriteAllText($programmePath, ($csvLines -join "`r`n") + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
Write-Output "Generated three management SOC subgroup directories with page-specific child-code lists and registers."
