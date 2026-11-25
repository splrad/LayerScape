# setup-dotnet installs this channel alongside the build SDK selected by global.json.
[xml]$project = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'UpdateCheck.Tests/UpdateCheck.Tests.csproj') -Raw
$framework = [string]$project.Project.PropertyGroup.TargetFramework
if ($framework -cnotmatch '^net(?<channel>[1-9][0-9]*\.[0-9]+)$') {
    throw "Cannot determine the .NET runtime channel for UpdateCheck.Tests from '$framework'."
}
"$($Matches.channel).x"
