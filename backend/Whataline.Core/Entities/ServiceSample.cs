namespace Whataline.Core.Entities;

public class ServiceSample
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? FileUrl { get; set; }
    public int SortOrder { get; set; }

    public int ServiceId { get; set; }
    public Service Service { get; set; } = null!;
}
