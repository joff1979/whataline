namespace Whataline.Core.Entities;

public class WritingProject
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Logline { get; set; } = string.Empty;
    public string? PosterUrl { get; set; }
    public string? Genre { get; set; }
    public string? Format { get; set; }      // e.g. Feature, Short, Series
    public string? ScriptUrl { get; set; }
    public string Status { get; set; } = "draft"; // draft | published
    public bool Featured { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Award> Awards { get; set; } = new List<Award>();
}
