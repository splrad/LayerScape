#Requires -Version 7.6
<#
.SYNOPSIS
    用 Release 构建测试部署器扫描、安装和插件启动时的版本判定。
.DESCRIPTION
    先用打包脚本构建插件和部署器。测试使用临时 HKCU 子键和 DLL 目录，无需启动 AutoCAD。
#>

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Assert-Equal($Actual, $Expected, [string]$Context) {
    if ($Actual -cne $Expected) {
        throw "$Context expected '$Expected', got '$Actual'."
    }
}

$repo = Split-Path -Parent $PSScriptRoot
$version = [IO.File]::ReadAllText((Join-Path $repo 'VERSION')).Trim()
$bin = Join-Path $repo 'artifacts/bin'
$deployer = [Reflection.Assembly]::LoadFrom((Join-Path $bin 'AFR.Deployer/release_win-x64/AFR-Deployer.dll'))
$pluginDll = Join-Path $bin 'AFR-ACAD2027/release/AFR-ACAD2027.dll'
$plugin = [Reflection.Assembly]::LoadFrom($pluginDll)
# 读取程序集特性时需要解析 AutoCAD 特性类型。复用构建已还原的引用程序集。
$restore = Get-Content -Raw -LiteralPath (Join-Path $repo 'src/AutoCAD/AFR-ACAD2027/obj/project.assets.json') |
    ConvertFrom-Json -AsHashtable
foreach ($reference in $plugin.GetReferencedAssemblies() | Where-Object Name -Match '^ac.*mgd$') {
    $name = $reference.Name + '.dll'
    $paths = foreach ($package in $restore.libraries.Values) {
        foreach ($file in $package.files | Where-Object { $_.EndsWith("/$name", [StringComparison]::OrdinalIgnoreCase) }) {
            foreach ($folder in $restore.packageFolders.Keys) {
                Join-Path $folder "$($package.path)/$file"
            }
        }
    }
    $referencePath = $paths | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
    if (!$referencePath) { throw "Cannot find restored AutoCAD reference: $name" }
    [void][Reflection.Assembly]::LoadFrom($referencePath)
}

$static = [Reflection.BindingFlags]'NonPublic, Static'
$scan = $deployer.GetType('AFR.Deployer.Services.CadRegistryScanner', $true).GetMethod('ReadInstallation', $static)
$install = $deployer.GetType('AFR.Deployer.Services.PluginDeployer', $true).GetMethod('TryInstall', $static)
$initialize = $plugin.GetType('AFR.Hosting.AppInitializer', $true).GetMethod('InitializeProfile', $static)
$schema = $plugin.GetType('AFR.Services.PluginVersionService', $true).GetField('ConfigSchemaVersion').GetRawConstantValue()

$id = 'LayerScape-VersionTest-' + [Guid]::NewGuid().ToString('N')
$baseKey = "Software\$id"
$targetDir = [IO.Path]::Combine([IO.Path]::GetTempPath(), $id)
$profile = 'ACAD-TEST:409'
$profiles = [Collections.Generic.List[string]]::new()
$profiles.Add($profile)
$profileKey = "$baseKey\$profile\Applications\AFR-ACAD2027"
$registry = [Microsoft.Win32.Registry]::CurrentUser
$descriptorType = $deployer.GetType('AFR.Deployer.Models.CadDescriptor', $true)
$descriptorArgs = @('AutoCAD', '2027', 'AutoCAD 2027', $baseKey, 'AFR-ACAD2027', 'AFR.Deployer.Resources.AFR-ACAD2027.dll')
$descriptor = [Activator]::CreateInstance($descriptorType, $descriptorArgs)

