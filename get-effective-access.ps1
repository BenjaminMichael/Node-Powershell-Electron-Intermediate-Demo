param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$adgroupdn
    )

#if($adgroupdn.Substring(1,1)-eq '"' ){$adgroupdn.trimStart();$adgroupdn.trimend()}
$me = & whoami
$finalResult = Get-ADGroup $adgroupdn | Get-EffectiveAccess -Principal $me
Write-Host $finalResult.effectiveAccess
