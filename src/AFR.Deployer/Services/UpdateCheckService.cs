using System.Net.Http;
using System.Net.Http.Headers;
using System.IO;
using System.Text.RegularExpressions;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AFR.Deployer.Services;

/// <summary>
/// 部署器侧更新检查服务。
/// <para>
/// 通过 GitHub / Gitee 发行版接口获取项目最新发行版，并与本地部署器显示版本（X.Y.Z）比较。
/// 网络异常、限流或版本格式异常均静默视为无可用更新，避免影响部署器启动与安装 / 卸载流程。
/// </para>
/// </summary>
internal static class UpdateCheckService
{
    private const string GitHubLatestReleaseApiUrl = "https://api.github.com/repos/splrad/LayerScape/releases/latest";
    private const string GiteeLatestReleaseApiUrl = "https://gitee.com/api/v5/repos/splrad/CADFontAutoReplace/releases/latest";
    internal const string ReleasesPageUrl = "https://github.com/splrad/LayerScape/releases";
    internal const string GiteeReleasesPageUrl = "https://gitee.com/splrad/CADFontAutoReplace/releases";

    internal static readonly TimeSpan PerAttemptTimeout = TimeSpan.FromSeconds(4);

    /// <summary>检查指定发布源的最新发行版是否高于本地部署器版本。</summary>
    internal static async Task<UpdateCheckResult> CheckAsync(UpdateCheckSource source, CancellationToken cancellationToken = default)
    {
        using var http = new HttpClient { Timeout = Timeout.InfiniteTimeSpan };
        return await CheckAsync(source, http, DeployerVersionService.GetDisplayVersion(), cancellationToken);
    }

    internal static async Task<UpdateCheckResult> CheckAsync(UpdateCheckSource source, HttpClient http, string localVersionText, CancellationToken cancellationToken = default)
    {
        try
        {
            using var timeout = new CancellationTokenSource(PerAttemptTimeout);
            using var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeout.Token);
            using var request = new HttpRequestMessage(HttpMethod.Get, GetLatestReleaseApiUrl(source));
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("AFR-Deployer", DeployerVersionService.GetDisplayVersion()));
            if (source == UpdateCheckSource.GitHub)
            {
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
                request.Headers.TryAddWithoutValidation("X-GitHub-Api-Version", "2022-11-28");
            }
            else
            {
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            }

