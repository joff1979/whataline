using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Whataline.Infrastructure.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AdminUsers",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Username = table.Column<string>(maxLength: 100, nullable: false),
                PasswordHash = table.Column<string>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()")
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AdminUsers", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "FilmProjects",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Title = table.Column<string>(maxLength: 300, nullable: false),
                Logline = table.Column<string>(nullable: false),
                PosterUrl = table.Column<string>(nullable: true),
                Genre = table.Column<string>(nullable: true),
                Format = table.Column<string>(nullable: true),
                Year = table.Column<int>(nullable: true),
                TrailerUrl = table.Column<string>(nullable: true),
                FilmUrl = table.Column<string>(nullable: true),
                Status = table.Column<string>(maxLength: 20, nullable: false, defaultValue: "draft"),
                Featured = table.Column<bool>(nullable: false),
                SortOrder = table.Column<int>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_FilmProjects", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "WritingProjects",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Title = table.Column<string>(maxLength: 300, nullable: false),
                Logline = table.Column<string>(nullable: false),
                PosterUrl = table.Column<string>(nullable: true),
                Genre = table.Column<string>(nullable: true),
                Format = table.Column<string>(nullable: true),
                ScriptUrl = table.Column<string>(nullable: true),
                Status = table.Column<string>(maxLength: 20, nullable: false, defaultValue: "draft"),
                Featured = table.Column<bool>(nullable: false),
                SortOrder = table.Column<int>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_WritingProjects", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Services",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Title = table.Column<string>(maxLength: 300, nullable: false),
                Description = table.Column<string>(nullable: false),
                SortOrder = table.Column<int>(nullable: false),
                Published = table.Column<bool>(nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(nullable: false),
                UpdatedAt = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Services", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Testimonials",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                QuoteText = table.Column<string>(maxLength: 2000, nullable: false),
                AttributeName = table.Column<string>(maxLength: 200, nullable: false),
                AttributeTitle = table.Column<string>(nullable: true),
                Organisation = table.Column<string>(nullable: true),
                SortOrder = table.Column<int>(nullable: false),
                Published = table.Column<bool>(nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Testimonials", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "ContactSubmissions",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(maxLength: 200, nullable: false),
                Email = table.Column<string>(maxLength: 300, nullable: false),
                Subject = table.Column<string>(nullable: true),
                Message = table.Column<string>(maxLength: 5000, nullable: false),
                IsRead = table.Column<bool>(nullable: false),
                CreatedAt = table.Column<DateTime>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ContactSubmissions", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Awards",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Name = table.Column<string>(maxLength: 300, nullable: false),
                Category = table.Column<string>(nullable: true),
                Year = table.Column<int>(nullable: true),
                WritingProjectId = table.Column<int>(nullable: true),
                FilmProjectId = table.Column<int>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Awards", x => x.Id);
                table.ForeignKey(
                    name: "FK_Awards_WritingProjects_WritingProjectId",
                    column: x => x.WritingProjectId,
                    principalTable: "WritingProjects",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Awards_FilmProjects_FilmProjectId",
                    column: x => x.FilmProjectId,
                    principalTable: "FilmProjects",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "ServiceSamples",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                Title = table.Column<string>(nullable: false),
                Description = table.Column<string>(nullable: true),
                FileUrl = table.Column<string>(nullable: true),
                SortOrder = table.Column<int>(nullable: false),
                ServiceId = table.Column<int>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ServiceSamples", x => x.Id);
                table.ForeignKey(
                    name: "FK_ServiceSamples_Services_ServiceId",
                    column: x => x.ServiceId,
                    principalTable: "Services",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        // Indexes
        migrationBuilder.CreateIndex("IX_AdminUsers_Username", "AdminUsers", "Username", unique: true);
        migrationBuilder.CreateIndex("IX_Awards_WritingProjectId", "Awards", "WritingProjectId");
        migrationBuilder.CreateIndex("IX_Awards_FilmProjectId", "Awards", "FilmProjectId");
        migrationBuilder.CreateIndex("IX_ServiceSamples_ServiceId", "ServiceSamples", "ServiceId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("Awards");
        migrationBuilder.DropTable("ServiceSamples");
        migrationBuilder.DropTable("WritingProjects");
        migrationBuilder.DropTable("FilmProjects");
        migrationBuilder.DropTable("Services");
        migrationBuilder.DropTable("Testimonials");
        migrationBuilder.DropTable("ContactSubmissions");
        migrationBuilder.DropTable("AdminUsers");
    }
}
