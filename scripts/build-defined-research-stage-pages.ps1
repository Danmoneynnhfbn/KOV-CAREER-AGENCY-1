$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$ids = @(
  "aerospace-defense-career-guide",
  "biopharma-career-guide",
  "cybersecurity-services-career-guide",
  "data-center-cloud-infrastructure-career-guide",
  "ev-battery-career-guide",
  "federal-executive-private-sector-job-search-ethics",
  "fintech-payments-career-guide",
  "freight-forwarding-3pl-career-guide",
  "medical-device-career-guide",
  "renewable-power-career-guide",
  "semiconductor-career-guide",
  "canada-express-entry-senior-managers",
  "eu-blue-card-senior-professionals",
  "executive-mobility-route-selection",
  "executive-qualification-recognition-cross-border",
  "new-zealand-skilled-migrant-executives",
  "occupational-codes-cross-border-executive-search",
  "singapore-employment-pass-executives",
  "uk-expansion-worker-route",
  "uk-global-talent-research-leaders",
  "uk-innovator-founder-executives",
  "uk-senior-specialist-worker"
)
$development = Join-Path $root "development"
$candidateRegisterPath = Join-Path $development "CANDIDATE-REGISTER.csv"
$trackerPath = Join-Path $development "PAGE-TRACKER.csv"
$candidates = @(Import-Csv -LiteralPath $candidateRegisterPath)
$tracker = @(Import-Csv -LiteralPath $trackerPath)
$generated = [System.Collections.Generic.List[object]]::new()

function Html([string]$Text) {
  return [System.Net.WebUtility]::HtmlEncode($Text)
}

function Resolve-PublicPath([string]$Url) {
  $trimmed = $Url.TrimStart("/")
  if ($trimmed.EndsWith("/")) { return Join-Path (Join-Path $root $trimmed) "index.html" }
  if ($trimmed.EndsWith(".html")) { return Join-Path $root $trimmed }
  return Join-Path $root ($trimmed + ".html")
}

