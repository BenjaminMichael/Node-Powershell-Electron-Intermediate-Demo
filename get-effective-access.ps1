param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$ADGroupName
    )
$me = & whoami
$finalResult = Get-ADGroup $ADGroupName | Get-EffectiveAccess -Principal $me
Write-Host $finalResult.effectiveAccess