<#-----------------------------------------------------------------------------------------------
| params:
| $u1 is user 1
| $u2 is user 2
|
| cmdlets:
| Get-ADUser - to gather the DNs of the names the user inputted.
| Test-Path  - to look for PowerShellAccessControl in any of the $env:psmodulepath locations
|
| returns:
| [Array]$out which contains:
|  $out[0]: user 1's data
|  $out[1]: user 2's data
|  $out[2]: default error data
|  $out[3]: {ModuleFoubnd : True/False}
|
| or in the case of an error during the try/catch block the user data is left as 2 nulls:
|  $out[0]: $null
|  $out[1]: $null
|  $out[2]: detailed error data
|  $out[3]: {ModuleFoubnd : True/False}
------------------------------------------------------------------------------------------------#>
param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$u1,
    [Parameter (Mandatory=$False,Position=1)]
    [string]$u2
    )

try{
    $out=@()
    $out+= Get-ADUser $u1 | Select-Object   @{Name='Name';     Expr='User1'},   
                                            @{Name='UserName'; Expr={$_.name}},
                                            @{Name='DN';       Expr={$_.distinguishedName}}
    if($u2){
        $out+=  Get-ADUser $u2 | Select-Object  @{Name='Name';     Expr='User2'},
                                                @{Name='UserName'; Expr={$_.name}},
                                                @{Name='DN';       Expr={$_.distinguishedName}}
    }
    $noError = @{ Message = "No error"}
    $out+= @{ Error = $noError}

}
catch [System.Management.Automation.RuntimeException] {
    $myError = @{
        Message = $_.Exception.Message
        Type = $_.FullyQualifiedErrorID
    }
    $out=@()
    $out += $null
    $out += $null
    $out += @{ Error = $myError }
    }

#we are also going to check for PowerShell Access Control Module because the next step requires it    
[Bool]$global:found = $false
$env:psmodulepath.split(';') | ForEach-Object {[String]$x = $_;if(Test-Path ($x + "\PowerShellAccessControl")){$global:found=$true}}
$found_PSAC_Module = @{ ModuleFound = $global:found}
$out += @{Value = $found_PSAC_Module}

ConvertTo-Json $out -Compress | Out-Host
