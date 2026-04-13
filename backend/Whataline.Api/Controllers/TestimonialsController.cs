using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whataline.Core.Entities;
using Whataline.Infrastructure.Data;

namespace Whataline.Api.Controllers;

// ── Public endpoints ──────────────────────────────────────────────────────────

[ApiController]
[Route("api/testimonials")]
public class TestimonialsController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public TestimonialsController(WhatalineDbContext db) => _db = db;

    // GET /api/testimonials
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var testimonials = await _db.Testimonials
            .Where(t => t.Published)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        return Ok(testimonials.Select(t => new TestimonialDto(
            t.Id, t.QuoteText, t.AttributeName, t.AttributeTitle, t.Organisation,
            t.SortOrder, t.Published, t.CreatedAt
        )));
    }
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin/testimonials")]
[Authorize]
public class AdminTestimonialsController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public AdminTestimonialsController(WhatalineDbContext db) => _db = db;

    // GET /api/admin/testimonials
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var testimonials = await _db.Testimonials
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        return Ok(testimonials.Select(MapToDto));
    }

    // POST /api/admin/testimonials
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertTestimonialRequest request)
    {
        var testimonial = new Testimonial
        {
            QuoteText = request.QuoteText,
            AttributeName = request.AttributeName,
            AttributeTitle = request.AttributeTitle,
            Organisation = request.Organisation,
            SortOrder = request.SortOrder,
            Published = request.Published
        };

        _db.Testimonials.Add(testimonial);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = testimonial.Id }, testimonial.Id);
    }

    // GET /api/admin/testimonials/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var testimonial = await _db.Testimonials.FindAsync(id);
        if (testimonial is null) return NotFound();
        return Ok(MapToDto(testimonial));
    }

    // PUT /api/admin/testimonials/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpsertTestimonialRequest request)
    {
        var testimonial = await _db.Testimonials.FindAsync(id);
        if (testimonial is null) return NotFound();

        testimonial.QuoteText = request.QuoteText;
        testimonial.AttributeName = request.AttributeName;
        testimonial.AttributeTitle = request.AttributeTitle;
        testimonial.Organisation = request.Organisation;
        testimonial.SortOrder = request.SortOrder;
        testimonial.Published = request.Published;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/admin/testimonials/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var testimonial = await _db.Testimonials.FindAsync(id);
        if (testimonial is null) return NotFound();

        _db.Testimonials.Remove(testimonial);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH /api/admin/testimonials/reorder
    [HttpPatch("reorder")]
    public async Task<IActionResult> Reorder([FromBody] List<ReorderItem> items)
    {
        foreach (var item in items)
        {
            var testimonial = await _db.Testimonials.FindAsync(item.Id);
            if (testimonial is not null) testimonial.SortOrder = item.SortOrder;
        }
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static TestimonialDto MapToDto(Testimonial t) => new(
        t.Id, t.QuoteText, t.AttributeName, t.AttributeTitle, t.Organisation,
        t.SortOrder, t.Published, t.CreatedAt
    );
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record TestimonialDto(
    int Id,
    string QuoteText,
    string AttributeName,
    string? AttributeTitle,
    string? Organisation,
    int SortOrder,
    bool Published,
    DateTime CreatedAt
);

public record UpsertTestimonialRequest(
    string QuoteText,
    string AttributeName,
    string? AttributeTitle,
    string? Organisation,
    int SortOrder,
    bool Published
);
