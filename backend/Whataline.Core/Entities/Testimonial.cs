namespace Whataline.Core.Entities;

public class Testimonial
{
    public int Id { get; set; }
    public string QuoteText { get; set; } = string.Empty;
    public string AttributeName { get; set; } = string.Empty;
    public string? AttributeTitle { get; set; }
    public string? Organisation { get; set; }
    public int SortOrder { get; set; }
    public bool Published { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
