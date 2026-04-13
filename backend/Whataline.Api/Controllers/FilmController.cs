using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whataline.Core.Entities;
using Whataline.Infrastructure.Data;

namespace Whataline.Api.Controllers;

// ── Public endpoints ──────────────────────────────────────────────────────────

[ApiController]
[Route("api/films")]
public class FilmController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public FilmController(WhatalineDbContext db) => _db = db;

    // GET /api/films
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _db.FilmProjects
            .Where(p => p.Status == "published")
            .Include(p => p.Awards)
            .OrderBy(p => p.SortOrder)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return Ok(projects);
    }

    // GET /api/films/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _db.FilmProjects
            .Include(p => p.Awards)
            .FirstOrDefaultAsync(p => p.Id == id && p.Status == "published");

        if (project is null) return NotFound();
        return Ok(MapToDto(project));
    }

    private static FilmProjectDto MapToDto(FilmProject p) => new(
        p.Id, p.Title, p.Logline, p.PosterUrl, p.Genre, p.Format,
        p.Year, p.TrailerUrl, p.FilmUrl, p.Status, p.Featured, p.SortOrder,
        p.Awards.Select(a => new AwardDto(a.Id, a.Name, a.Category, a.Year)).ToList()
    );
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin/films")]
[Authorize]
public class AdminFilmController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public AdminFilmController(WhatalineDbContext db) => _db = db;

    // GET /api/admin/films
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _db.FilmProjects
            .Include(p => p.Awards)
            .OrderBy(p => p.SortOrder)
            .ToListAsync();

        return Ok(projects.Select(MapToDto));
    }

    // POST /api/admin/films
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertFilmProjectRequest request)
    {
        var project = new FilmProject
        {
            Title = request.Title,
            Logline = request.Logline,
            PosterUrl = request.PosterUrl,
            Genre = request.Genre,
            Format = request.Format,
            Year = request.Year,
            TrailerUrl = request.TrailerUrl,
            FilmUrl = request.FilmUrl,
            Status = request.Status,
            Featured = request.Featured,
            SortOrder = request.SortOrder,
            Awards = request.Awards.Select(a => new Award
            {
                Name = a.Name,
                Category = a.Category,
                Year = a.Year
            }).ToList()
        };

        _db.FilmProjects.Add(project);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), "films", new { id = project.Id }, project.Id);
    }

    // PUT /api/admin/films/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertFilmProjectRequest request)
    {
        var project = await _db.FilmProjects
            .Include(p => p.Awards)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null) return NotFound();

        project.Title = request.Title;
        project.Logline = request.Logline;
        project.PosterUrl = request.PosterUrl;
        project.Genre = request.Genre;
        project.Format = request.Format;
        project.Year = request.Year;
        project.TrailerUrl = request.TrailerUrl;
        project.FilmUrl = request.FilmUrl;
        project.Status = request.Status;
        project.Featured = request.Featured;
        project.SortOrder = request.SortOrder;
        project.UpdatedAt = DateTime.UtcNow;

        _db.Awards.RemoveRange(project.Awards);
        project.Awards = request.Awards.Select(a => new Award
        {
            Name = a.Name,
            Category = a.Category,
            Year = a.Year,
            FilmProjectId = id
        }).ToList();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/admin/films/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await _db.FilmProjects.FindAsync(id);
        if (project is null) return NotFound();

        _db.FilmProjects.Remove(project);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/admin/films/reorder
    [HttpPatch("reorder")]
    public async Task<IActionResult> Reorder([FromBody] List<ReorderItem> items)
    {
        foreach (var item in items)
        {
            var project = await _db.FilmProjects.FindAsync(item.Id);
            if (project is not null) project.SortOrder = item.SortOrder;
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<IActionResult> GetById(int id)
    {
        var project = await _db.FilmProjects.Include(p => p.Awards).FirstOrDefaultAsync(p => p.Id == id);
        if (project is null) return NotFound();
        return Ok(project);
    }

    private static FilmProjectDto MapToDto(FilmProject p) => new(
        p.Id, p.Title, p.Logline, p.PosterUrl, p.Genre, p.Format,
        p.Year, p.TrailerUrl, p.FilmUrl, p.Status, p.Featured, p.SortOrder,
        p.Awards.Select(a => new AwardDto(a.Id, a.Name, a.Category, a.Year)).ToList()
    );
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record FilmProjectDto(
    int Id,
    string Title,
    string Logline,
    string? PosterUrl,
    string? Genre,
    string? Format,
    int? Year,
    string? TrailerUrl,
    string? FilmUrl,
    string Status,
    bool Featured,
    int SortOrder,
    IEnumerable<AwardDto> Awards
);

public record UpsertFilmProjectRequest(
    string Title,
    string Logline,
    string? PosterUrl,
    string? Genre,
    string? Format,
    int? Year,
    string? TrailerUrl,
    string? FilmUrl,
    string Status,
    bool Featured,
    int SortOrder,
    List<AwardRequest> Awards
);
