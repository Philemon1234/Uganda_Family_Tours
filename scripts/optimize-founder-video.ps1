param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,
  [string]$FFmpegPath = 'ffmpeg'
)

$ErrorActionPreference = 'Stop'
$sourcePath = (Resolve-Path -LiteralPath $InputPath).Path
$projectPath = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectPath 'public/videos'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$outputPath = Join-Path $outputDirectory 'uft-founder.mp4'

# Keep this below common static-host file limits and move MP4 metadata before
# the video data so phones can start playback without fetching the entire file.
& $FFmpegPath -hide_banner -nostdin -n -i $sourcePath `
  -map 0:v:0 -map '0:a:0?' -map_metadata -1 -map_chapters -1 -sn -dn `
  -vf 'scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2' `
  -c:v libx264 -profile:v main -level:v 3.1 -pix_fmt yuv420p `
  -preset medium -crf 26 -maxrate 1000k -bufsize 2000k -g 48 `
  -c:a aac -profile:a aac_low -b:a 96k -ac 2 `
  -movflags +faststart $outputPath

if ($LASTEXITCODE -ne 0) {
  throw 'Video conversion failed. Do not use an incomplete output file.'
}

Write-Output "Optimized video: $outputPath"
Write-Output 'Verify the full video before changing HomePage.tsx to use /videos/uft-founder.mp4.'
