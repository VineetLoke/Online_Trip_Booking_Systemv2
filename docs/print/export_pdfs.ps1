<#
export_pdfs.ps1 - Generate printable PDFs via Microsoft Edge (headless) and export ERD.svg to PNG

What it does
- Converts Markdown (BEGINNERS_GUIDE.md and CHEAT_SHEET.md) into simple styled HTML
- Uses Edge headless to print HTML to PDF in docs/print/
- Uses Edge headless to export docs/diagrams/ERD.svg to docs/diagrams/ERD.png

Usage (in PowerShell):
  pwsh -ExecutionPolicy Bypass -File .\docs\print\export_pdfs.ps1

Requirements
- Microsoft Edge installed (msedge.exe)
- Windows PowerShell 5.1+ or PowerShell 7+
#>

param(
  [string]$GuideMd = "..\BEGINNERS_GUIDE.md",
  [string]$CheatMd = "..\..\docs\CHEAT_SHEET.md" # allow running from docs/print folder
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-RepoRoot {
  # Assuming this script is in docs/print
  $scriptDir = Split-Path -Parent $PSCommandPath
  return (Resolve-Path (Join-Path $scriptDir '..\..')).Path
}

function Get-EdgePath {
  $candidates = @(
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
    'msedge.exe'
  )
  foreach ($p in $candidates) { if ($p -and (Test-Path $p)) { return $p } }
  return 'msedge.exe'
}

function Convert-ToFileUri([string]$Path) {
  $full = (Resolve-Path $Path).Path
  return ([System.Uri]$full).AbsoluteUri
}

function Ensure-Dir([string]$path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Force -Path $path | Out-Null }
}

function Convert-MarkdownToHtml([string]$mdPath, [string]$htmlPath, [string]$title) {
  if (-not (Test-Path $mdPath)) { throw "Markdown not found: $mdPath" }
  $md = Get-Content -Raw -Path $mdPath
  $lines = $md -split "\r?\n"

  $sb = New-Object System.Text.StringBuilder
  $null = $sb.AppendLine('<!doctype html>')
  $null = $sb.AppendLine('<html lang="en"><head>')
  $null = $sb.AppendLine("<meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'>")
  $null = $sb.AppendLine("<title>$title</title>")
  $null = $sb.AppendLine('<style>body{font-family:Segoe UI,Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;line-height:1.6;color:#2c3e50} pre,code{font-family:Consolas,Menlo,monospace} pre{background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto} h1,h2,h3{color:#1a73e8} h1{border-bottom:2px solid #e9ecef;padding-bottom:8px} table{border-collapse:collapse} td,th{border:1px solid #e9ecef;padding:6px 10px} .meta{color:#6c757d;font-size:12px;margin-bottom:20px}</style>')
  $null = $sb.AppendLine('</head><body>')
  $null = $sb.AppendLine("<div class='meta'>Printed: $(Get-Date -Format 'u')</div>")

  $inCode = $false
  $inUl = $false
  $inOl = $false

  function CloseLists {
    param()
    if ($inUl) { $null = $sb.AppendLine('</ul>'); Set-Variable -Name inUl -Value $false -Scope 1 }
    if ($inOl) { $null = $sb.AppendLine('</ol>'); Set-Variable -Name inOl -Value $false -Scope 1 }
  }

  foreach ($line in $lines) {
    if ($line -match '^```') {
      if (-not $inCode) { CloseLists; $null = $sb.AppendLine('<pre><code>'); $inCode = $true }
      else { $null = $sb.AppendLine('</code></pre>'); $inCode = $false }
      continue
    }

    if ($inCode) {
      $escaped = $line -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;'
      $null = $sb.AppendLine($escaped)
      continue
    }

    # Headings
    if ($line -match '^(#{1,6})\s+(.*)$') {
      CloseLists
      $level = $matches[1].Length
      $text = $matches[2]
      $null = $sb.AppendLine("<h$level>$text</h$level>")
      continue
    }

    # Unordered list
    if ($line -match '^\s*[-*]\s+(.*)$') {
      if (-not $inUl) { CloseLists; $null = $sb.AppendLine('<ul>'); $inUl = $true }
      $text = $matches[1]
      $null = $sb.AppendLine("<li>$text</li>")
      continue
    }

    # Ordered list (simple)
    if ($line -match '^\s*\d+\.?\s+(.*)$') {
      if (-not $inOl) { CloseLists; $null = $sb.AppendLine('<ol>'); $inOl = $true }
      $text = $matches[1]
      $null = $sb.AppendLine("<li>$text</li>")
      continue
    }

    # Paragraph or blank
    if ([string]::IsNullOrWhiteSpace($line)) {
      CloseLists
      $null = $sb.AppendLine('<br>')
    }
    else {
      $null = $sb.AppendLine("<p>$line</p>")
    }
  }
  CloseLists

  $null = $sb.AppendLine('</body></html>')
  $html = $sb.ToString()
  $outDir = Split-Path -Parent $htmlPath
  Ensure-Dir $outDir
  Set-Content -LiteralPath $htmlPath -Value $html -Encoding UTF8
}

