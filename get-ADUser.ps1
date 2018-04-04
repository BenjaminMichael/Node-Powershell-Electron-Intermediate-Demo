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
|  $out[2]: {ModuleFound : True/False}
|
| or in the case of an error during the try/catch block:
|  $out[0]: Result, Message, and Type
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
                                            @{Name='FName'; Expr={$_.GivenName}},
                                            @{Name='LName'; Expr={$_.Surname}},
                                            @{Name='Error';    Expr={$false}},
                                            @{Name='Result'; Expr={'Get-ADUser Success'}}
    if($PSBoundParameters.ContainsKey('u2')){
        $global:out+=  Get-ADUser $u2 | Select-Object  @{Name='Name';     Expr='User2'},
                                                @{Name='UserName'; Expr={$_.name}},
                                                @{Name='DN';       Expr={$_.distinguishedName}},
                                                @{Name='FName'; Expr={$_.GivenName}},
                                                @{Name='LName'; Expr={$_.Surname}}
        }else{$global:out+=$null}
}
catch [System.Management.Automation.RuntimeException] {
    $global:out=@()
    $myError = @{
        Result = "Get-ADUser Error"
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