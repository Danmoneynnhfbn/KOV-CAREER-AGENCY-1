param(
  [switch]$RecordPassingQa
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $root "data\taxonomy\soc_2018_definitions.xlsx"
$developmentPath = Join-Path $root "development"
$recordPath = Join-Path $developmentPath "research\records"
$blueprintPath = Join-Path $developmentPath "blueprints\occupation-classification"
$stagingPath = Join-Path $root "staging\roles"
$sourceId = "BLS-SOC-2018"
$qualificationStatus = "provisional_taxonomy_reference_not_qualified"
$approvalStatus = "approved_for_research_only"

function Get-XlsxRows {
  param([string]$Path)

  $archive = [System.IO.Compression.ZipFile]::OpenRead($Path)
  try {
    $sharedStrings = @()
    $sharedStringsEntry = $archive.GetEntry("xl/sharedStrings.xml")
    if ($sharedStringsEntry) {
      $sharedStringsDocument = New-Object System.Xml.XmlDocument
      $sharedStringsReader = New-Object System.IO.StreamReader($sharedStringsEntry.Open())
      try {
        $sharedStringsDocument.Load($sharedStringsReader)
      } finally {
        $sharedStringsReader.Dispose()
      }
      $sharedStrings = @(
        $sharedStringsDocument.SelectNodes("//*[local-name()='si']") | ForEach-Object {
          ($_.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.InnerText }) -join ""
        }
      )
    }

    $sheetEntry = $archive.GetEntry("xl/worksheets/sheet1.xml")
    if (-not $sheetEntry) {
      throw "The first worksheet is missing from $Path."
    }
    $sheetDocument = New-Object System.Xml.XmlDocument
    $sheetReader = New-Object System.IO.StreamReader($sheetEntry.Open())
    try {
      $sheetDocument.Load($sheetReader)
    } finally {
      $sheetReader.Dispose()
    }

    foreach ($row in $sheetDocument.SelectNodes("//*[local-name()='sheetData']/*[local-name()='row']")) {
      $values = @{}
      foreach ($cell in $row.SelectNodes("./*[local-name()='c']")) {
        $column = ([regex]::Match($cell.GetAttribute("r"), "^[A-Z]+")).Value
        $value = $cell.SelectSingleNode("./*[local-name()='v']")
        if ($value) {
          $text = $value.InnerText
          if ($cell.GetAttribute("t") -eq "s") {
            $text = $sharedStrings[[int]$text]
          }
          $values[$column] = $text
        } else {
          $text = $cell.SelectSingleNode(".//*[local-name()='t']")
          if ($text) {
            $values[$column] = $text.InnerText
          }
        }
      }
      Write-Output $values
    }
  } finally {
    $archive.Dispose()
  }
}

function Add-CsvRows {
  param(
    [string]$Path,
    [object[]]$Rows
  )

  if ($Rows.Count -eq 0) {
    return
  }
  $existing = @(Import-Csv -LiteralPath $Path)
  $headers = @($existing[0].PSObject.Properties.Name)
  $orderedRows = foreach ($row in $Rows) {
    $ordered = [ordered]@{}
    foreach ($header in $headers) {
      $ordered[$header] = [string]$row[$header]
    }
    [pscustomobject]$ordered
  }
  $csvLines = @($orderedRows | ConvertTo-Csv -NoTypeInformation)
  $payload = ($csvLines | Select-Object -Skip 1) -join "`r`n"
  $encoding = New-Object System.Text.UTF8Encoding($false)
  $existingText = [System.IO.File]::ReadAllText($Path)
  $separator = if ($existingText.EndsWith("`n")) { "" } else { "`r`n" }
  [System.IO.File]::AppendAllText($Path, $separator + $payload + "`r`n", $encoding)
}

function Update-TrackerQa {
  $trackerPath = Join-Path $developmentPath "PAGE-TRACKER.csv"
  $rows = @(Import-Csv -LiteralPath $trackerPath)
  $ids = @($script:generatedPages | ForEach-Object { $_.id })
  foreach ($row in $rows) {
    if ($ids -contains $row.id) {
      $row.qa_status = "passed_targeted_foundation_browser_checks"
      $row.validation_status = "noindex_definition_source_mobile_and_route_checks_passed"
    }
  }
  $lines = @($rows | ConvertTo-Csv -NoTypeInformation)
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($trackerPath, ($lines -join "`r`n") + "`r`n", $encoding)
}

