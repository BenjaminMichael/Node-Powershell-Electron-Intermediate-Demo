param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$adgroupdn,
    [Parameter (Mandatory=$True,Position=1)]
    [string]$me,
    [Parameter (Mandatory=$True,Position=2)]
    $i
    )


$finalResult = (Get-EffectiveAccess $adgroupdn -Principal $me).EffectiveAccess
$out = @()
$out += @{Result = $finalResult}
$out +=@{bind_i = $i}
$out | ConvertTo-Json | Out-Host
