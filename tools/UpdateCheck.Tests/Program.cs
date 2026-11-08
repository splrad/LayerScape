using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using AFR.Deployer.Services;

var cases = new[] { "valid-github", "valid-gitee", "legacy-gitee", "extra-assets", "missing-asset", "duplicate-asset", "wrong-repo", "wrong-id", "wrong-unit", "wrong-tag", "wrong-version", "unsupported-schema", "missing-digest", "draft", "prerelease", "future-major", "old-client", "unsafe-asset", "unreachable", "no-release", "manifest-forbidden", "manifest-rate-limited", "manifest-server-error" };
foreach (var scenario in cases)
{
    var source = scenario.Contains("gitee") ? UpdateCheckSource.Gitee : UpdateCheckSource.GitHub;
    var version = scenario == "future-major" ? "10.0.0" : "1.0.0";
    var local = scenario == "old-client" ? "9.2.2" : "0.9.0";
    var names = new[] { $"AFR-Deployer_v{version}.exe", $"AFR-DLL_v{version}.zip", "Fonts.zip", "sbom.spdx.json", "release-notes.md", "artifact-manifest.json", "SHA256SUMS" };
    var assetPrefix = source == UpdateCheckSource.GitHub ? "https://github.com/splrad/LayerScape/releases/download/" : "https://gitee.com/splrad/CADFontAutoReplace/releases/download/";
    var assets = names.Select(name => new { name, browser_download_url = assetPrefix + "v" + version + "/" + name }).ToList();
    if (scenario == "extra-assets") assets.Add(new { name = "Source code.zip", browser_download_url = "https://github.com/splrad/LayerScape/archive/v1.0.0.zip" });
    if (scenario == "legacy-gitee") { assets.Clear(); version = "9.2.0"; }
    if (scenario == "missing-asset") assets.RemoveAt(1);
    if (scenario == "duplicate-asset") assets.Add(assets[0]);
    if (scenario == "unsafe-asset") assets[5] = new { name = "artifact-manifest.json", browser_download_url = "http://localhost/private" };
    var release = JsonSerializer.Serialize(new { tag_name = "v" + version, name = "Release", draft = scenario == "draft", prerelease = scenario == "prerelease", assets });
    if (scenario == "valid-gitee") { var nativeGitee = JsonNode.Parse(release)!.AsObject(); nativeGitee.Remove("draft"); release = nativeGitee.ToJsonString(); }
    var S = new string('a', 40);
    var manifest = JsonSerializer.SerializeToNode(new {
        schemaVersion = 3, repositoryId = 1187527897, fullName = "splrad/LayerScape", unitId = "layerscape", version, packageVersion = version, tag = "v" + version,
        sourceSha = S, controllerSha = new string('b', 40), cycleId = "pr-1-" + S, buildRef = "refs/heads/steward/build/pr-1-" + S,
        requestKey = new string('c', 64), deliverySha256 = new string('d', 64), templateSha256 = new string('e', 64), runId = 1, attempt = 1,
        artifacts = names.Take(3).Select(path => new { path, size = 1, sha256 = new string('f', 64) }),
        evidence = names.Skip(3).Take(2).Select(path => new { path, size = 1, sha256 = new string('f', 64) })
    })!.AsObject();
    if (scenario == "wrong-repo") manifest["fullName"] = "other/LayerScape";
    if (scenario == "wrong-id") manifest["repositoryId"] = 1;
    if (scenario == "wrong-unit") manifest["unitId"] = "other";
    if (scenario == "wrong-tag") manifest["tag"] = "v2.0.0";
    if (scenario == "wrong-version") manifest["version"] = "2.0.0";
    if (scenario == "unsupported-schema") manifest["schemaVersion"] = 4;
    if (scenario == "missing-digest") manifest["artifacts"]![0]!.AsObject().Remove("sha256");
    var requests = new List<string>();
    using var handler = new FixtureHandler(request => {
        var url = request.RequestUri!.AbsoluteUri; requests.Add(url);
        if (url.EndsWith("/releases/latest")) {
            var expected = source == UpdateCheckSource.GitHub ? "https://api.github.com/repos/splrad/LayerScape/releases/latest" : "https://gitee.com/api/v5/repos/splrad/CADFontAutoReplace/releases/latest";
            Require(url == expected, scenario + " canonical API");
            return Response(scenario == "unreachable" ? HttpStatusCode.ServiceUnavailable : scenario == "no-release" ? HttpStatusCode.NotFound : HttpStatusCode.OK, release);
        }
        Require(url.EndsWith("/artifact-manifest.json"), "startup downloaded a business asset");
        var manifestStatus = scenario switch {
            "manifest-forbidden" => HttpStatusCode.Forbidden,
            "manifest-rate-limited" => HttpStatusCode.TooManyRequests,
            "manifest-server-error" => HttpStatusCode.ServiceUnavailable,
            _ => HttpStatusCode.OK
        };
        return Response(manifestStatus, manifest.ToJsonString());
    });
    using var http = new HttpClient(handler);
    var result = await UpdateCheckService.CheckAsync(source, http, local);
    var expectedUpdate = scenario is "valid-github" or "valid-gitee" or "extra-assets" or "future-major";
    Require(result.HasUpdate == expectedUpdate, scenario + " admission");
    var sourceUnavailable = scenario == "unreachable" || scenario.StartsWith("manifest-", StringComparison.Ordinal);
    Require(result.IsReachable == !sourceUnavailable, scenario + " reachability");
    Require(requests.Count <= 2, scenario + " bounded startup requests");
    if (expectedUpdate) { Require(requests.Count == 2, scenario + " manifest read"); Require(result.ReleaseUrl.EndsWith("/tag/v" + version), scenario + " release URL"); }
    Console.WriteLine("PASS " + scenario);
}
Console.WriteLine($"Update check: {cases.Length} offline HTTP cases passed.");
static void Require(bool condition, string message) { if (!condition) throw new InvalidOperationException(message); }
static HttpResponseMessage Response(HttpStatusCode status, string body) => new(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
sealed class FixtureHandler(Func<HttpRequestMessage, HttpResponseMessage> response) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => Task.FromResult(response(request));
}