            using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, linked.Token);
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return UpdateCheckResult.ReachableNoUpdate(source);
            if (!response.IsSuccessStatusCode) return UpdateCheckResult.Unreachable(source);

            var release = JsonSerializer.Deserialize<ReleaseDto>(await ReadBoundedAsync(response, 4 * 1024 * 1024, linked.Token));
            if (release is null) return UpdateCheckResult.Unreachable(source);
            if (release.Draft || release.Prerelease) return UpdateCheckResult.ReachableNoUpdate(source);

            var latestVersionText = NormalizeTag(release.TagName);
            if (!TryParseVersion(latestVersionText, out var latestVersion) ||
                !TryParseVersion(localVersionText, out var localVersion))
            {
                return UpdateCheckResult.Unreachable(source);
            }

            if (latestVersion <= localVersion) return UpdateCheckResult.ReachableNoUpdate(source);

            var required = RequiredAssets(latestVersionText);
            if (release.Assets is null || required.Any(name => release.Assets.Count(asset => asset.Name == name) != 1))
                return UpdateCheckResult.ReachableNoUpdate(source);
            var asset = release.Assets.Single(asset => asset.Name == "artifact-manifest.json");
            if (!SafeAssetUrl(asset.BrowserDownloadUrl, source, release.TagName!)) return UpdateCheckResult.ReachableNoUpdate(source);
            using var manifestResponse = await http.GetAsync(asset.BrowserDownloadUrl, HttpCompletionOption.ResponseHeadersRead, linked.Token);
            if (!manifestResponse.IsSuccessStatusCode) return UpdateCheckResult.ReachableNoUpdate(source);
            var manifest = await ReadBoundedAsync(manifestResponse, 1024 * 1024, linked.Token);
            if (!AdmitsManifest(manifest, latestVersionText, release.TagName!)) return UpdateCheckResult.ReachableNoUpdate(source);

            var releaseUrl = GetReleasesPageUrl(source) + "/tag/" + Uri.EscapeDataString(release.TagName!);
            return new UpdateCheckResult(true, true, source, latestVersionText, releaseUrl, release.Name);
        }
        catch
        {
            return UpdateCheckResult.Unreachable(source);
        }
    }

    private static async Task<byte[]> ReadBoundedAsync(HttpResponseMessage response, int maximum, CancellationToken token)
    {
        if (response.Content.Headers.ContentLength > maximum) throw new InvalidDataException("Update response too large");
        await using var stream = await response.Content.ReadAsStreamAsync(token);
        using var output = new MemoryStream();
        var buffer = new byte[8192];
        int count;
        while ((count = await stream.ReadAsync(buffer, token)) > 0)
        {
            if (output.Length + count > maximum) throw new InvalidDataException("Update response too large");
            output.Write(buffer, 0, count);
        }
        return output.ToArray();
    }

    private static string[] RequiredAssets(string version) =>
        [$"AFR-Deployer_v{version}.exe", $"AFR-DLL_v{version}.zip", "Fonts.zip", "sbom.spdx.json", "release-notes.md", "artifact-manifest.json", "SHA256SUMS"];

    private static bool SafeAssetUrl(string? value, UpdateCheckSource source, string tag)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var url) || url.Scheme != "https" || !url.IsDefaultPort
            || url.UserInfo.Length != 0 || url.Fragment.Length != 0 || url.Query.Length != 0) return false;
        var prefix = source == UpdateCheckSource.GitHub ? "https://github.com/splrad/LayerScape/" : "https://gitee.com/splrad/CADFontAutoReplace/";
        // Gitee's asset URLs are supplied by its native API; its download path differs from GitHub.
        return source == UpdateCheckSource.GitHub
            ? value == prefix + "releases/download/" + Uri.EscapeDataString(tag) + "/artifact-manifest.json"
            : url.AbsoluteUri.StartsWith(prefix + "releases/", StringComparison.Ordinal);
    }

    internal static bool AdmitsManifest(byte[] bytes, string version, string tag)
    {
        try
        {
            using var document = JsonDocument.Parse(bytes);
            var root = document.RootElement;
            if (root.GetProperty("schemaVersion").GetInt32() != 3 || root.GetProperty("repositoryId").GetInt64() != 1187527897
                || root.GetProperty("fullName").GetString() != "splrad/LayerScape" || root.GetProperty("unitId").GetString() != "layerscape"
                || root.GetProperty("version").GetString() != version || root.GetProperty("packageVersion").GetString() != version
                || tag != "v" + version || root.GetProperty("tag").GetString() != tag) return false;
            var source = root.GetProperty("sourceSha").GetString() ?? "";
            var cycle = root.GetProperty("cycleId").GetString() ?? "";
            if (!Regex.IsMatch(source, "\\A[a-f0-9]{40}\\z") || !Regex.IsMatch(cycle, "\\Apr-[1-9][0-9]*-" + source + "\\z")
                || root.GetProperty("buildRef").GetString() != "refs/heads/steward/build/" + cycle
                || !Regex.IsMatch(root.GetProperty("controllerSha").GetString() ?? "", "\\A[a-f0-9]{40}\\z")
                || root.GetProperty("runId").GetInt64() < 1 || root.GetProperty("attempt").GetInt32() < 1) return false;
            foreach (var key in new[] { "requestKey", "deliverySha256", "templateSha256" })
                if (!Regex.IsMatch(root.GetProperty(key).GetString() ?? "", "\\A[a-f0-9]{64}\\z")) return false;
            var required = RequiredAssets(version);
            return MatchesFiles(root.GetProperty("artifacts"), required.Take(3).ToArray())
                && MatchesFiles(root.GetProperty("evidence"), required.Skip(3).Take(2).ToArray());
        }
        catch (Exception error) when (error is JsonException or InvalidOperationException or KeyNotFoundException or FormatException or OverflowException)
        {
            return false;
        }
    }

    private static bool MatchesFiles(JsonElement entries, string[] names)
    {
        var files = entries.EnumerateArray().ToArray();
        return files.Length == names.Length && names.All(name => files.Count(file => file.GetProperty("path").GetString() == name) == 1)
            && files.All(file => file.GetProperty("size").GetInt64() > 0
                && Regex.IsMatch(file.GetProperty("sha256").GetString() ?? "", "\\A[a-f0-9]{64}\\z"));
    }

    private static string GetLatestReleaseApiUrl(UpdateCheckSource source) => source switch
    {
        UpdateCheckSource.Gitee => GiteeLatestReleaseApiUrl,
        _ => GitHubLatestReleaseApiUrl,
    };

    private static string GetReleasesPageUrl(UpdateCheckSource source) => source switch
    {
        UpdateCheckSource.Gitee => GiteeReleasesPageUrl,
        _ => ReleasesPageUrl,
    };

    private static string NormalizeTag(string? tagName)
    {
        if (string.IsNullOrWhiteSpace(tagName)) return string.Empty;
        return tagName.StartsWith('v') || tagName.StartsWith('V')
            ? tagName[1..]
            : tagName;
    }

    private static bool TryParseVersion(string text, out Version version)
        => Version.TryParse(text, out version!) && version.Build >= 0 && version.Revision < 0;

    private sealed class ReleaseDto
    {
        [JsonPropertyName("tag_name")]
        public string? TagName { get; set; }

        [JsonPropertyName("html_url")]
        public string? HtmlUrl { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("draft")]
        public bool Draft { get; set; }

        [JsonPropertyName("prerelease")]
        public bool Prerelease { get; set; }

        [JsonPropertyName("assets")]
        public List<AssetDto>? Assets { get; set; }
    }

    private sealed class AssetDto
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }
        [JsonPropertyName("browser_download_url")]
        public string? BrowserDownloadUrl { get; set; }
    }
}