function Get-OutlineItems([string]$BlueprintPath) {
  $content = Get-Content -LiteralPath (Join-Path $root ($BlueprintPath -replace "/", "\")) -Raw
  $section = [regex]::Match($content, "(?ims)^##[^\r\n]*outline[^\r\n]*\r?\n(.*?)(?=^##\s|\z)")
  if (-not $section.Success) {
    $section = [regex]::Match($content, "(?ims)^##[^\r\n]*proposed[^\r\n]*\r?\n(.*?)(?=^##\s|\z)")
  }
  if (-not $section.Success) { return @() }
  $items = @()
  foreach ($line in ($section.Groups[1].Value -split "\r?\n")) {
    if ($line -match "^\s*[-*]\s+(.+)$") {
      $text = $Matches[1] -replace "\*\*", "" -replace '[`"]', ""
      $text = [System.Net.WebUtility]::HtmlDecode($text).Trim()
      if ($text.Length -gt 12) { $items += $text }
    }
  }
  return @($items | Select-Object -First 8)
}

foreach ($id in $ids) {
  $candidate = $candidates | Where-Object { $_.candidate_id -eq $id } | Select-Object -First 1
  $row = $tracker | Where-Object { $_.id -eq $id } | Select-Object -First 1
  if (-not $candidate -or -not $row) { throw "Missing candidate or tracker row: $id" }
  $recordPath = Join-Path $development "research\records\$id.json"
  $record = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json
  if ($record.approval_status -notin @("not_approved", "approved_for_research_only") -and $candidate.approval_status -eq "not_approved") {
    throw "Candidate approval states conflict: $id"
  }

  $stageUrl = "/staging" + $candidate.proposed_url
  $stageFolder = Join-Path $root ($stageUrl.TrimStart("/") -replace "/", "\")
  $stageFile = Join-Path $stageFolder "index.html"
  $blueprint = $candidate.blueprint_path
  if (-not $blueprint -or -not (Test-Path -LiteralPath (Join-Path $root ($blueprint -replace "/", "\")))) {
    throw "Missing page-specific blueprint for $id."
  }
  if (Test-Path -LiteralPath $stageFile) {
    $existingHtml = Get-Content -LiteralPath $stageFile -Raw
    if ($existingHtml -notmatch 'name="robots"\s+content="noindex, nofollow"' -or
        [regex]::Matches($existingHtml, "<h1\b", "IgnoreCase").Count -ne 1) {
      throw "An existing staged candidate route does not satisfy its safety/headline gates: $stageUrl"
    }
    $row.staging_preview_url = $stageUrl
    if ($row.content_status -in @("", "not_started")) { $row.content_status = "existing_candidate_staging_content" }
    if ($row.implementation_status -in @("", "not_started", "foundation_only")) {
      $row.implementation_status = "staging_html_complete_no_css"
    }
    if ($row.qa_status -in @("", "not_run")) { $row.qa_status = "pending_targeted_browser_checks" }
    $row.search_sitemap_status = "excluded"
    $row.publication_status = "not_approved"
    $candidate.implementation_status = "staging_html_present_noindex"
    $generated.Add([pscustomobject]@{ id = $id; path = $stageUrl; outline_count = 0; source_count = @($record.authoritative_sources).Count; existing = $true })
    continue
  }
  $outline = @(Get-OutlineItems -BlueprintPath $blueprint)
  $purpose = [string]$record.unique_content_purpose
  $purpose = $purpose -replace "^(If later qualified, |If later qualified this page would )", ""
  $purpose = $purpose -replace " It must add candidate-facing career context.*$", ""
  $purpose = $purpose -replace "\bexamples?\b", "classification references"
  $audience = [string]$record.intended_audience
  $geography = [string]$record.geographic_relevance
  if ($record.audience_and_geography.geography) { $geography = [string]$record.audience_and_geography.geography }
  if ($geography -is [array]) { $geography = $geography -join "; " }
  $evidenceLimits = @($record.factual_gaps_and_risks | ForEach-Object { [string]$_ } | Select-Object -First 6)
  $sources = @($record.authoritative_sources)
  if ($sources.Count -eq 0) { throw "No source records found for $id." }

  $outlineHtml = if ($outline.Count) {
    "<ol>`r`n" + (($outline | ForEach-Object { "<li>$(Html $_)</li>" }) -join "`r`n") + "`r`n</ol>"
  } else {
    "<p>The candidate blueprint does not yet contain a reviewed outline. Page structure remains under research review.</p>"
  }
  $sourceHtml = foreach ($source in $sources) {
    $sourceUrl = [string]$source.url_or_path
    $urlMatch = [regex]::Match($sourceUrl, "https?://[^\s;]+")
    $link = ""
    if ($urlMatch.Success) {
      $url = $urlMatch.Value.TrimEnd([char[]]@(".", ",", ")"))
      $link = '<a href="{0}" rel="noopener noreferrer">{1}</a>' -f (Html $url), (Html ([string]$source.title))
    } else {
      $link = Html ([string]$source.title)
    }
    $limit = Html ([string]$source.research_use_and_limit)
    $status = Html ([string]$source.access_status)
    '<li><strong>{0}</strong> - {1} <span>Source status: {2}.</span></li>' -f $link, $limit, $status
  }
  $sourceItems = $sourceHtml -join "`r`n"
  $riskHtml = ($evidenceLimits | ForEach-Object { "<li>$(Html $_)</li>" }) -join "`r`n"
  $internalLinks = @($record.internal_link_opportunities | Where-Object {
    $path = Resolve-PublicPath ([string]$_)
    Test-Path -LiteralPath $path
  } | Select-Object -First 6)
  $internalHtml = if ($internalLinks.Count) {
    ($internalLinks | ForEach-Object { '<li><a href="{0}">{1}</a></li>' -f (Html ([string]$_)), (Html ([string]$_)) }) -join "`r`n"
  } else {
    "<li>Relevant KOV internal links have not been verified for this draft.</li>"
  }
  $searchState = Html ([string]$record.record_status -replace "_", " ")
  $pageTitle = Html ([string]$candidate.page_title)
  $description = Html ("Unpublished research-stage draft: " + $purpose)
  $candidatePurpose = Html $purpose
  $candidateAudience = Html $audience
  $candidateGeography = Html $geography
  $html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>$pageTitle | KOV Staging Research Draft</title>
  <meta name="description" content="$description">
</head>
<body>
  <header><a href="/directory/">KOV Career Agency staging</a></header>
  <main>
    <p><strong>Research-stage draft — not approved or published.</strong> This page uses its candidate-specific research record and blueprint. It does not claim measured search demand, KOV service availability, guaranteed outcomes, or individualized professional, legal, or immigration advice.</p>
    <h1>$pageTitle</h1>
    <section aria-labelledby="purpose-heading">
      <h2 id="purpose-heading">What this guide is designed to help examine</h2>
      <p>$candidatePurpose</p>
      <p><strong>Intended audience:</strong> $candidateAudience</p>
      <p><strong>Geographic scope:</strong> $candidateGeography</p>
    </section>
    <section aria-labelledby="research-map-heading">
      <h2 id="research-map-heading">Page-specific research map</h2>
      <p>The following topics come from this page's individual blueprint. They define the work needed for a useful guide; they are not claims that every item has been verified or that the page is ready for publication.</p>
      $outlineHtml
    </section>
    <section aria-labelledby="evidence-heading">
      <h2 id="evidence-heading">Sources and what they establish</h2>
      <ul>$sourceItems</ul>
      <p>Source access and scope are recorded per item. A source may establish classification, official route information, or contextual industry information; it does not establish candidate search demand, KOV serviceability, or an individual's eligibility.</p>
    </section>
    <section aria-labelledby="open-checks-heading">
      <h2 id="open-checks-heading">Open checks before a publication decision</h2>
      <ul>$riskHtml</ul>
      <p><strong>Research record status:</strong> $searchState. Candidate-specific competitor/SERP, first-party demand, overlap, and serviceability gates remain open where noted in the record.</p>
    </section>
    <nav aria-label="Related KOV resources">
      <h2>Related KOV resources</h2>
      <ul>$internalHtml</ul>
    </nav>
  </main>
  <footer><p>Unpublished, noindex development preview. Verify source updates and review the candidate's open research gates before publication.</p></footer>
</body>
</html>
"@
  New-Item -ItemType Directory -Path $stageFolder -Force | Out-Null
  [System.IO.File]::WriteAllText($stageFile, $html, (New-Object System.Text.UTF8Encoding($false)))

  $row.staging_preview_url = $stageUrl
  $row.content_status = "research_stage_page_specific_draft"
  $row.implementation_status = "staging_html_complete_no_css"
  $row.qa_status = "pending_targeted_browser_checks"
  $row.search_sitemap_status = "excluded"
  $row.publication_status = "not_approved"
  $row.content_writing_status = "page_specific_research_stage_draft"
  $row.functionality_status = "semantic_HTML_only; no scripts or stylesheets"
  $row.validation_status = "pending_targeted_browser_checks"
  $row.notes = "Page-specific noindex staging draft generated from the candidate's research record and blueprint. Candidate remains unqualified/not approved; source verification and all open research gates remain unchanged."
  $candidate.implementation_status = "page_specific_research_stage_draft_noindex"
  $generated.Add([pscustomobject]@{ id = $id; path = $stageUrl; outline_count = $outline.Count; source_count = $sources.Count })
}

$trackerCsv = @($tracker | ConvertTo-Csv -NoTypeInformation)
[System.IO.File]::WriteAllText($trackerPath, ($trackerCsv -join "`r`n") + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
$candidateCsv = @($candidates | ConvertTo-Csv -NoTypeInformation)
[System.IO.File]::WriteAllText($candidateRegisterPath, ($candidateCsv -join "`r`n") + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
Write-Output "Generated $($generated.Count) page-specific noindex research-stage pages."
$generated | Format-Table -AutoSize
