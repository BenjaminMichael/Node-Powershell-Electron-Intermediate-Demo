param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$adgroupdn
    )

$me = & whoami
$finalResult = Get-ADGroup $adgroupdn | Get-EffectiveAccess -Principal $me
Write-Host $finalResult.effectiveAccess
