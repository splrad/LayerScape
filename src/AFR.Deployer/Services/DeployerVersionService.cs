using System.Reflection;

namespace AFR.Deployer.Services;

/// <summary>提供部署工具的正式版本，用于界面显示、部署状态和升级检查。</summary>
internal static class DeployerVersionService
{
    private static readonly string Version = typeof(DeployerVersionService).Assembly
        .GetCustomAttribute<AssemblyInformationalVersionAttribute>()!.InformationalVersion;

    internal static string GetDisplayVersion() => Version;
}
