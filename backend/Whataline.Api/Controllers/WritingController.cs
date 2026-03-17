using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whataline.Core.Entities;
using Whataline.Infrastructure.Data;

namespace Whataline.Api.Controllers;

// ── Public endpoints ──────────────────────────────────────────────────────────

[ApiController]
[Route("api/writing")]
public class WritingController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public WritingController(WhatalineDbContext db) => _db = db;

    // GET /api/writing
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _db.WritingProjects
            .Where(p => p.Status == "published")
            .Include(p => p.Awards)
            .OrderBy(p => p.SortOrder)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return Ok(projects);
    }

    // GET /api/writing/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _db.WritingProjects
            .Include(p => p.Awards)
            .FirstOrDefaultAsync(p => p.Id == id && p.Status == "published");

        if (project is null) return NotFound();
        return Ok(MapToDto(project));
    }

    private static WritingProjectDto MapToDto(WritingProject p) => new(
        p.Id, p.Title, p.Logline, p.PosterUrl, p.Genre, p.Format,
        p.ScriptUrl, p.Status, p.Featured, p.SortOrder,
        p.Awards.Select(a => new AwardDto(a.Id, a.Name, a.Category, a.Year)).ToList()
    );
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin/writing")]
[Authorize]
public class AdminWritingController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public AdminWritingController(WhatalineDbContext db) => _db = db;

    // GET /api/admin/writing
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var projects = await _db.WritingProjects
            .Include(p => p.Awards)
            .OrderBy(p => p.SortOrder)
            .ToListAsync();

        return Ok(projects.Select(p => new WritingProjectDto(
            p.Id, p.Title, p.Logline, p.PosterUrl, p.Genre, p.Format,
            p.ScriptUrl, p.Status, p.Featured, p.SortOrder,
            p.Awards.Select(a => new AwardDto(a.Id, a.Name, a.Category, a.Year)).ToList()
        )));
    }

    // POST /api/admin/writing
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertWritingProjectRequest request)
    {
        var project = new WritingProject
        {
            Title = request.Title,
            Logline = request.Logline,
            PosterUrl = request.PosterUrl,
            Genre = request.Genre,
            Format = request.Format,
            ScriptUrl = request.ScriptUrl,
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

        _db.WritingProjects.Add(project);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), "writing", new { id = project.Id }, project.Id);
    }

    // PUT /api/admin/writing/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertWritingProjectRequest request)
    {
        var project = await _db.WritingProjects
            .Include(p => p.Awards)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null) return NotFound();

        project.Title = request.Title;
        project.Logline = request.Logline;
        project.PosterUrl = request.PosterUrl;
        project.Genre = request.Genre;
        project.Format = request.Format;
        project.ScriptUrl = request.ScriptUrl;
        project.Status = request.Status;
        project.Featured = request.Featured;
        project.SortOrder = request.SortOrder;
        project.UpdatedAt = DateTime.UtcNow;

        // Replace awards
        _db.Awards.RemoveRange(project.Awards);
        project.Awards = request.Awards.Select(a => new Award
        {
            Name = a.Name,
            Category = a.Category,
            Year = a.Year,
            WritingProjectId = id
        }).ToList();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/admin/writing/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await _db.WritingProjects.FindAsync(id);
        if (project is null) return NotFound();

        _db.WritingProjects.Remove(project);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/admin/writing/reorder — accepts [{id, sortOrder}]
    [HttpPatch("reorder")]
    public async Task<IActionResult> Reorder([FromBody] List<ReorderItem> items)
    {
        foreach (var item in items)
        {
            var project = await _db.WritingProjects.FindAsync(item.Id);
            if (project is not null) project.SortOrder = item.SortOrder;
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<IActionResult> GetById(int id)
    {
        var project = await _db.WritingProjects
            .Include(p => p.Awards)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (project is null) return NotFound();
        return Ok(project);
    }
}

// ── Upload endpoint ───────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminUploadController : ControllerBase
{
    private readonly IBlobStorageService _blob;
    private readonly IConfiguration _config;

    public AdminUploadController(IBlobStorageService blob, IConfiguration config)
    {
        _blob = blob;
        _config = config;
    }

    // POST /api/admin/upload
    [HttpPost("upload")]
    [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var container = _config["AZURE_BLOB_CONTAINER_MEDIA"] ?? "media";

        using var stream = file.OpenReadStream();
        var url = await _blob.UploadAsync(
            stream, file.FileName, file.ContentType, container);

        return Ok(new { url });
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record WritingProjectDto(
    int Id,
    string Title,
    string Logline,
    string? PosterUrl,
    string? Genre,
    string? Format,
    string? ScriptUrl,
    string Status,
    bool Featured,
    int SortOrder,
    IEnumerable<AwardDto> Awards
);

public record AwardDto(int Id, string Name, string? Category, int? Year);

public record UpsertWritingProjectRequest(
    string Title,
    string Logline,
    string? PosterUrl,
    string? Genre,
    string? Format,
    string? ScriptUrl,
    string Status,
    bool Featured,
    int SortOrder,
    List<AwardRequest> Awards
);

public record AwardRequest(string Name, string? Category, int? Year);

public record ReorderItem(int Id, int SortOrder);
