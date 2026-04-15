using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Logging;

namespace Whataline.Infrastructure.Email;

// ── Settings ──────────────────────────────────────────────────────────────────

public record EmailSettings(
    string SmtpHost,
    int    SmtpPort,
    string Username,
    string Password,
    string From,
    string To
);

// ── Interface ─────────────────────────────────────────────────────────────────

public interface IEmailService
{
    Task SendContactNotificationAsync(
        string senderName,
        string senderEmail,
        string? subject,
        string  message);
}

// ── Implementation ────────────────────────────────────────────────────────────

public sealed class SmtpEmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(EmailSettings settings, ILogger<SmtpEmailService> logger)
    {
        _settings = settings;
        _logger   = logger;
    }

    public async Task SendContactNotificationAsync(
        string senderName,
        string senderEmail,
        string? subject,
        string  message)
    {
        var displaySubject = string.IsNullOrWhiteSpace(subject)
            ? $"New message from {senderName}"
            : $"New message from {senderName}: {subject}";

        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(_settings.From));
        email.To.Add(MailboxAddress.Parse(_settings.To));
        email.ReplyTo.Add(new MailboxAddress(senderName, senderEmail));
        email.Subject = displaySubject;

        email.Body = new TextPart("html")
        {
            Text = BuildHtml(senderName, senderEmail, subject, message)
        };

        using var smtp = new SmtpClient();

        try
        {
            // Auto-negotiates TLS — works with port 587 (STARTTLS) and 465 (SSL)
            await smtp.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.Auto);
            await smtp.AuthenticateAsync(_settings.Username, _settings.Password);
            await smtp.SendAsync(email);
        }
        finally
        {
            await smtp.DisconnectAsync(true);
        }

        _logger.LogInformation("Contact notification sent to {To} for {SenderEmail}", _settings.To, senderEmail);
    }

    private static string BuildHtml(string name, string email, string? subject, string message)
    {
        var subjectRow = string.IsNullOrWhiteSpace(subject)
            ? string.Empty
            : $"<tr><td style='padding:4px 0;color:#7A9E9E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;'>Subject</td></tr>" +
              $"<tr><td style='padding:0 0 16px;font-size:15px;color:#172929;'>{HtmlEncode(subject)}</td></tr>";

        return $"""
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#F4EEEF;font-family:'DM Sans',system-ui,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EEEF;padding:40px 20px;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#FAF7F8;max-width:600px;width:100%;">

                    <!-- Header -->
                    <tr>
                      <td style="background:#172929;padding:32px 40px;">
                        <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#CDA099;">What A Line</p>
                        <h1 style="margin:8px 0 0;font-size:22px;font-weight:300;color:#FAF7F8;">New contact message</h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:32px 40px;">
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr><td style="padding:4px 0;color:#7A9E9E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">From</td></tr>
                          <tr><td style="padding:0 0 4px;font-size:16px;color:#172929;font-weight:500;">{HtmlEncode(name)}</td></tr>
                          <tr><td style="padding:0 0 16px;font-size:14px;color:#3D6B6B;">{HtmlEncode(email)}</td></tr>
                          {subjectRow}
                          <tr><td style="padding:4px 0;color:#7A9E9E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Message</td></tr>
                          <tr>
                            <td style="padding:12px 16px;background:#F4EEEF;border-left:3px solid #B8756A;font-size:15px;color:#172929;line-height:1.65;white-space:pre-wrap;">{HtmlEncode(message)}</td>
                          </tr>
                        </table>

                        <!-- Reply hint -->
                        <p style="margin:24px 0 0;font-size:13px;color:#7A9E9E;">
                          Hit <strong>Reply</strong> to respond directly to {HtmlEncode(name)} at {HtmlEncode(email)}.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 40px;border-top:1px solid #F0DCDA;">
                        <p style="margin:0;font-size:11px;color:#CDA099;letter-spacing:0.08em;">
                          whataline.com · admin inbox → /admin/contact
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
    }

    private static string HtmlEncode(string? s) =>
        System.Net.WebUtility.HtmlEncode(s ?? string.Empty);
}

// ── No-op fallback (email not configured) ────────────────────────────────────

public sealed class NullEmailService : IEmailService
{
    public Task SendContactNotificationAsync(
        string senderName, string senderEmail, string? subject, string message)
        => Task.CompletedTask;
}
