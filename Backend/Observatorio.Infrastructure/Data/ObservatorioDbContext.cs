using Microsoft.EntityFrameworkCore;
using Observatorio.Domain.Entities;

namespace Observatorio.Infrastructure.Data;

public class ObservatorioDbContext : DbContext
{
    public ObservatorioDbContext(DbContextOptions<ObservatorioDbContext> options) 
        : base(options) { }
    
    // Tablas de Autenticación
    public DbSet<User> Users { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    
    // Dimensiones (Data Warehouse)
    public DbSet<Persona> Personas { get; set; }
    public DbSet<Tiempo> Tiempos { get; set; }
    public DbSet<Lugar> Lugares { get; set; }
    public DbSet<Metodo> Metodos { get; set; }
    public DbSet<Atencion> Atenciones { get; set; }
    public DbSet<Contexto> Contextos { get; set; }
    
    // Tabla de Hechos
    public DbSet<Evento> Eventos { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ==================== USER ====================
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

        // ==================== AUDIT LOG ====================
        modelBuilder.Entity<AuditLog>().ToTable("audit_logs");
        
        modelBuilder.Entity<AuditLog>().Property(a => a.Id)
            .HasColumnName("id_auditoria")
            .ValueGeneratedOnAdd();
        
        modelBuilder.Entity<AuditLog>().HasKey(a => a.Id);
        
        // ==================== DIMENSIONES ====================
        
        // Persona
        modelBuilder.Entity<Persona>().ToTable("dim_persona");
        modelBuilder.Entity<Persona>().Property(p => p.Id)
            .HasColumnName("id_persona")
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<Persona>().HasKey(p => p.Id);
        
        // Tiempo
        modelBuilder.Entity<Tiempo>().ToTable("dim_tiempo");
        modelBuilder.Entity<Tiempo>().Property(t => t.Id)
            .HasColumnName("id_tiempo")
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<Tiempo>().HasKey(t => t.Id);
        
        // Lugar
        modelBuilder.Entity<Lugar>().ToTable("dim_lugar");
        modelBuilder.Entity<Lugar>().Property(l => l.Id)
            .HasColumnName("id_lugar")
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<Lugar>().HasKey(l => l.Id);
        
        // Metodo
        modelBuilder.Entity<Metodo>().ToTable("dim_metodo");
        modelBuilder.Entity<Metodo>().Property(m => m.Id)
            .HasColumnName("id_metodo")
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<Metodo>().HasKey(m => m.Id);
        modelBuilder.Entity<Metodo>().Property(m => m.Descripcion)
            .HasColumnName("metodo");
        
        // Atencion
        modelBuilder.Entity<Atencion>().ToTable("dim_atencion");
        modelBuilder.Entity<Atencion>().Property(a => a.Id)
            .HasColumnName("id_atencion")
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<Atencion>().HasKey(a => a.Id);
        
        // Contexto
        modelBuilder.Entity<Contexto>().ToTable("dim_contexto");
        modelBuilder.Entity<Contexto>().Property(c => c.Id)
            .HasColumnName("id_contexto")
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<Contexto>().HasKey(c => c.Id);
        
        // ==================== TABLA DE HECHOS ====================
        
        // Evento (Fact Table)
        modelBuilder.Entity<Evento>().ToTable("fact_evento");
        modelBuilder.Entity<Evento>().Property(e => e.Id)
            .HasColumnName("id_registro")
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<Evento>().HasKey(e => e.Id);
        
        modelBuilder.Entity<Evento>().Property(e => e.IdTiempo)
            .HasColumnName("id_tiempo");
        modelBuilder.Entity<Evento>().Property(e => e.IdPersona)
            .HasColumnName("id_persona");
        modelBuilder.Entity<Evento>().Property(e => e.IdLugar)
            .HasColumnName("id_lugar");
        modelBuilder.Entity<Evento>().Property(e => e.IdMetodo)
            .HasColumnName("id_metodo");
        modelBuilder.Entity<Evento>().Property(e => e.IdAtencion)
            .HasColumnName("id_atencion");
        modelBuilder.Entity<Evento>().Property(e => e.IdContexto)
            .HasColumnName("id_contexto");
        
        modelBuilder.Entity<Evento>().Property(e => e.Hospitalizado)
            .HasColumnName("hospitalizado");
        modelBuilder.Entity<Evento>().Property(e => e.CantidadIntentos)
            .HasColumnName("cantidad_intentos");
        
        // Relaciones Foreign Keys
        modelBuilder.Entity<Evento>()
            .HasOne(e => e.Tiempo)
            .WithMany(t => t.Eventos)
            .HasForeignKey(e => e.IdTiempo);
        
        modelBuilder.Entity<Evento>()
            .HasOne(e => e.Persona)
            .WithMany(p => p.Eventos)
            .HasForeignKey(e => e.IdPersona);
        
        modelBuilder.Entity<Evento>()
            .HasOne(e => e.Lugar)
            .WithMany(l => l.Eventos)
            .HasForeignKey(e => e.IdLugar);
        
        modelBuilder.Entity<Evento>()
            .HasOne(e => e.Metodo)
            .WithMany(m => m.Eventos)
            .HasForeignKey(e => e.IdMetodo);
        
        modelBuilder.Entity<Evento>()
            .HasOne(e => e.Atencion)
            .WithMany(a => a.Eventos)
            .HasForeignKey(e => e.IdAtencion);
        
        modelBuilder.Entity<Evento>()
            .HasOne(e => e.Contexto)
            .WithMany(c => c.Eventos)
            .HasForeignKey(e => e.IdContexto);
        
        base.OnModelCreating(modelBuilder);
    }
}