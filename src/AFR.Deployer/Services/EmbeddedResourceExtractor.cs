using System.IO;
using System.Reflection;

namespace AFR.Deployer.Services;

/// <summary>
/// 从 EXE 程序集的嵌入资源中提取插件 DLL 文件到目标目录。
/// </summary>
internal static class EmbeddedResourceExtractor
{
    internal static Stream? OpenRead(string resourceKey) =>
        Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceKey);

    /// <summary>
    /// 将已校验的嵌入 DLL 复制到目标目录。
    /// <para>
    /// 若目标文件已存在则覆盖（更新场景）。
    /// </para>
    /// </summary>
    /// <param name="stream">嵌入资源流。</param>
    /// <param name="targetDirectory">目标目录路径，不存在时会自动创建。</param>
    /// <param name="fileName">释放后的文件名（如 "AFR-ACAD2025.dll"）。</param>
    /// <param name="errorMessage">失败时的原因描述，成功时为 null。</param>
    /// <returns>true 表示提取成功；false 表示失败。</returns>
    internal static bool TryExtract(
        Stream stream,
        string targetDirectory,
        string fileName,
        out string? errorMessage)
    {
        try
        {
            stream.Position = 0;
            Directory.CreateDirectory(targetDirectory);
            var targetPath = Path.Combine(targetDirectory, fileName);

            using var fs = new FileStream(targetPath, FileMode.Create, FileAccess.Write, FileShare.None);
            stream.CopyTo(fs);

            errorMessage = null;
            return true;
        }
        catch (Exception ex)
        {
            errorMessage = $"写入文件失败：{ex.Message}";
            return false;
        }
    }
}