$repoRoot = Resolve-RepoRoot
$printDir = Join-Path $repoRoot 'docs\print'
$guideMdPath = Resolve-Path (Join-Path $repoRoot 'docs\BEGINNERS_GUIDE.md')
$cheatMdPath = Resolve-Path (Join-Path $repoRoot 'docs\CHEAT_SHEET.md')

$guideHtml = Join-Path $printDir 'BEGINNERS_GUIDE.html'
$cheatHtml = Join-Path $printDir 'CHEAT_SHEET.html'
$guidePdf  = Join-Path $printDir 'BEGINNERS_GUIDE.pdf'
$cheatPdf  = Join-Path $printDir 'CHEAT_SHEET.pdf'

$erdSvg = Join-Path $repoRoot 'docs\diagrams\ERD.svg'
$erdPng = Join-Path $repoRoot 'docs\diagrams\ERD.png'

Write-Host 'Converting Markdown to HTML ...'
Convert-MarkdownToHtml -mdPath $guideMdPath -htmlPath $guideHtml -title "Beginner's Guide"
Convert-MarkdownToHtml -mdPath $cheatMdPath -htmlPath $cheatHtml -title 'Cheat Sheet'

$edge = Get-EdgePath
Write-Host "Using Edge at: $edge"

function PrintToPdf([string]$htmlFile, [string]$pdfFile) {
  $uri = Convert-ToFileUri $htmlFile
  Write-Host "Printing to PDF -> $pdfFile"
  $args = @('--headless=new','--disable-gpu','--print-to-pdf-no-header','--run-all-compositor-stages-before-draw','--virtual-time-budget=10000',"--print-to-pdf=$pdfFile", $uri)
  $p = Start-Process -FilePath $edge -ArgumentList $args -PassThru -NoNewWindow -Wait
  if ($p.ExitCode -ne 0) {
    Write-Warning "First attempt failed (exit $($p.ExitCode)). Retrying without 'new' headless flag..."
    $args2 = @('--headless','--disable-gpu','--print-to-pdf-no-header','--run-all-compositor-stages-before-draw','--virtual-time-budget=10000',"--print-to-pdf=$pdfFile", $uri)
    $p2 = Start-Process -FilePath $edge -ArgumentList $args2 -PassThru -NoNewWindow -Wait
    if ($p2.ExitCode -ne 0) {
      Write-Warning "Edge headless print failed (exit $($p2.ExitCode)). Skipping PDF generation for $htmlFile. See docs/print/PRINTABLES.md for manual export options."
      return
    }
  }
}

function SvgToPng([string]$svgPath, [string]$pngPath, [string]$size='1200,700') {
  $uri = Convert-ToFileUri $svgPath
  Write-Host "Exporting SVG to PNG -> $pngPath"
  $args = @('--headless=new','--disable-gpu',"--screenshot=$pngPath","--window-size=$size", $uri)
  $p = Start-Process -FilePath $edge -ArgumentList $args -PassThru -NoNewWindow -Wait
  if ($p.ExitCode -ne 0) {
    Write-Warning "First attempt failed (exit $($p.ExitCode)). Retrying without 'new' headless flag..."
    $args2 = @('--headless','--disable-gpu',"--screenshot=$pngPath","--window-size=$size", $uri)
    $p2 = Start-Process -FilePath $edge -ArgumentList $args2 -PassThru -NoNewWindow -Wait
    if ($p2.ExitCode -ne 0) {
      Write-Warning "Edge headless screenshot failed (exit $($p2.ExitCode)). Skipping PNG export."
      return
    }
  }
}

# Ensure output dir
Ensure-Dir $printDir

# Generate PDFs
PrintToPdf -htmlFile $guideHtml -pdfFile $guidePdf
PrintToPdf -htmlFile $cheatHtml -pdfFile $cheatPdf

# Export ERD.svg to ERD.png
if (Test-Path $erdSvg) {
  SvgToPng -svgPath $erdSvg -pngPath $erdPng -size '1400,900'
  Write-Host "ERD PNG exported: $erdPng"
}

Write-Host 'Done. Outputs:'
Write-Host " - $guidePdf"
Write-Host " - $cheatPdf"
Write-Host " - $erdPng (if ERD.svg present)"