try {
    $scanArgs = @($descriptor, $profiles)
    $installation = $scan.Invoke($null, $scanArgs)
    Assert-Equal ($installation.Status.ToString()) 'NotInstalled' 'Unregistered plugin'

    $installArgs = @($installation, $targetDir, $null, $null)
    Assert-Equal ($install.Invoke($null, $installArgs)) $true "Install bundled DLL ($($installArgs[2]))"
    $installedDll = [IO.Path]::Combine($targetDir, 'AFR-ACAD2027.dll')
    $key = $registry.OpenSubKey($profileKey, $true)
    try {
        Assert-Equal ($key.GetValue('PluginVersion')) $version 'Installer persisted version'
        Assert-Equal ($key.GetValue('PluginBuildId')) $null 'Fresh installation legacy value'
        Assert-Equal ($key.GetValue('ConfigSchemaVersion')) $schema 'Installer persisted schema'
        Assert-Equal ($key.GetValue('IsInitialized')) 0 'Installer staged marker'

        $originalDll = (Get-FileHash -LiteralPath $installedDll).Hash
        $descriptorArgs[-1] = 'AFR.Deployer.Resources.AFR-ACAD2027.cad.json'
        $invalidDescriptor = [Activator]::CreateInstance($descriptorType, $descriptorArgs)
        $invalidInstallation = $scan.Invoke($null, @($invalidDescriptor, $profiles))
        Assert-Equal ($install.Invoke($null, @($invalidInstallation, $targetDir, $null, $null))) $false 'Invalid DLL resource'
        Assert-Equal ((Get-FileHash -LiteralPath $installedDll).Hash) $originalDll 'DLL after failed installation'
        Assert-Equal ($key.GetValue('PluginVersion')) $version 'Version after failed installation'

        $descriptorArgs[4] = 'subdir\AFR-ACAD2027'
        $descriptorArgs[5] = 'AFR.Deployer.Resources.AFR-ACAD2027.dll'
        $invalidDescriptor = [Activator]::CreateInstance($descriptorType, $descriptorArgs)
        $invalidInstallation = $scan.Invoke($null, @($invalidDescriptor, $profiles))
        $invalidArgs = @($invalidInstallation, $targetDir, $null, $null)
        Assert-Equal ($install.Invoke($null, $invalidArgs)) $false 'DLL name containing a path segment'
        if (Test-Path -LiteralPath (Join-Path $targetDir 'subdir')) { throw 'Unexpected installation subdirectory.' }

        $key.SetValue('IsInitialized', 1)
        $key.SetValue('MainFont', 'custom-main.shx')
        $key.SetValue('BigFont', 'custom-big.shx')
        $key.SetValue('TrueTypeFont', 'custom-font')

        foreach ($oldId in @('20260708.1', '20260708.2', $null)) {
            if ($null -eq $oldId) {
                $key.DeleteValue('PluginBuildId')
            } else {
                $key.SetValue('PluginBuildId', $oldId)
            }

            Assert-Equal ($scan.Invoke($null, $scanArgs).Status.ToString()) 'InstalledCurrent' "Same version ($oldId)"
            $result = $initialize.Invoke($null, @($profileKey, $installedDll))
            Assert-Equal ($result.State.ToString()) 'NormalRun' "Same-version startup ($oldId)"
            Assert-Equal ($key.GetValue('PluginBuildId')) $oldId "Legacy value after startup ($oldId)"
        }

        $oldVersion = if ($version -ceq '0.0.0') { '0.0.1' } else { '0.0.0' }
        $key.SetValue('PluginVersion', $oldVersion)
        Assert-Equal ($scan.Invoke($null, $scanArgs).Status.ToString()) 'InstalledOutdated' 'Different version'
        $result = $initialize.Invoke($null, @($profileKey, $installedDll))
        Assert-Equal ($result.State.ToString()) 'Updated' 'Version change at startup'
        Assert-Equal ($key.GetValue('PluginVersion')) $version 'Version after startup'
        Assert-Equal ($key.GetValue('ConfigSchemaVersion')) $schema 'Schema after startup'
        Assert-Equal ($key.GetValue('IsInitialized')) 1 'Initialized marker after startup'
        Assert-Equal ($key.GetValue('MainFont')) 'custom-main.shx' 'Custom main font'
        Assert-Equal ($key.GetValue('BigFont')) 'custom-big.shx' 'Custom big font'
        Assert-Equal ($key.GetValue('TrueTypeFont')) 'custom-font' 'Custom TrueType font'

        $key.SetValue('LOADER', (Join-Path $targetDir 'missing.dll'))
        Assert-Equal ($scan.Invoke($null, $scanArgs).Status.ToString()) 'DllMissing' 'Missing DLL'
        $key.DeleteValue('LOADER')
        Assert-Equal ($scan.Invoke($null, $scanArgs).Status.ToString()) 'DllMissing' 'Missing LOADER'
    } finally {
        $key.Dispose()
    }
} finally {
    $registry.DeleteSubKeyTree($baseKey, $false)
    if (Test-Path -LiteralPath $targetDir) {
        Remove-Item -LiteralPath (Join-Path $targetDir 'AFR-ACAD2027.dll') -Force -ErrorAction SilentlyContinue
        [IO.Directory]::Delete($targetDir)
    }
}

Write-Output 'Deployment version regression passed.'
