param (
    [Parameter (Mandatory=$True,Position=0)]
    [String]$adgroupdn,
    [Parameter (Mandatory=$True,Position=1)]
    $i,
    [Parameter (Mandatory=$True,Position=2)]
    [String]$workflow,
    [Parameter (Mandatory=$False,Position=3)]
    [String]$targetUserDN
    )

    [string]$myResult

    if($workflow -eq "Remove"){
        $myResult="Get-EffectiveAccess Remove"
    }else{
        $myResult="Get-EffectiveAccess Compare"
    }
    [array]$out=@()
    $global:targetgroupdn=$adgroupdn
    $global:NewObject =@{}
    try{
      $global:NewObject.AccessData = (Get-EffectiveAccess -LiteralPath $global:targetgroupdn).EffectiveAccess
       }
    catch [System.Management.Automation.RuntimeException] {
        $myError = @{
            Result = "$($myResult) Error"
            Message = $_.Exception.Message
            Type = $_.FullyQualifiedErrorID
            }
        $global:out += @{ Error = $myError }
        $global:out+=$null
        }
        
        $out+= @{
            Result = $myResult
            bind_i = $i
            targetGroupName = $adgroupdn
            targetUserDN = $targetUserDN
            AccessData = $global:NewObject.AccessData
            }
$out += @{null = $null}
$out | ConvertTo-Json | Out-Host