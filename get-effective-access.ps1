param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$adgroupdn,
    [Parameter (Mandatory=$True,Position=1)]
    [string]$me,
    [Parameter (Mandatory=$True,Position=2)]
    $i
    )

try{
$finalResult = (Get-EffectiveAccess $adgroupdn -Principal $me).EffectiveAccess
$out = @()
$out += @{  Result = 'Get-EffectiveAccess Success'
            AccessData = $finalResult
            bind_i = $i
            targetGroupName = $adgroupdn
        }
    }
    catch [System.Management.Automation.RuntimeException] {
        $global:out=@()
        $myError = @{
            Result = "Get-EffectiveAccess Error"
            Message = $_.Exception.Message
            Type = $_.FullyQualifiedErrorID
        }
        $global:out += @{ Error = $myError }
        $global:out+=$null
        }
$out | ConvertTo-Json | Out-Host
