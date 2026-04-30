using Microsoft.EntityFrameworkCore;
using Observatorio.Domain.Entities;

namespace Observatorio.Infrastructure.Data;

public class ObservatorioDbContext : DbContext
{
    public ObservatorioDbContext(DbContextOptions<ObservatorioDbContext> options) 
        : base(options) { }
    
    public DbSet<User> Users { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("usuarios");
        
        modelBuilder.Entity<User>().Property(u => u.Id)
            .HasColumnName("id_usuario")
            .ValueGeneratedOnAdd();
        
        modelBuilder.Entity<User>().Property(u => u.Name)
            .HasColumnName("nombre");
        
        modelBuilder.Entity<User>().Property(u => u.Email)
            .HasColumnName("email")
            .IsRequired();
        
        modelBuilder.Entity<User>().Property(u => u.PasswordHash)
            .HasColumnName("password_hash");
        
        modelBuilder.Entity<User>().Property(u => u.CreatedAt)
            .HasColumnName("fecha_creacion")
            .HasConversion(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
            );
        
        modelBuilder.Entity<User>().Property(u => u.Role)
            .HasColumnName("rol");

        modelBuilder.Entity<User>().Property(u => u.RefreshToken)
            .HasColumnName("refresh_token");

        modelBuilder.Entity<User>().Property(u => u.RefreshTokenExpiryDate)
            .HasColumnName("refresh_token_expiry_date");

        modelBuilder.Entity<User>().Property(u => u.IsTwoFactorEnabled)
            .HasColumnName("is_two_factor_enabled")
            .HasDefaultValue(true);

        modelBuilder.Entity<User>().Property(u => u.TwoFactorCode)
            .HasColumnName("two_factor_code");

        modelBuilder.Entity<User>().Property(u => u.TwoFactorCodeExpiry)
            .HasColumnName("two_factor_code_expiry");

        modelBuilder.Entity<User>().Ignore(u => u.Provider);
        modelBuilder.Entity<User>().Ignore(u => u.ProviderId);
        
        base.OnModelCreating(modelBuilder);
    }
}