using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whataline.Core.Entities;
using Whataline.Infrastructure.Data;

namespace Whataline.Api.Controllers;

// ── Public endpoints ──────────────────────────────────────────────────────────

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public ServicesController(WhatalineDbContext db) => _db = db;

    // GET /api/services
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var services = await _db.Services
            .Where(s => s.Published)
            .Include(s => s.Samples)
            .OrderBy(s => s.SortOrder)
            .Select(s => MapToDto(s))
            .ToListAsync();

        return Ok(services);
    }

    // GET /api/services/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var service = await _db.Services
            .Include(s => s.Samples)
            .FirstOrDefaultAsync(s => s.Id == id && s.Published);

        if (service is null) return NotFound();
        return Ok(MapToDto(service));
    }

    private static ServiceDto MapToDto(Service s) => new(
        s.Id, s.Title, s.Description, s.SortOrder, s.Published,
        s.Samples.OrderBy(x => x.SortOrder)
                 .Select(x => new ServiceSampleDto(x.Id, x.Title, x.Description, x.FileUrl, x.SortOrder))
                 .ToList()
    );
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin/services")]
[Authorize]
public class AdminServicesController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public AdminServicesController(WhatalineDbContext db) => _db = db;

    // GET /api/admin/services
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var services = await _db.Services
            .Include(s => s.Samples)
            .OrderBy(s => s.SortOrder)
            .ToListAsync();

        return Ok(services.Select(MapToDto));
    }

    // POST /api/admin/services
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertServiceRequest request)
    {
        var service = new Service
        {
            Title = request.Title,
            Description = request.Description,
            SortOrder = request.SortOrder,
            Published = request.Published,
            Samples = request.Samples.Select((s, i) => new ServiceSample
            {
                Title = s.Title,
                Description = s.Description,
                FileUrl = s.FileUrl,
                SortOrder = i
            }).ToList()
        };

        _db.Services.Add(service);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), "services", new { id = service.Id }, service.Id);
    }

    // PUT /api/admin/services/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertServiceRequest request)
    {
        var service = await _db.Services
            .Include(s => s.Samples)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service is null) return NotFound();

        service.Title = request.Title;
        service.Description = request.Description;
        service.SortOrder = request.SortOrder;
        service.Published = request.Published;
        service.UpdatedAt = DateTime.UtcNow;

        _db.ServiceSamples.RemoveRange(service.Samples);
        service.Samples = request.Samples.Select((s, i) => new ServiceSample
        {
            Title = s.Title,
            Description = s.Description,
            FileUrl = s.FileUrl,
            SortOrder = i,
            ServiceId = id
        }).ToList();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/admin/services/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var service = await _db.Services.FindAsync(id);
        if (service is null) return NotFound();

        _db.Services.Remove(service);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/admin/services/reorder
    [HttpPatch("reorder")]
    public async Task<IActionResult> Reorder([FromBody] List<ReorderItem> items)
    {
        foreach (var item in items)
        {
            var service = await _db.Services.FindAsync(item.Id);
            if (service is not null) service.SortOrder = item.SortOrder;
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<IActionResult> GetById(int id)
    {
        var service = await _db.Services.Include(s => s.Samples).FirstOrDefaultAsync(s => s.Id == id);
        if (service is null) return NotFound();
        return Ok(service);
    }

    private static ServiceDto MapToDto(Service s) => new(
        s.Id, s.Title, s.Description, s.SortOrder, s.Published,
        s.Samples.OrderBy(x => x.SortOrder)
                 .Select(x => new ServiceSampleDto(x.Id, x.Title, x.Description, x.FileUrl, x.SortOrder))
                 .ToList()
    );
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record ServiceDto(
    int Id,
    string Title,
    string Description,
    int SortOrder,
    bool Published,
    IEnumerable<ServiceSampleDto> Samples
);

public record ServiceSampleDto(
    int Id,
    string Title,
    string? Description,
    string? FileUrl,
    int SortOrder
);

public record UpsertServiceRequest(
    string Title,
    string Description,
    int SortOrder,
    bool Published,
    List<UpsertServiceSampleRequest> Samples
);

public record UpsertServiceSampleRequest(
    string Title,
    string? Description,
    string? FileUrl
);
