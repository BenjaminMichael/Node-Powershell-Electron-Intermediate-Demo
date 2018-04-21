<# -- get-adPrincipalGroups.ps1 --
| params:
| $user1 is user 1's distinguished name
| $user2 is user 2's distinguished name
|
| cmdlets: Get-ADPrincipalGroupMembership
|
| returns: [JSON formatted object]$global:outObj
| [array]user1sGroups
| [array]user2sGroups (optionally)
| [string]user1Name
| [string]user2Name (optionally)
-------------------------------   #>

param (
[Parameter (Mandatory=$True,Position=0)]
$user1,
[Parameter (Mandatory=$True,Position=1)]
$cu,
[Parameter (Mandatory=$False,Position=2)]
$user2,
[Parameter (Mandatory=$False,Position=3)]
$user1FName,
[Parameter (Mandatory=$False,Position=4)]
$user1LName
)
$global:outObj=@()
try{
    if($PSBoundParameters.ContainsKey('user2')){
        $global:outObj += @{
            Result = "Get-ADPrincipalGroupMembership Compare"
            user1sGroups=@()
            user1Name = $user1
            user2sGroups=@()
            user2Name = $user2
            currentUser = $cu
            FName = $user1FName
            LName = $user1LName
        }
        Get-ADPrincipalGroupMembership -Identity $user2 | select distinguishedName | ForEach-Object{
            $global:outObj[0].user2sGroups+=$_.distinguishedName
        }
    }else{
        $global:outObj += @{
            Result = "Get-ADPrincipalGroupMembership Remove"
            user1sGroups=@()
            user1Name = $user1
            user2sGroups=""
            user2Name = ""
            currentUser = $cu
            FName = $user1FName
            LName = $user1LName
        }
    }
    Get-ADPrincipalGroupMembership -Identity $user1 | select distinguishedName | ForEach-Object{
        $global:outObj[0].user1sGroups+=$_.distinguishedName
    }
}
catch [System.Management.Automation.RuntimeException] {
    $myError = @{
                Result = "Get-ADPrincipalGroupMembership Error"
                Message = $_.Exception.Message
                Type = $_.FullyQualifiedErrorID
            }
    $global:outObj += @{ Error = $myError }
    $global:outObj += $null
}

$out =@()
$out += $global:outObj
$out += @{Null=$null}
$out  | ConvertTo-Json | Out-Host