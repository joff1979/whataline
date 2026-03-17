using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Whataline.Infrastructure.Data;

public interface IBlobStorageService
{
    Task<string> UploadAsync(Stream content, string fileName, string contentType, string container);
    Task DeleteAsync(string blobUrl, string container);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _client;

    public BlobStorageService(string connectionString)
    {
        _client = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadAsync(
        Stream content, string fileName, string contentType, string container)
    {
        var containerClient = _client.GetBlobContainerClient(container);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var uniqueName = $"{Guid.NewGuid()}-{fileName}";
        var blob = containerClient.GetBlobClient(uniqueName);

        await blob.UploadAsync(content, new BlobHttpHeaders { ContentType = contentType });
        return blob.Uri.ToString();
    }

    public async Task DeleteAsync(string blobUrl, string container)
    {
        var uri = new Uri(blobUrl);
        var blobName = uri.Segments.Last();
        var containerClient = _client.GetBlobContainerClient(container);
        await containerClient.DeleteBlobIfExistsAsync(blobName);
    }
}
