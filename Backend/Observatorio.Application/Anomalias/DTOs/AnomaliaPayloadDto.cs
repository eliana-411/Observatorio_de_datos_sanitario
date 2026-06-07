using System.Text.Json.Serialization;

namespace Observatorio.Application.Anomalias.DTOs;

/// <summary>
/// DTO para enviar datos de un caso al servicio de detección de anomalías (FastAPI)
/// </summary>
public class AnomaliaPayloadDto
{
    [JsonPropertyName("edad")]
    public int Edad { get; set; }
    [JsonPropertyName("genero")]
    public string Genero { get; set; } = string.Empty;
    [JsonPropertyName("estrato")]
    public int Estrato { get; set; }
    [JsonPropertyName("estado_civil")]
    public string EstadoCivil { get; set; } = string.Empty;
    [JsonPropertyName("situacion_sentimental")]
    public string SituacionSentimental { get; set; } = string.Empty;
    [JsonPropertyName("municipio_origen")]
    public string MunicipioOrigen { get; set; } = string.Empty;
    [JsonPropertyName("municipio_evento")]
    public string MunicipioEvento { get; set; } = string.Empty;
    [JsonPropertyName("zona_evento")]
    public string ZonaEvento { get; set; } = string.Empty;
    [JsonPropertyName("metodo")]
    public string Metodo { get; set; } = string.Empty;
    [JsonPropertyName("nivel_letalidad")]
    public string NivelLetalidad { get; set; } = string.Empty;
    [JsonPropertyName("hospitalizado")]
    public bool Hospitalizado { get; set; }
    [JsonPropertyName("resultado_atencion")]
    public string ResultadoAtencion { get; set; } = string.Empty;
    [JsonPropertyName("antecedentes_salud_mental")]
    public string AntecedentesSaludMental { get; set; } = string.Empty;
    [JsonPropertyName("consumo_sustancias")]
    public string ConsumoSustancias { get; set; } = string.Empty;
    [JsonPropertyName("tiene_antecedente")]
    public bool TieneAntecedente { get; set; }
    [JsonPropertyName("mismo_municipio")]
    public bool MismoMunicipio { get; set; } = true;
}