if ($RecordPassingQa) {
  $script:generatedPages = @()
  $trackerPath = Join-Path $developmentPath "PAGE-TRACKER.csv"
  $script:generatedPages = @(
    Import-Csv -LiteralPath $trackerPath |
      Where-Object { $_.id -eq "soc-management-occupations-detail-directory" -or $_.id -like "soc-occupation-11-*" }
  )
  if ($script:generatedPages.Count -ne 39) {
    throw "Expected 39 tracked management SOC pages before recording QA; found $($script:generatedPages.Count)."
  }
  & npm.cmd run test:foundations
  if ($LASTEXITCODE -ne 0) {
    throw "Foundation browser checks failed; QA status was not updated."
  }
  Update-TrackerQa
  Write-Output "Recorded passing foundation QA for 39 management SOC staging pages."
  exit 0
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
if (-not (Test-Path -LiteralPath $sourcePath)) {
  throw "The validated SOC definitions workbook is missing: $sourcePath"
}

$definitions = @{}
foreach ($row in Get-XlsxRows -Path $sourcePath) {
  if ($row["B"] -match "^11-\d{4}$" -and $row["C"] -and $row["D"]) {
    $definitions[$row["B"]] = [pscustomobject]@{
      code = $row["B"]
      title = $row["C"]
      definition = $row["D"]
    }
  }
}
$occupations = @($definitions.Values | Sort-Object code)
if ($occupations.Count -ne 38) {
  throw "Expected 38 detailed management occupation definitions from the validated workbook; found $($occupations.Count)."
}

$directoryId = "soc-management-occupations-detail-directory"
$directorySlug = "soc-management-detail"
$directoryTitle = "2018 U.S. SOC Management Occupations: Detailed Directory"
$directoryUrl = "/roles/soc-management-occupation-directory.html"
$directoryStageUrl = "/directory/roles/$directorySlug/"
$directoryBlueprint = "development/blueprints/occupation-classification/$directoryId.md"
$directoryRecord = "development/research/records/$directoryId.json"
$pages = [System.Collections.Generic.List[object]]::new()
$pages.Add([pscustomobject]@{
  id = $directoryId
  code = ""
  title = $directoryTitle
  slug = $directorySlug
  proposed_url = $directoryUrl
  staging_url = $directoryStageUrl
  blueprint_path = $directoryBlueprint
  record_path = $directoryRecord
  definition = ""
})
foreach ($occupation in $occupations) {
  $titleSlug = ($occupation.title.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-")
  $slug = "soc-occupation-$($occupation.code.ToLowerInvariant())-$titleSlug"
  $id = $slug
  $pages.Add([pscustomobject]@{
    id = $id
    code = $occupation.code
    title = "$($occupation.title) (U.S. SOC $($occupation.code))"
    slug = $slug
    proposed_url = "/roles/$slug.html"
    staging_url = "/directory/roles/$slug/"
    blueprint_path = "development/blueprints/occupation-classification/$id.md"
    record_path = "development/research/records/$id.json"
    definition = $occupation.definition
  })
}
$script:generatedPages = @($pages)

$candidateRegisterPath = Join-Path $developmentPath "CANDIDATE-REGISTER.csv"
$trackerPath = Join-Path $developmentPath "PAGE-TRACKER.csv"
$qualificationRegisterPath = Join-Path $developmentPath "CANDIDATE-QUALIFICATION-REGISTER.csv"
$keywordMapPath = Join-Path $developmentPath "KEYWORD-INTENT-MAP.csv"
$registers = @(
  Import-Csv -LiteralPath $candidateRegisterPath
  Import-Csv -LiteralPath $trackerPath
  Import-Csv -LiteralPath $qualificationRegisterPath
  Import-Csv -LiteralPath $keywordMapPath
)
foreach ($page in $pages) {
  if ($registers.candidate_id -contains $page.id -or $registers.id -contains $page.id) {
    throw "Candidate ID already exists: $($page.id)"
  }
  if ($registers.proposed_url -contains $page.proposed_url) {
    throw "Candidate URL already exists: $($page.proposed_url)"
  }
  foreach ($relativePath in @($page.blueprint_path, $page.record_path, "staging/roles/$($page.slug)/index.html")) {
    if (Test-Path -LiteralPath (Join-Path $root ($relativePath -replace "/", "\"))) {
      throw "Refusing to overwrite an existing file: $relativePath"
    }
  }
}

$source = [ordered]@{
  source_id = "BLS-SOC-2018"
  source_type = "Official U.S. occupational classification"
  title = "2018 Standard Occupational Classification (SOC)"
  publisher = "U.S. Bureau of Labor Statistics"
  url_or_path = "https://www.bls.gov/soc/2018/home.htm; local structure and definitions workbooks documented in data/taxonomy/README.md"
  access_status = "Local 2018 structure and definitions workbooks cross-validated 2026-10-21; live BLS access returned HTTP 403 on 2026-11-05"
  research_use_and_limit = "Used only for the 2018 U.S. SOC code, title, and occupation definition. It does not establish current labor-market conditions, search demand, job requirements, candidate-service fit, or a global occupational taxonomy."
}
$keywordRows = [System.Collections.Generic.List[object]]::new()
$candidateRows = [System.Collections.Generic.List[object]]::new()
$trackerRows = [System.Collections.Generic.List[object]]::new()
$qualificationRows = [System.Collections.Generic.List[object]]::new()

foreach ($page in $pages) {
  $isDirectory = $page.code -eq ""
  $pageBaseTitle = $page.title
  if (-not $isDirectory) {
    $pageBaseTitle = $page.title -replace " \(U\.S\. SOC .*$", ""
  }
  $primaryKeyword = if ($isDirectory) {
    "2018 U.S. SOC Management Occupations detailed directory"
  } else {
    "U.S. SOC $($page.code) $pageBaseTitle"
  }
  $secondaryKeywords = if ($isDirectory) {
    "Management Occupations SOC codes; 2018 U.S. SOC management occupations"
  } else {
    "2018 U.S. SOC $($page.code); SOC $($page.code) definition"
  }
  $searchIntent = "Qualitative taxonomy lookup hypothesis: identify the code, title, and scope of a 2018 U.S. SOC management occupation. Search demand and query wording have not been measured."
  $audience = "People comparing U.S. occupational classification labels and definitions. KOV audience fit and serviceability for this occupation are unverified."
  if ($isDirectory) {
    $uniquePurpose = "Provide a noindex staging index of all 38 detailed occupations listed under SOC major group 11-0000, using the locally validated 2018 U.S. SOC definitions workbook."
    $scopeText = "This directory lists 38 detailed 2018 U.S. SOC occupations classified under Management Occupations. The taxonomy is U.S.-specific and does not establish current demand, job requirements, seniority, compensation, or KOV service availability."
    $contentDescription = "A U.S.-specific index to detailed management occupation codes and definitions in the 2018 Standard Occupational Classification."
    $definitionText = ""
  } else {
    $uniquePurpose = "Present the exact 2018 U.S. SOC code, title, and definition for one detailed occupation, with clear limits on what classification can establish."
    $scopeText = "The code and definition are an occupational classification reference from the 2018 U.S. SOC. They are not a current labor-market profile, job specification, qualification standard, or statement of KOV service coverage."
    $contentDescription = "A noindex staging reference for U.S. SOC $($page.code): $pageBaseTitle."
    $definitionText = $page.definition
  }
  $metaDescription = [System.Net.WebUtility]::HtmlEncode($contentDescription)
  $htmlTitle = [System.Net.WebUtility]::HtmlEncode("$($page.title) | KOV Staging Preview")
  $h1 = [System.Net.WebUtility]::HtmlEncode($page.title)
  $definitionHtml = [System.Net.WebUtility]::HtmlEncode($definitionText)
  $html = if ($isDirectory) {
    $links = ($occupations | ForEach-Object {
      $childSlug = "soc-occupation-$($_.code.ToLowerInvariant())-" + (($_.title.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-"))
      $safeTitle = [System.Net.WebUtility]::HtmlEncode($_.title)
      '<li><a href="/directory/roles/{0}/">{1} - {2}</a></li>' -f $childSlug, $_.code, $safeTitle
    }) -join "`r`n"
@"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>$htmlTitle</title>
  <meta name="description" content="$metaDescription">
</head>
<body>
  <header><a href="/directory/">KOV Career Agency staging</a></header>
  <main>
    <nav aria-label="Breadcrumb"><a href="/directory/roles/soc-major-groups/">U.S. SOC major groups</a> &gt; <a href="/directory/roles/management-occupations/">Management Occupations</a></nav>
    <p><strong>Unpublished taxonomy reference:</strong> This directory reflects the 2018 U.S. SOC only. It is not a global occupation system, a current labor-market guide, or a directory of KOV services.</p>
    <h1>$h1</h1>
    <p>$([System.Net.WebUtility]::HtmlEncode($scopeText))</p>
    <ol>
      $links
    </ol>
    <section aria-labelledby="source-heading">
      <h2 id="source-heading">Source and limitations</h2>
      <p>Codes, titles, and definitions were taken from the locally retained and cross-validated 2018 SOC structure and definitions workbooks. See the <a href="https://www.bls.gov/soc/2018/home.htm">U.S. Bureau of Labor Statistics 2018 SOC materials</a>. Verify the current official classification before relying on this page.</p>
      <p>No search-demand, salary, job-requirement, qualification, or outcome claim is made. Candidate relevance, direct search-result review, and KOV serviceability remain unresolved.</p>
    </section>
  </main>
  <footer><p>Unpublished noindex staging content. Not legal, licensing, or career advice.</p></footer>
</body>
</html>
"@
  } else {
@"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>$htmlTitle</title>
  <meta name="description" content="$metaDescription">
</head>
<body>
  <header><a href="/directory/">KOV Career Agency staging</a></header>
  <main>
    <nav aria-label="Breadcrumb"><a href="/directory/roles/soc-major-groups/">U.S. SOC major groups</a> &gt; <a href="/directory/roles/management-occupations/">Management Occupations</a> &gt; <a href="/directory/roles/soc-management-detail/">Detailed occupation directory</a></nav>
    <p><strong>Unpublished U.S. taxonomy reference:</strong> This page reproduces one occupation definition from the 2018 U.S. SOC. It is not a global classification, current labor-market research, career advice, or a KOV service listing.</p>
    <h1>$h1</h1>
    <section aria-labelledby="definition-heading">
      <h2 id="definition-heading">2018 SOC definition</h2>
      <p>U.S. SOC code: <strong>$($page.code)</strong></p>
      <blockquote><p>$definitionHtml</p></blockquote>
    </section>
    <section aria-labelledby="scope-heading">
      <h2 id="scope-heading">How to interpret this entry</h2>
      <p>$([System.Net.WebUtility]::HtmlEncode($scopeText))</p>
      <ul>
        <li>Compare a classification description with the actual duties and decision scope of a specific position.</li>
        <li>A SOC code does not establish title equivalence, seniority, qualifications, licensing, compensation, or individual suitability.</li>
        <li>The 2018 SOC is U.S.-specific; use the relevant national framework when researching work in another jurisdiction.</li>
      </ul>
    </section>
    <section aria-labelledby="source-heading">
      <h2 id="source-heading">Source and limitations</h2>
      <p>The code, title, and definition were taken from the locally retained and cross-validated 2018 SOC structure and definitions workbooks. See the <a href="https://www.bls.gov/soc/2018/home.htm">U.S. Bureau of Labor Statistics 2018 SOC materials</a>. Verify the current official classification before relying on this page.</p>
      <p>Search demand, salary, job requirements, KOV serviceability, and outcomes have not been established. Direct search-result and candidate-relevance review remain pending.</p>
      <p><a href="/directory/roles/soc-management-detail/">Return to the detailed occupation directory</a>.</p>
    </section>
  </main>
  <footer><p>Unpublished noindex staging content. Not legal, licensing, or career advice.</p></footer>
</body>
</html>
"@
  }

  $stageFile = Join-Path $stagingPath "$($page.slug)\index.html"
  $recordFile = Join-Path $root ($page.record_path -replace "/", "\")
  $blueprintFile = Join-Path $root ($page.blueprint_path -replace "/", "\")
  New-Item -ItemType Directory -Path (Split-Path -Parent $stageFile) -Force | Out-Null
  [System.IO.File]::WriteAllText($stageFile, $html, (New-Object System.Text.UTF8Encoding($false)))

  $record = [ordered]@{
    id = $page.id
    page_title = $page.title
    proposed_url = $page.proposed_url
    staging_preview_url = $page.staging_url
    page_group = "occupation_classification"
    parent_hub = "/roles/"
    candidate_status = $qualificationStatus
    approval_status = $approvalStatus
    record_status = "2018_US_SOC_code_title_and_definition_verified; candidate_SERP_demand_and_serviceability_review_pending"
    research_owner = "development"
    research_updated = "2026-11-05"
    primary_keywords = @($primaryKeyword)
    secondary_keywords = @($secondaryKeywords -split "; ")
    keyword_metrics = @{
      volume_status = "not_available"
      source = "No Search Console, keyword-tool, or validated third-party keyword export was supplied for this candidate."
      note = "Terms are taxonomy lookup hypotheses only; no volume, difficulty, or demand is asserted."
    }
    search_intent = @{
      primary_query = $primaryKeyword
      secondary_queries = @($secondaryKeywords -split "; ")
      intent = $searchIntent
      evidence = @("The local 2018 SOC workbook verifies the U.S. classification code, title, and definition only. It is not evidence of search demand or candidate need.")
    }
    intended_audience = $audience
    audience_and_geography = @{
      audience = $audience
      geography = "United States only: 2018 Standard Occupational Classification. It is not a global or current occupational framework."
    }
    geographic_relevance = "United States only: 2018 Standard Occupational Classification. It is not a global or current occupational framework."
    competitor_research = @(
      @{
        name = "U.S. Bureau of Labor Statistics 2018 SOC"
        url = "https://www.bls.gov/soc/2018/home.htm"
        finding = "Official taxonomy reference for codes and definitions; not a direct commercial career guide or evidence of search demand."
        status = "Local 2018 structure and definitions workbooks cross-validated; live BLS page access returned HTTP 403 on 2026-11-05."
      },
      @{
        name = "Candidate-specific Google/Bing results and direct career competitors"
        finding = "No candidate-specific SERP or direct competitor review has been completed."
        status = "Pending; no ranking or competitor claim is made."
      }
    )
    commercial_relevance = "KOV audience relevance and serviceability are unverified. A taxonomy code or definition does not establish commercial value, service availability, or candidate demand."
    unique_content_purpose = $uniquePurpose
    internal_link_opportunities = @()
    duplication_and_cannibalisation_assessment = "A taxonomy-only staging entry is distinct from a career guide, but overlap with existing KOV role pages and the need for a separate public URL have not been established. Do not treat classification coverage as proof of a page gap."
    demand_and_competition = @{
      keyword_sources = @()
      competitor_pages = @()
      evidence_and_date = @()
    }
    authoritative_sources = @($source)
    unique_value_and_overlap = @{
      user_need = $uniquePurpose
      existing_page_overlap_review = "The existing role inventory and full page bodies have not been mapped to this occupation. A distinct public page need is unverified."
      canonical_or_consolidation_decision = "Staging route only; do not make a public canonical or consolidation decision until candidate-specific research and owner review."
    }
    factual_gaps_and_risks = @(
      "The 2018 SOC is U.S.-specific and must not be presented as current or global.",
      "Candidate-specific SERP, competitor, first-party demand, and KOV serviceability evidence is unavailable.",
      "The classification description does not establish job requirements, qualifications, licensing, seniority, salary, or title equivalence.",
      "Recheck the current official classification and existing-site overlap before any publication decision."
    )
    blueprint_path = $page.blueprint_path
    content_status = "taxonomy_only_staging_entry_complete"
    publication_status = "not_approved"
    notes = @(
      "Noindex, unpublished taxonomy reference generated from the local 2018 U.S. SOC definitions workbook.",
      "No career, demand, salary, service, qualification, or outcome claims are made."
    )
  }
  $json = ConvertTo-Json -InputObject $record -Depth 10
  [System.IO.File]::WriteAllText($recordFile, $json + "`r`n", (New-Object System.Text.UTF8Encoding($false)))

  $blueprint = @"
# $($page.title)

- **Candidate ID:** ``$($page.id)``
- **Proposed URL:** ``$($page.proposed_url)``
- **Staging URL:** ``$($page.staging_url)``
- **Category:** ``occupation_classification``
- **Research record:** ``$($page.record_path)``
- **Blueprint status:** Taxonomy-only staging draft; candidate qualification pending

## Purpose and audience

$uniquePurpose Audience: $audience

## Verified content

$(if ($isDirectory) { "List all 38 detailed occupations from the local, cross-validated 2018 U.S. SOC workbook." } else { "Code: $($page.code). Title: $pageBaseTitle. Definition: $($page.definition)" })

## Geography and limits

Use only as a 2018 U.S. occupational classification reference. Do not imply that the entry is current, global, a job specification, a qualification or licensing standard, or evidence of KOV service coverage. No demand, salary, ranking, or outcome claims are supported.

## Research and release gates

- Candidate-specific Google/Bing SERP and direct competitor review remain pending.
- First-party demand, candidate relevance, existing-page overlap, and KOV serviceability are unverified.
- Recheck current official SOC materials and all source links before public use.
- Keep noindex and exclude from the public sitemap, internal search, and public navigation.
- Require owner review before qualification or publication.

## Source

- U.S. Bureau of Labor Statistics, [2018 Standard Occupational Classification](https://www.bls.gov/soc/2018/home.htm); local structure and definitions workbooks documented in ``data/taxonomy/README.md``. Source use is limited to the 2018 U.S. code, title, and definition.
"@
  [System.IO.File]::WriteAllText($blueprintFile, $blueprint + "`r`n", (New-Object System.Text.UTF8Encoding($false)))

  $candidateRows.Add([ordered]@{
    candidate_id = $page.id
    category = "occupation_classification"
    page_title = $page.title
    proposed_url = $page.proposed_url
    parent_hub = "/roles/"
    primary_keywords = $primaryKeyword
    secondary_keywords = $secondaryKeywords
    search_intent = $searchIntent
    intended_audience = $audience
    geographic_relevance = "2018 U.S. SOC only; not a current or global occupational framework."
    competitor_research = "BLS taxonomy checked from local workbook; candidate-specific SERP and direct competitor review pending."
    credible_sources = $sourceId
    commercial_relevance = "KOV serviceability, candidate relevance, and demand are unverified."
    unique_content_purpose = $uniquePurpose
    internal_link_opportunities = ""
    duplication_cannibalisation_assessment = "Existing-site overlap and need for a distinct public URL are unverified."
    research_status = "2018_SOC_definition_verified; candidate_SERP_demand_and_serviceability_pending"
    approval_status = $approvalStatus
    blueprint_path = $page.blueprint_path
    implementation_status = "staging_html_complete_no_css"
    search_sitemap_status = "excluded"
    publication_status = "not_published"
    notes = "Noindex taxonomy-only staging page; no demand, salary, KOV service, qualification, or outcome claims."
  })
  $trackerRows.Add([ordered]@{
    id = $page.id
    proposed_url = $page.proposed_url
    staging_preview_url = $page.staging_url
    page_group = "occupation_classification"
    parent_hub = "/roles/"
    candidate_status = $qualificationStatus
    owner = "development"
    research_status = "2018_SOC_definition_verified; candidate_SERP_demand_and_serviceability_pending"
    research_record = $page.record_path
    blueprint_status = "taxonomy_entry_defined; candidate_qualification_pending"
    blueprint_file = $page.blueprint_path
    content_status = "taxonomy_only_staging_entry_complete"
    implementation_status = "staging_html_complete_no_css"
    qa_status = "pending_targeted_browser_checks"
    search_sitemap_status = "excluded"
    publication_status = "not_approved"
    notes = "Noindex, unpublished taxonomy reference only. Candidate demand, relevance, overlap, and serviceability remain unverified."
    qualification_status = $qualificationStatus
    content_writing_status = "taxonomy_entry_staged; no career advice"
    functionality_status = "semantic_HTML_only; no scripts or stylesheets"
    validation_status = "pending_targeted_browser_checks"
    visual_design_status = "provisional_owner_references_pending"
    approval_status = $approvalStatus
  })
  $qualificationRows.Add([ordered]@{
    candidate_id = $page.id
    category = "occupation_classification"
    proposed_url = $page.proposed_url
    qualification_status = $qualificationStatus
    qualification_blockers = "Candidate-specific SERP, first-party demand, existing-page overlap, candidate relevance, and KOV serviceability have not been established. The 2018 U.S. SOC is not a current or global career taxonomy."
    next_gate = "Complete candidate-specific search and overlap research; verify current official SOC material; obtain owner review before qualification or publication."
    approval_status = $approvalStatus
    publication_status = "not_published"
  })
  $keywordRows.Add([ordered]@{
    candidate_id = $page.id
    proposed_url = $page.proposed_url
    primary_keyword = $primaryKeyword
    secondary_keywords = $secondaryKeywords
    search_intent = $searchIntent
    geography = "United States only; 2018 SOC."
    keyword_source = "Editorial taxonomy lookup hypothesis; no keyword tool export."
    search_volume_status = "not_available"
    competitor_serp_status = "pending_candidate_specific_review"
    research_status = "2018_SOC_definition_verified; candidate_SERP_demand_and_serviceability_pending"
    notes = "No search volume, difficulty, ranking, demand, or conversion claim."
  })
}

Add-CsvRows -Path $candidateRegisterPath -Rows @($candidateRows)
Add-CsvRows -Path $trackerPath -Rows @($trackerRows)
Add-CsvRows -Path $qualificationRegisterPath -Rows @($qualificationRows)
Add-CsvRows -Path $keywordMapPath -Rows @($keywordRows)
Write-Output "Generated a staging directory and $($occupations.Count) detailed occupation pages, with matching records and blueprints."
