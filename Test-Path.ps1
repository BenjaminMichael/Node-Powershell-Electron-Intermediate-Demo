[Bool]$global:found = $false
$env:psmodulepath.split(';') | ForEach-Object {[String]$x = $_;if(Test-Path ($x + "\PowerShellAccessControlz")){$global:found=$true}}
$obj = [PSCustomObject]@{name="found"; value=$global:found}
$obj | ConvertTo-Json -Compress