/// <summary>部署器更新检查的发布源。</summary>
internal enum UpdateCheckSource
{
    /// <summary>GitHub 官方仓库。</summary>
    GitHub,

    /// <summary>Gitee 国内镜像仓库。</summary>
    Gitee,
}

/// <summary>部署器更新检查结果。</summary>
/// <param name="HasUpdate">是否存在比本地版本更新的正式发行版。</param>
/// <param name="IsReachable">发布源是否已成功联通并返回可解析的正式版本信息。</param>
/// <param name="Source">返回结果的发布源。</param>
/// <param name="LatestVersion">最新发行版显示版本（X.Y.Z）。</param>
/// <param name="ReleaseUrl">用于打开浏览器的发行版页面地址。</param>
/// <param name="ReleaseName">GitHub Release 标题。</param>
internal sealed record UpdateCheckResult(
    bool HasUpdate,
    bool IsReachable,
    UpdateCheckSource Source,
    string LatestVersion,
    string ReleaseUrl,
    string? ReleaseName)
{
    /// <summary>无可用更新或检查失败时的空结果。</summary>
    internal static readonly UpdateCheckResult NoUpdate = Unreachable(UpdateCheckSource.GitHub);

    /// <summary>发布源成功联通但未发现新版本。</summary>
    internal static UpdateCheckResult ReachableNoUpdate(UpdateCheckSource source) =>
        new(false, true, source, string.Empty, GetFallbackReleaseUrl(source), null);

    /// <summary>发布源不可用或返回内容不可解析。</summary>
    internal static UpdateCheckResult Unreachable(UpdateCheckSource source) =>
        new(false, false, source, string.Empty, GetFallbackReleaseUrl(source), null);

    private static string GetFallbackReleaseUrl(UpdateCheckSource source) => source switch
    {
        UpdateCheckSource.Gitee => UpdateCheckService.GiteeReleasesPageUrl,
        _ => UpdateCheckService.ReleasesPageUrl,
    };
}
