<#
param (
    [Parameter (Mandatory=$True,Position=0)]
    [string]$path
    )
    #>

Write-Host (Get-Item -Path ".\" -Verbose).FullName