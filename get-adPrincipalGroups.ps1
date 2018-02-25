<# -- get-adPrincipalGroups.ps1 --
| params:
| $user1 is user 1's distinguished name
| $user2 is user 2's distinguished name
|
| cmdlets: Get-ADPrincipalGroupMembership
|
| returns: [JSON formatted object]$global:out
| [array]user1sGroups
| [array]user2sGroups (optionally)
| [string]user1Name
| [string]user2Name (optionally)
-------------------------------   #>

param (
[Parameter (Mandatory=$True,Position=0)]
$user1,
[Parameter (Mandatory=$False,Position=1)]
$user2
)
$global:out=@()
try{
    if($PSBoundParameters.ContainsKey('user2')){
        $global:out += @{
            user1sGroups=@()
            user1Name = $user1
            user2sGroups=@()
            user2Name = $user2
        }
        Get-ADPrincipalGroupMembership -Identity $user2 | select distinguishedName | ForEach-Object{
            $global:out[0].user2sGroups+=$_.distinguishedName
        }
    }else{
        $global:out += @{
            user1sGroups=@()
            user1Name = $user1
            user2sGroups=""
            user2Name = ""
        }
    }
    Get-ADPrincipalGroupMembership -Identity $user1 | select distinguishedName | ForEach-Object{
        $global:out[0].user1sGroups+=$_.distinguishedName
    }
}
catch [System.Management.Automation.RuntimeException] {
    $myError = @{
                Message = $_.Exception.Message
                Type = $_.FullyQualifiedErrorID
            }
    $global:out += @{ Error = $myError }
}


$global:out  | ConvertTo-Json | Out-Host