param (
    [Parameter (Mandatory=$True,Position=0)]
    [String]$adgroupdn,
    [Parameter (Mandatory=$True,Position=1)]
    [String]$me,
    [Parameter (Mandatory=$True,Position=2)]
    $i,
    [Parameter (Mandatory=$True,Position=3)]
    [String]$workflow,
    [Parameter (Mandatory=$False,Position=4)]
    [String]$targetUserDN
    )


    [string]$myResult

    if($workflow -eq "Remove"){
        $myResult="Get-EffectiveAccess Remove"
    }else{
        $myResult="Get-EffectiveAccess Compare"
    }

try{
$finalResult = (Get-EffectiveAccess $adgroupdn -Principal $me).EffectiveAccess
$out = @()

$out += @{  Result = "$($myResult)"
            AccessData = $finalResult
            bind_i = $i
            targetGroupName = $adgroupdn
            targetUserDN = $targetUserDN
        }
    }
    catch [System.Management.Automation.RuntimeException] {
        $global:out=@()
        $myError = @{
            Result = "$($myResult) Error"
            Message = $_.Exception.Message
            Type = $_.FullyQualifiedErrorID
        }
        $global:out += @{ Error = $myError }
        $global:out+=$null
        }
$out += @{null = $null}
$out | ConvertTo-Json | Out-Host
