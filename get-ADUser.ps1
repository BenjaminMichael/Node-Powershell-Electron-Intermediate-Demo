<#---  get-ADUser.ps1  ---
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
|  $out[3]: {ModuleFound : True/False}
|
| or in the case of an error during the try/catch block the user data is left as 2 nulls:
|  $out[0]: $null
|  $out[1]: $null
|  $out[2]: detailed error data
|  $out[3]: {ModuleFound : True/False}
------------------------------------------------------------------------------------------------#>
param (
    [Parameter (Mandatory=$True,Position=0)]
    $u1,
    [Parameter (Mandatory=$False,Position=1)]
    $u2
    )
    $global:out=@()
try{
    $global:out+= Get-ADUser $u1 | Select-Object   @{Name='Name';     Expr='User1'},   
                                            @{Name='UserName'; Expr={$_.name}},
                                            @{Name='DN';       Expr={$_.distinguishedName}},
                                            @{Name='Error';    Expr={$false}}
    if($PSBoundParameters.ContainsKey('u2')){
        $global:out+=  Get-ADUser $u2 | Select-Object  @{Name='Name';     Expr='User2'},
                                                @{Name='UserName'; Expr={$_.name}},
                                                @{Name='DN';       Expr={$_.distinguishedName}}
        }else{$global:out+=$null}
}
catch [System.Management.Automation.RuntimeException] {
    $global:out=@()
    $myError = @{
        Message = $_.Exception.Message
        Type = $_.FullyQualifiedErrorID
    }
    $global:out += @{ Error = $myError }
    $global:out+=$null
    }

#we are also going to check for PowerShell Access Control Module because the next step requires it    
[Bool]$global:found = $false
$env:psmodulepath.split(';') | ForEach-Object {[String]$x = $_;if(Test-Path ($x + "\PowerShellAccessControl")){$global:found=$true}}
$found_PSAC_Module = @{ ModuleFound = $global:found}
$global:out += @{Value = $found_PSAC_Module}

ConvertTo-Json $global:out -Compress | Out-Host