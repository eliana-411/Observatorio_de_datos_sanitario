using Microsoft.EntityFrameworkCore;
using Observatorio.Infrastructure.Sanitario.Entities;

namespace Observatorio.Infrastructure.Sanitario
{
    public class SanitarioDbContext : DbContext
    {
        public SanitarioDbContext(DbContextOptions<SanitarioDbContext> options)
            : base(options)
        {
        }

        // DbSets para las dimensiones
        public DbSet<DimLugar> DimLugar { get; set; }
        public DbSet<DimTiempo> DimTiempo { get; set; }
        public DbSet<DimPersona> DimPersona { get; set; }
        public DbSet<DimMetodo> DimMetodo { get; set; }
        public DbSet<DimContexto> DimContexto { get; set; }
        public DbSet<DimAtencion> DimAtencion { get; set; }
        
        // DbSet para la tabla de hechos
        public DbSet<FactEvento> FactEvento { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Mapeo de DIM_LUGAR
            modelBuilder.Entity<DimLugar>()
                .ToTable("DIM_LUGAR")
                .HasKey(l => l.IdLugar);
            
            modelBuilder.Entity<DimLugar>()
                .Property(l => l.IdLugar).HasColumnName("id_lugar");
            modelBuilder.Entity<DimLugar>()
                .Property(l => l.MunicipioEvento).HasColumnName("municipio_evento");
            modelBuilder.Entity<DimLugar>()
                .Property(l => l.MunicipioOrigen).HasColumnName("municipio_origen");
            modelBuilder.Entity<DimLugar>()
                .Property(l => l.ZonaEvento).HasColumnName("zona_evento");
            modelBuilder.Entity<DimLugar>()
                .Property(l => l.Departamento).HasColumnName("departamento");
            modelBuilder.Entity<DimLugar>()
                .Property(l => l.MismoMunicipio).HasColumnName("mismo_municipio");

            // Mapeo de DIM_TIEMPO
            modelBuilder.Entity<DimTiempo>()
                .ToTable("DIM_TIEMPO")
                .HasKey(t => t.IdTiempo);
            
            modelBuilder.Entity<DimTiempo>()
                .Property(t => t.IdTiempo).HasColumnName("id_tiempo");
            modelBuilder.Entity<DimTiempo>()
                .Property(t => t.Fecha).HasColumnName("fecha");
            modelBuilder.Entity<DimTiempo>()
                .Property(t => t.Anio).HasColumnName("anio");
            modelBuilder.Entity<DimTiempo>()
                .Property(t => t.Mes).HasColumnName("mes");
            modelBuilder.Entity<DimTiempo>()
                .Property(t => t.Trimestre).HasColumnName("trimestre");
            modelBuilder.Entity<DimTiempo>()
                .Property(t => t.NombreMes).HasColumnName("nombre_mes");
            modelBuilder.Entity<DimTiempo>()
                .Property(t => t.DiaSemana).HasColumnName("dia_semana");
            modelBuilder.Entity<DimTiempo>()
                .Property(t => t.EsFinDeSemana).HasColumnName("es_fin_de_semana");

            // Mapeo de DIM_PERSONA
            modelBuilder.Entity<DimPersona>()
                .ToTable("DIM_PERSONA")
                .HasKey(p => p.IdPersona);
            
            modelBuilder.Entity<DimPersona>()
                .Property(p => p.IdPersona).HasColumnName("id_persona");
            modelBuilder.Entity<DimPersona>()
                .Property(p => p.Genero).HasColumnName("genero");
            modelBuilder.Entity<DimPersona>()
                .Property(p => p.Edad).HasColumnName("edad");
            modelBuilder.Entity<DimPersona>()
                .Property(p => p.GrupoEtario).HasColumnName("grupo_etario");
            modelBuilder.Entity<DimPersona>()
                .Property(p => p.Estrato).HasColumnName("estrato");
            modelBuilder.Entity<DimPersona>()
                .Property(p => p.GrupoPoblacional).HasColumnName("grupo_poblacional");
            modelBuilder.Entity<DimPersona>()
                .Property(p => p.EstadoCivil).HasColumnName("estado_civil");
            modelBuilder.Entity<DimPersona>()
                .Property(p => p.SituacionSentimental).HasColumnName("situacion_sentimental");

            // Mapeo de DIM_METODO
            modelBuilder.Entity<DimMetodo>()
                .ToTable("DIM_METODO")
                .HasKey(m => m.IdMetodo);
            
            modelBuilder.Entity<DimMetodo>()
                .Property(m => m.IdMetodo).HasColumnName("id_metodo");
            modelBuilder.Entity<DimMetodo>()
                .Property(m => m.Metodo).HasColumnName("metodo");
            modelBuilder.Entity<DimMetodo>()
                .Property(m => m.TipoMetodo).HasColumnName("tipo_metodo");
            modelBuilder.Entity<DimMetodo>()
                .Property(m => m.NivelLetalidad).HasColumnName("nivel_letalidad");

            // Mapeo de DIM_CONTEXTO
            modelBuilder.Entity<DimContexto>()
                .ToTable("DIM_CONTEXTO")
                .HasKey(c => c.IdContexto);
            
            modelBuilder.Entity<DimContexto>()
                .Property(c => c.IdContexto).HasColumnName("id_contexto");
            modelBuilder.Entity<DimContexto>()
                .Property(c => c.AntecedentesAludMental).HasColumnName("antecedentes_salud_mental");
            modelBuilder.Entity<DimContexto>()
                .Property(c => c.ConsumoSustancias).HasColumnName("consumo_sustancias");
            modelBuilder.Entity<DimContexto>()
                .Property(c => c.TieneAntecedente).HasColumnName("tiene_antecedente");
            modelBuilder.Entity<DimContexto>()
                .Property(c => c.ConsumoSustanciasFlag).HasColumnName("consumo_sustancias_flag");

            // Mapeo de DIM_ATENCION
            modelBuilder.Entity<DimAtencion>()
                .ToTable("DIM_ATENCION")
                .HasKey(a => a.IdAtencion);
            
            modelBuilder.Entity<DimAtencion>()
                .Property(a => a.IdAtencion).HasColumnName("id_atencion");
            modelBuilder.Entity<DimAtencion>()
                .Property(a => a.ResultadoAtencion).HasColumnName("resultado_atencion");
            modelBuilder.Entity<DimAtencion>()
                .Property(a => a.TipoResultado).HasColumnName("tipo_resultado");
            modelBuilder.Entity<DimAtencion>()
                .Property(a => a.RequirioHospitalizacion).HasColumnName("requirio_hospitalizacion");

            // Mapeo de FACT_EVENTO
            modelBuilder.Entity<FactEvento>()
                .ToTable("FACT_EVENTO")
                .HasKey(e => e.IdRegistro);
            
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.IdRegistro).HasColumnName("id_registro");
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.IdTiempo).HasColumnName("id_tiempo");
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.IdPersona).HasColumnName("id_persona");
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.IdLugar).HasColumnName("id_lugar");
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.IdMetodo).HasColumnName("id_metodo");
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.IdAtencion).HasColumnName("id_atencion");
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.IdContexto).HasColumnName("id_contexto");
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.Hospitalizado).HasColumnName("hospitalizado");
            modelBuilder.Entity<FactEvento>()
                .Property(e => e.CantidadIntentos).HasColumnName("cantidad_intentos");

            // Configurar relaciones foráneas
            modelBuilder.Entity<FactEvento>()
                .HasOne(e => e.Tiempo)
                .WithMany(t => t.Eventos)
                .HasForeignKey(e => e.IdTiempo)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FactEvento>()
                .HasOne(e => e.Persona)
                .WithMany(p => p.Eventos)
                .HasForeignKey(e => e.IdPersona)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FactEvento>()
                .HasOne(e => e.Lugar)
                .WithMany(l => l.Eventos)
                .HasForeignKey(e => e.IdLugar)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FactEvento>()
                .HasOne(e => e.Metodo)
                .WithMany(m => m.Eventos)
                .HasForeignKey(e => e.IdMetodo)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FactEvento>()
                .HasOne(e => e.Atencion)
                .WithMany(a => a.Eventos)
                .HasForeignKey(e => e.IdAtencion)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FactEvento>()
                .HasOne(e => e.Contexto)
                .WithMany(c => c.Eventos)
                .HasForeignKey(e => e.IdContexto)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
