<#-----------------------------------------------------------------------------------------------
| params:
| $user is the user object name
| $group is the AD security group we want to take them out of
|
| cmdlets:
| Remove-ADGroupMember
|
| returns:
| [Array]$out which contains:
|  $out[0]: {Success : True/False}
|  $out[1]: default error data
|
| or in the case of an error during the try/catch block the success :
|  $out[0]: $null
|  $out[1]: detailed error data
|
-----------------------------------------------------------------------------------------------#>
param (
    [Parameter (Mandatory=$True,Position=0)]
    [String]$user,
    [Parameter (Mandatory=$True,Position=1)]
    [String]$group,
    [Parameter (Mandatory=$True,Position=2)]
    $i
    )

    $out=@()

try{
    Remove-ADGroupMember -Identity $group -Members $user -Confirm:$false
    $out += @{
                Result = "Success"
                bind_i = $i
                groupName = $group.Split('=')[1].Split(',')[0]
                groupDN = $group
                userDN = $user
            }

}
catch [System.Management.Automation.RuntimeException] {
    $myError = @{
                Message = $_.Exception.Message
                Type = $_.FullyQualifiedErrorID
            }
    $out += @{ Error = $myError }
}

ConvertTo-Json $out -Compress