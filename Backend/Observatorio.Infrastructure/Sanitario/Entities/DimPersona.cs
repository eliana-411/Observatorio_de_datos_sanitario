namespace Observatorio.Infrastructure.Sanitario.Entities
{
    public class DimPersona
    {
        public int IdPersona { get; set; }
        public string? Genero { get; set; }
        public int? Edad { get; set; }
        public string? GrupoEtario { get; set; }
        public int? Estrato { get; set; }
        public string? GrupoPoblacional { get; set; }
        public string? EstadoCivil { get; set; }
        public string? SituacionSentimental { get; set; }

        // Relación con FACT_EVENTO
        public ICollection<FactEvento> Eventos { get; set; } = new List<FactEvento>();
    }
}
