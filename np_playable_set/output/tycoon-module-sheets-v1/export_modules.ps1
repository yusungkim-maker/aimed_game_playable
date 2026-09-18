$ErrorActionPreference = 'Stop'
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../tycoon-separated-v1'))
$destinationRoot = 'C:\Users\김유성\Desktop\cocos creator practice\asset\_임시저장소\AI\_gen'
$folders = @(Get-ChildItem -LiteralPath $sourceRoot -Directory)
if ($folders.Count -ne 6) { throw 'Expected exactly six source folders.' }
# Refuse to silently overwrite any existing destination artifact.
foreach ($folder in $folders) {
    $files = @(Get-ChildItem -LiteralPath $folder.FullName -Filter '*.png' -File)
    if ($files.Count -ne 8) { throw "Expected eight images: $($folder.Name)" }
    foreach ($file in $files) {
        $target = Join-Path (Join-Path $destinationRoot $folder.Name) $file.Name
        if (Test-Path -LiteralPath $target) { throw "Destination already exists: $target" }
    }
}
New-Item -ItemType Directory -Path $destinationRoot -Force | Out-Null
foreach ($folder in $folders) {
    $targetFolder = Join-Path $destinationRoot $folder.Name
    New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
    foreach ($file in Get-ChildItem -LiteralPath $folder.FullName -Filter '*.png' -File) {
        $target = Join-Path $targetFolder $file.Name
        Copy-Item -LiteralPath $file.FullName -Destination $target
        if ((Get-FileHash -LiteralPath $file.FullName).Hash -ne (Get-FileHash -LiteralPath $target).Hash) {
            throw "Copy verification failed: $target"
        }
    }
}
Get-ChildItem -LiteralPath $destinationRoot -Directory | ForEach-Object {
    [PSCustomObject]@{Folder=$_.Name;PNGCount=@(Get-ChildItem -LiteralPath $_.FullName -Filter '*.png' -File).Count}
}
