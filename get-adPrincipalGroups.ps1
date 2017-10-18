param (
[Parameter (Mandatory=$True,Position=0)]
[string]$user1,
[Parameter (Mandatory=$True,Position=1)]
[string]$user2
)

$payload = @{}
$payload.user1sADGroupNames=@()
$payload.user2sADGroupNames=@()
$payload.user1Name = $user1
$payload.user2Name = $user2
Get-ADPrincipalGroupMembership $user1 | Select-Object name | ForEach-Object{$payload.user1sADGroupNames+=$_.name}
Get-ADPrincipalGroupMembership $user2 | Select-Object name | ForEach-Object{$payload.user2sADGroupNames+=$_.name}
$payload  | ConvertTo-Json | Out-Host