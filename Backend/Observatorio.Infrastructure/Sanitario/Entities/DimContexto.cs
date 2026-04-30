namespace Observatorio.Infrastructure.Sanitario.Entities
{
    public class DimContexto
    {
        public int IdContexto { get; set; }
        public string? AntecedentesAludMental { get; set; }
        public string? ConsumoSustancias { get; set; }
        public bool? TieneAntecedente { get; set; }
        public bool? ConsumoSustanciasFlag { get; set; }

        // Relación con FACT_EVENTO
        public ICollection<FactEvento> Eventos { get; set; } = new List<FactEvento>();
    }
}
