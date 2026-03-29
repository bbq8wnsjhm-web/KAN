param(
  [int]$Port = 8000
)

$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "Локальный preview-сервер сайта"
Write-Host "Корень: $projectRoot"
Write-Host "Адрес:  http://localhost:$Port"
Write-Host "Остановить: Ctrl+C"
Write-Host ""

Push-Location $projectRoot

try {
  $python = Get-Command python -ErrorAction SilentlyContinue

  if (-not $python) {
    throw "Python не найден в PATH. Установите Python или запустите сервер другим способом."
  }

  python -m http.server $Port
}
finally {
  Pop-Location
}
