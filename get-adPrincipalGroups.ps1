param (
[Parameter (Mandatory=$True,Position=0)]
[string]$user1,
[Parameter (Mandatory=$False,Position=1)]
[string]$user2
)

$payload = @{}

$payload.user1sGroups=@()
$payload.user1Name = $user1
Get-ADPrincipalGroupMembership -Identity $user1 | select distinguishedName | ForEach-Object{$payload.user1sGroups+=$_.distinguishedName}
if($user2){
    $payload.user2sGroups=@()
    $payload.user2Name = $user2
    Get-ADPrincipalGroupMembership -Identity $user2 | select distinguishedName | ForEach-Object{$payload.user2sGroups+=$_.distinguishedName}
}
$payload  | ConvertTo-Json | Out-Host