param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$user,
    [Parameter (Mandatory=$True,Position=1)]
    [string]$group
    )
try{
Add-ADGroupMember -Identity $group -Members $user
$out="Success!"
}
catch [System.Management.Automation.RuntimeException] {
    $myError = @{
        Message = $_.Exception.Message
        Type = $_.FullyQualifiedErrorID
    }
    $out = @{ Error = $myError }
}

ConvertTo-Json $out -Compress