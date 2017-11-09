param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$u1,
    [Parameter (Mandatory=$True,Position=1)]
    [string]$u2
    )


    try{
        $out=@()
        $out+= Get-ADUser $u1 | Select-Object   @{Name='Name';     Expr='User1'},   
                                                @{Name='UserName'; Expr={$_.name}},
                                                @{Name='DN';       Expr={$_.distinguishedName}}
        $out+=  Get-ADUser $u2 | Select-Object  @{Name='Name';     Expr='User2'},
                                                @{Name='UserName'; Expr={$_.name}},
                                                @{Name='DN';       Expr={$_.distinguishedName}}
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
    
        ConvertTo-Json $out -Compress | Out-Host
    