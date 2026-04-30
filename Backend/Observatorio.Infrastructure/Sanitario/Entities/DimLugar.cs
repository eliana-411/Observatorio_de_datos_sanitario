namespace Observatorio.Infrastructure.Sanitario.Entities
{
    public class DimLugar
    {
        public int IdLugar { get; set; }
        public string? MunicipioEvento { get; set; }
        public string? MunicipioOrigen { get; set; }
        public string? ZonaEvento { get; set; }
        public string? Departamento { get; set; }
        public bool? MismoMunicipio { get; set; }

        // Relación con FACT_EVENTO
        public ICollection<FactEvento> Eventos { get; set; } = new List<FactEvento>();
    }
}
