using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Whataline.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────────────────
var sqlConnection = builder.Configuration["AZURE_SQL_CONNECTION_STRING"]
    ?? builder.Configuration.GetConnectionString("AzureSql")
    ?? throw new InvalidOperationException(
        "AZURE_SQL_CONNECTION_STRING environment variable or ConnectionStrings:AzureSql is required.");

builder.Services.AddDbContext<WhatalineDbContext>(options =>
    options.UseSqlServer(sqlConnection));

// ── Blob Storage ──────────────────────────────────────────────────────────────
var blobConnection = builder.Configuration["AZURE_BLOB_CONNECTION_STRING"]
    ?? builder.Configuration["AzureBlob:ConnectionString"]
    ?? throw new InvalidOperationException(
        "AZURE_BLOB_CONNECTION_STRING environment variable is required.");

builder.Services.AddSingleton<IBlobStorageService>(
    new BlobStorageService(blobConnection));

// ── JWT Auth ──────────────────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["JWT_SECRET_KEY"]
    ?? builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException(
        "JWT_SECRET_KEY environment variable is required.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "whataline-api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "whataline-frontend";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ── MVC / Swagger ─────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ── Middleware pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Database migration + admin seed on startup ────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WhatalineDbContext>();
    db.Database.Migrate();
    await SeedAdminAsync(db, builder.Configuration);
}

app.Run();

// ── Admin seed helper ─────────────────────────────────────────────────────────
static async Task SeedAdminAsync(WhatalineDbContext db, IConfiguration config)
{
    var username = config["ADMIN_USERNAME"] ?? config["Admin:Username"] ?? "kat";
    if (await db.AdminUsers.AnyAsync(u => u.Username == username)) return;

    var password = config["ADMIN_INITIAL_PASSWORD"]
        ?? config["Admin:InitialPassword"]
        ?? throw new InvalidOperationException(
            "ADMIN_INITIAL_PASSWORD environment variable is required for first run.");

    db.AdminUsers.Add(new Whataline.Core.Entities.AdminUser
    {
        Username = username,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
    });
    await db.SaveChangesAsync();
}
