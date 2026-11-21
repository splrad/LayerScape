using System.Reflection;

namespace AFR.Services;

/// <summary>
/// 提供插件版本与配置架构版本信息。
/// <para>
/// 该服务用于注册表初始化阶段判断 DLL 是否已升级，以及默认配置是否需要迁移。
/// </para>
/// </summary>
public static class PluginVersionService
{
    /// <summary>当前注册表配置架构版本。</summary>
    public const int ConfigSchemaVersion = 2;

    private static readonly string Version = typeof(PluginVersionService).Assembly
        .GetCustomAttribute<AssemblyInformationalVersionAttribute>()!.InformationalVersion;

    /// <summary>获取当前插件 DLL 的正式版本。</summary>
    public static string GetPluginVersion() => Version;
}
