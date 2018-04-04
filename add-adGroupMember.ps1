<#-----------------------------------------------------------------------------------------------
| params:
| $user is the user object name
| $group is the AD security group we want to add them to
| $i is the key to bind us to the list of group and to the list of UI elements
|
| cmdlets:
| Add-ADGroupMember
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
    Add-ADGroupMember -Identity $group -Members $user
    $out += @{
                Result = "Add-ADGroupMember Success"
                bind_i = $i
                groupName = $group.Split('=')[1].Split(',')[0]
                groupDN = $group
                user = $user
                userName = $user.Split('=')[1].Split(',')[0]
            }

}
catch [System.Management.Automation.RuntimeException] {
    $myError = @{
                Result = "Add-ADGroupMember Error"
                Message = $_.Exception.Message
                Type = $_.FullyQualifiedErrorID
            }
    $out += @{ Error = $myError }
}

ConvertTo-Json $out -Compress