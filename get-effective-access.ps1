﻿param (
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
<#
We called the PS Script with element[i] and the results will be bound to element[bind_i]
#>
$out +=@{
    bind_i = $i
    targetGroupName = $adgroupdn
}
$out | ConvertTo-Json | Out-Host
