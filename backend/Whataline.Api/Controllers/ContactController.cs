using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whataline.Core.Entities;
using Whataline.Infrastructure.Data;
using Whataline.Infrastructure.Email;

namespace Whataline.Api.Controllers;

// ── Public endpoint ───────────────────────────────────────────────────────────

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly WhatalineDbContext _db;
    private readonly IEmailService _email;
    private readonly ILogger<ContactController> _logger;

    public ContactController(WhatalineDbContext db, IEmailService email, ILogger<ContactController> logger)
    {
        _db     = db;
        _email  = email;
        _logger = logger;
    }

    // POST /api/contact
    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] ContactSubmissionRequest request)
    {
        var submission = new ContactSubmission
        {
            Name    = request.Name,
            Email   = request.Email,
            Subject = request.Subject,
            Message = request.Message
        };

        _db.ContactSubmissions.Add(submission);
        await _db.SaveChangesAsync();

        // Fire notification — failure never surfaces to the visitor
        try
        {
            await _email.SendContactNotificationAsync(
                request.Name, request.Email, request.Subject, request.Message);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Contact notification email failed for submission {Id}", submission.Id);
        }

        return Ok(new { message = "Thank you — your message has been received." });
    }
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin/contact")]
[Authorize]
public class AdminContactController : ControllerBase
{
    private readonly WhatalineDbContext _db;

    public AdminContactController(WhatalineDbContext db) => _db = db;

    // GET /api/admin/contact
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var submissions = await _db.ContactSubmissions
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => MapToDto(c))
            .ToListAsync();

        return Ok(submissions);
    }

    // GET /api/admin/contact/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var submission = await _db.ContactSubmissions.FindAsync(id);
        if (submission is null) return NotFound();
        return Ok(MapToDto(submission));
    }

    // PATCH /api/admin/contact/{id}/read — mark as read
    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var submission = await _db.ContactSubmissions.FindAsync(id);
        if (submission is null) return NotFound();

        submission.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/admin/contact/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var submission = await _db.ContactSubmissions.FindAsync(id);
        if (submission is null) return NotFound();

        _db.ContactSubmissions.Remove(submission);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ContactSubmissionDto MapToDto(ContactSubmission c) => new(
        c.Id, c.Name, c.Email, c.Subject, c.Message, c.IsRead, c.CreatedAt
    );
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public record ContactSubmissionRequest(
    string Name,
    string Email,
    string? Subject,
    string Message
);

public record ContactSubmissionDto(
    int Id,
    string Name,
    string Email,
    string? Subject,
    string Message,
    bool IsRead,
    DateTime CreatedAt
);
