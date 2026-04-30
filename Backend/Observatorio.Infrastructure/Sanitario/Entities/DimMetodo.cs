namespace Observatorio.Infrastructure.Sanitario.Entities
{
    public class DimMetodo
    {
        public int IdMetodo { get; set; }
        public string? Metodo { get; set; }
        public string? TipoMetodo { get; set; }
        public string? NivelLetalidad { get; set; }

        // Relación con FACT_EVENTO
        public ICollection<FactEvento> Eventos { get; set; } = new List<FactEvento>();
    }
}
