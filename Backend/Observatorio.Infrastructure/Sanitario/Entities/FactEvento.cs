namespace Observatorio.Infrastructure.Sanitario.Entities
{
    public class FactEvento
    {
        public int IdRegistro { get; set; }
        public int? IdTiempo { get; set; }
        public int? IdPersona { get; set; }
        public int? IdLugar { get; set; }
        public int? IdMetodo { get; set; }
        public int? IdAtencion { get; set; }
        public int? IdContexto { get; set; }
        public bool? Hospitalizado { get; set; }
        public int? CantidadIntentos { get; set; }

        // Relaciones de navegación
        public DimTiempo? Tiempo { get; set; }
        public DimPersona? Persona { get; set; }
        public DimLugar? Lugar { get; set; }
        public DimMetodo? Metodo { get; set; }
        public DimAtencion? Atencion { get; set; }
        public DimContexto? Contexto { get; set; }
    }
}
