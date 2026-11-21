using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using AFR.Deployer.Services;

const string latest = "https://api.github.com/repos/splrad/LayerScape/releases/latest";
const string pages = "https://github.com/splrad/LayerScape/releases";
var release = JsonNode.Parse(File.ReadAllText(Path.Join(AppContext.BaseDirectory, "Fixtures", "v1.0.0", "release.json")))!.AsObject();

await Check("formal release", release.ToJsonString(), "0.9.0", "1.0.0");
release.Remove("assets");
await Check("assets field absent", release.ToJsonString(), "0.9.0", "1.0.0");
release["assets"] = new JsonArray();
await Check("empty assets", release.ToJsonString(), "0.9.0", "1.0.0");
release["assets"] = JsonSerializer.SerializeToNode(new[] { new { name = "AFR-Deployer_v1.0.0.exe" }, new { name = "Fonts.zip" } });
await Check("two public files", release.ToJsonString(), "0.9.0", "1.0.0");
release["assets"]!.AsArray().Add(new JsonObject { ["name"] = "artifact-manifest.json", ["browser_download_url"] = "invalid" });
await Check("unusable manifest", release.ToJsonString(), "0.9.0", "1.0.0");
await Check("same version", release.ToJsonString(), "1.0.0");
await Check("older release", release.ToJsonString(), "1.0.1");
await Check("invalid local version", release.ToJsonString(), "unknown", reachable: false);
await Check("signed local version", release.ToJsonString(), "+0.9.0", reachable: false);

release["tag_name"] = "v10.0.0";
await Check("new major version", release.ToJsonString(), "9.2.2", "10.0.0");
foreach (var flag in new[] { "draft", "prerelease" })
{
    release[flag] = true;
    await Check(flag, release.ToJsonString(), "1.0.0");
    release[flag] = false;
}
var largeRelease = JsonSerializer.Serialize(new { assets = new[] { new { label = new string('a', 5 * 1024 * 1024) } }, tag_name = "V2.0.0" });
await Check("5 MiB of metadata before tag, omitted flags", largeRelease, "1.0.0", "2.0.0", tag: "V2.0.0");
const string minimalRelease = """{"tag_name":"v2.0.0"}""";
var exactLimit = minimalRelease.PadRight(UpdateCheckService.MaxResponseBytes);
await Check("stream exactly at limit", exactLimit, "1.0.0", "2.0.0", lengthKnown: false);
await Check("oversized declared length", exactLimit + " ", "1.0.0", reachable: false);
await Check("oversized stream after valid tag", exactLimit + " ", "1.0.0", reachable: false, lengthKnown: false);
var oversizedMetadata = new string('a', UpdateCheckService.MaxResponseBytes + 1024);
await Check("oversized stream before valid tag", "{\"body\":\"" + oversizedMetadata + "\",\"tag_name\":\"v2.0.0\"}",
    "1.0.0", reachable: false, lengthKnown: false);
await Check("unprefixed tag", """{"tag_name":"1.1.0"}""", "1.0.0", "1.1.0", tag: "1.1.0");
await Check("original numeric spelling", """{"tag_name":"v01.1.0"}""", "1.0.0", "01.1.0");
foreach (var tag in new[]
{
    "", "v1.1", "v1.1.0.0", "v1.1.0-beta.1", "v1.1.0+build",
    "v+2.0.0", "2.+0.0", "v2.0.-0", "v2.0.0 ", "v2. 0.0"
})
{
    release["tag_name"] = tag;
    await Check("invalid tag " + tag, release.ToJsonString(), "1.0.0", reachable: false);
}
await Check("missing release", "", "1.0.0", status: HttpStatusCode.NotFound);
await Check("GitHub unavailable", "", "1.0.0", reachable: false, status: HttpStatusCode.ServiceUnavailable);
await Check("invalid response", "{", "1.0.0", reachable: false);
await Check("redirect to old mirror", "", "1.0.0", reachable: false, status: HttpStatusCode.Redirect);

static async Task Check(string scenario, string body, string localVersion, string? expected = null,
    bool reachable = true, HttpStatusCode status = HttpStatusCode.OK, string? tag = null, bool lengthKnown = true)
{
    var requests = new List<string>();
    using var bodyStream = lengthKnown ? null : new UnknownLengthStream(Encoding.UTF8.GetBytes(body));
    using var client = new HttpClient(new FixtureHandler(request =>
    {
        requests.Add(request.RequestUri!.AbsoluteUri);
        var response = new HttpResponseMessage(status)
        {
            Content = bodyStream == null ? new StringContent(body, Encoding.UTF8, "application/json") : new StreamContent(bodyStream),
        };
        if (status == HttpStatusCode.Redirect)
            response.Headers.Location = new Uri("https://gitee.com/splrad/CADFontAutoReplace/releases/tag/v9.2.0");
        return response;
    }));
    var result = await UpdateCheckService.CheckAsync(client, localVersion);
    if (!requests.SequenceEqual([latest]) || result.IsReachable != reachable || result.HasUpdate != (expected != null)
        || result.LatestVersion != (expected ?? "") || result.ReleaseUrl != (expected == null ? pages : pages + "/tag/" + (tag ?? "v" + expected)))
        throw new InvalidOperationException($"{scenario}: {result}; requests: {string.Join(", ", requests)}");
    if (bodyStream?.BytesRead > UpdateCheckService.MaxResponseBytes + 1)
        throw new InvalidOperationException($"{scenario}: read {bodyStream.BytesRead} bytes past the limit");
    Console.WriteLine("PASS " + scenario);
}

sealed class UnknownLengthStream(byte[] bytes) : MemoryStream(bytes)
{
    public override bool CanSeek => false;
    public int BytesRead { get; private set; }

    public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var count = base.Read(buffer.Span);
        BytesRead += count;
        return ValueTask.FromResult(count);
    }
}

sealed class FixtureHandler(Func<HttpRequestMessage, HttpResponseMessage> response) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        => Task.FromResult(response(request));
}
