$x=(Get-Item -Path ".\" -Verbose).fullname
$y= "$($x)\PSDependencies\PowerShellAccessControl"
$z = "C:\Program Files\WindowsPowerShell\Modules"
$w = Get-Credential
try {
    Invoke-Command -ComputerName $env:COMPUTERNAME -Credential $w -Scriptblock { <#Copy-Item $y $z #> } 
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