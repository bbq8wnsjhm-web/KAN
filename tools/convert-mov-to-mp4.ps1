param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [string]$OutputPath,

  [ValidateRange(14, 28)]
  [int]$Crf = 18,

  [ValidateSet('medium', 'slow', 'slower')]
  [string]$Preset = 'slow',

  [switch]$KeepAudio
)

function Resolve-FfmpegPath {
  $command = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $packageRoot = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
  $candidate = Get-ChildItem $packageRoot -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like 'Gyan.FFmpeg.Essentials*' } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if ($candidate) {
    $binary = Join-Path $candidate.FullName 'ffmpeg-8.1-essentials_build\bin\ffmpeg.exe'
    if (Test-Path $binary) {
      return $binary
    }

    $fallback = Get-ChildItem $candidate.FullName -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue |
      Select-Object -First 1
    if ($fallback) {
      return $fallback.FullName
    }
  }

  throw 'FFmpeg was not found. Install it with winget or check PATH.'
}

if (-not (Test-Path -LiteralPath $InputPath)) {
  throw "Input file was not found: $InputPath"
}

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path

if (-not $OutputPath) {
  $directory = Split-Path -Parent $resolvedInput
  $name = [System.IO.Path]::GetFileNameWithoutExtension($resolvedInput)
  $OutputPath = Join-Path $directory ($name + '.mp4')
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
$outputDirectory = Split-Path -Parent $resolvedOutput
if ($outputDirectory -and -not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Force $outputDirectory | Out-Null
}

$ffmpeg = Resolve-FfmpegPath

$arguments = @(
  '-y'
  '-i'
  $resolvedInput
  '-c:v'
  'libx264'
  '-preset'
  $Preset
  '-crf'
  $Crf
  '-pix_fmt'
  'yuv420p'
  '-movflags'
  '+faststart'
)

if ($KeepAudio) {
  $arguments += @(
    '-c:a'
    'aac'
    '-b:a'
    '192k'
  )
} else {
  $arguments += '-an'
}

$arguments += $resolvedOutput

Write-Host ''
Write-Host "FFmpeg: $ffmpeg"
Write-Host "Input:  $resolvedInput"
Write-Host "Output: $resolvedOutput"
Write-Host "CRF:    $Crf"
Write-Host "Preset: $Preset"
Write-Host ''

& $ffmpeg @arguments

if ($LASTEXITCODE -ne 0) {
  throw "FFmpeg exited with code $LASTEXITCODE"
}

Write-Host ''
Write-Host 'Conversion completed.'
