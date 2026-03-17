using Microsoft.EntityFrameworkCore;
using Whataline.Core.Entities;

namespace Whataline.Infrastructure.Data;

public class WhatalineDbContext : DbContext
{
    public WhatalineDbContext(DbContextOptions<WhatalineDbContext> options)
        : base(options) { }

    public DbSet<WritingProject> WritingProjects => Set<WritingProject>();
    public DbSet<FilmProject> FilmProjects => Set<FilmProject>();
    public DbSet<Award> Awards => Set<Award>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ServiceSample> ServiceSamples => Set<ServiceSample>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<ContactSubmission> ContactSubmissions => Set<ContactSubmission>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // WritingProject
        modelBuilder.Entity<WritingProject>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).IsRequired().HasMaxLength(300);
            e.Property(x => x.Status).HasMaxLength(20).HasDefaultValue("draft");
            e.HasMany(x => x.Awards)
             .WithOne(a => a.WritingProject)
             .HasForeignKey(a => a.WritingProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // FilmProject
        modelBuilder.Entity<FilmProject>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).IsRequired().HasMaxLength(300);
            e.Property(x => x.Status).HasMaxLength(20).HasDefaultValue("draft");
            e.HasMany(x => x.Awards)
             .WithOne(a => a.FilmProject)
             .HasForeignKey(a => a.FilmProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Award — at least one FK must be set
        modelBuilder.Entity<Award>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(300);
        });

        // Service
        modelBuilder.Entity<Service>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).IsRequired().HasMaxLength(300);
            e.HasMany(x => x.Samples)
             .WithOne(s => s.Service)
             .HasForeignKey(s => s.ServiceId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Testimonial
        modelBuilder.Entity<Testimonial>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.QuoteText).IsRequired().HasMaxLength(2000);
            e.Property(x => x.AttributeName).IsRequired().HasMaxLength(200);
        });

        // ContactSubmission
        modelBuilder.Entity<ContactSubmission>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.Property(x => x.Email).IsRequired().HasMaxLength(300);
            e.Property(x => x.Message).IsRequired().HasMaxLength(5000);
        });

        // AdminUser
        modelBuilder.Entity<AdminUser>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Username).IsRequired().HasMaxLength(100);
            e.HasIndex(x => x.Username).IsUnique();
        });
    }
}
