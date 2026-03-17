namespace Whataline.Core.Entities;

public class Award
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;  // e.g. "AWG Nominated 2023"
    public string? Category { get; set; }
    public int? Year { get; set; }

    // Polymorphic — belongs to either a WritingProject or a FilmProject
    public int? WritingProjectId { get; set; }
    public WritingProject? WritingProject { get; set; }

    public int? FilmProjectId { get; set; }
    public FilmProject? FilmProject { get; set; }
}
