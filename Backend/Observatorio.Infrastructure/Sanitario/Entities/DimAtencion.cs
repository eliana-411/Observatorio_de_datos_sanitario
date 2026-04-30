namespace Observatorio.Infrastructure.Sanitario.Entities
{
    public class DimAtencion
    {
        public int IdAtencion { get; set; }
        public string? ResultadoAtencion { get; set; }
        public string? TipoResultado { get; set; }
        public bool? RequirioHospitalizacion { get; set; }

        // Relación con FACT_EVENTO
        public ICollection<FactEvento> Eventos { get; set; } = new List<FactEvento>();
    }
}
