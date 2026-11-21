using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AFR.Deployer.Services;

/// <summary>
/// 部署器侧更新检查服务。
/// <para>
/// 通过 GitHub 发行版接口获取项目最新发行版，并与本地部署器显示版本（X.Y.Z）比较。
/// 网络异常、限流或版本格式异常均静默视为无可用更新，避免影响部署器启动与安装 / 卸载流程。
/// </para>
/// </summary>
internal static class UpdateCheckService
{
    private const string GitHubLatestReleaseApiUrl = "https://api.github.com/repos/splrad/LayerScape/releases/latest";
    internal const string ReleasesPageUrl = "https://github.com/splrad/LayerScape/releases";

    internal static readonly TimeSpan PerAttemptTimeout = TimeSpan.FromSeconds(4);

    /// <summary>检查 GitHub 的最新发行版是否高于本地部署器版本。</summary>
    internal static async Task<UpdateCheckResult> CheckAsync(CancellationToken cancellationToken = default)
    {
        using var http = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false }) { Timeout = Timeout.InfiniteTimeSpan };
        return await CheckAsync(http, DeployerVersionService.GetDisplayVersion(), cancellationToken);
    }

    internal static async Task<UpdateCheckResult> CheckAsync(HttpClient http, string localVersionText, CancellationToken cancellationToken = default)
    {
        try
        {
            using var timeout = new CancellationTokenSource(PerAttemptTimeout);
            using var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeout.Token);
            using var request = new HttpRequestMessage(HttpMethod.Get, GitHubLatestReleaseApiUrl);
            request.Headers.UserAgent.Add(new ProductInfoHeaderValue("AFR-Deployer", DeployerVersionService.GetDisplayVersion()));
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
            request.Headers.TryAddWithoutValidation("X-GitHub-Api-Version", "2022-11-28");

            using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, linked.Token);
            if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return UpdateCheckResult.NoUpdate;
            if (!response.IsSuccessStatusCode) return UpdateCheckResult.Unavailable;

            await using var stream = await response.Content.ReadAsStreamAsync(linked.Token);
            var release = await JsonSerializer.DeserializeAsync<ReleaseDto>(stream, cancellationToken: linked.Token);
            if (release is null) return UpdateCheckResult.Unavailable;
            if (release.Draft || release.Prerelease) return UpdateCheckResult.NoUpdate;

            if (release.TagName is not { } tag) return UpdateCheckResult.Unavailable;
            var versionText = tag.StartsWith('v') || tag.StartsWith('V') ? tag[1..] : tag;
            if (!TryParseVersion(versionText, out var latestVersion) || !TryParseVersion(localVersionText, out var localVersion))
                return UpdateCheckResult.Unavailable;

            if (latestVersion <= localVersion) return UpdateCheckResult.NoUpdate;

            return new UpdateCheckResult(true, true, versionText, ReleasesPageUrl + "/tag/" + Uri.EscapeDataString(tag));
        }
        catch
        {
            return UpdateCheckResult.Unavailable;
        }
    }

    private static bool TryParseVersion(string text, out Version version)
        => Version.TryParse(text, out version!) && version.Build >= 0 && version.Revision < 0;

    private sealed class ReleaseDto
    {
        [JsonPropertyName("tag_name")]
        public string? TagName { get; set; }

        [JsonPropertyName("draft")]
        public bool Draft { get; set; }

        [JsonPropertyName("prerelease")]
        public bool Prerelease { get; set; }
    }
}

internal sealed record UpdateCheckResult(bool HasUpdate, bool IsReachable, string LatestVersion, string ReleaseUrl)
{
    internal static readonly UpdateCheckResult NoUpdate = new(false, true, string.Empty, UpdateCheckService.ReleasesPageUrl);
    internal static readonly UpdateCheckResult Unavailable = new(false, false, string.Empty, UpdateCheckService.ReleasesPageUrl);
}
