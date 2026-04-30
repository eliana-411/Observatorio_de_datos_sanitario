namespace Observatorio.Infrastructure.Sanitario.Entities
{
    public class DimTiempo
    {
        public int IdTiempo { get; set; }
        public DateTime? Fecha { get; set; }
        public int? Anio { get; set; }
        public int? Mes { get; set; }
        public int? Trimestre { get; set; }
        public string? NombreMes { get; set; }
        public string? DiaSemana { get; set; }
        public bool? EsFinDeSemana { get; set; }

        // Relación con FACT_EVENTO
        public ICollection<FactEvento> Eventos { get; set; } = new List<FactEvento>();
    }
}
