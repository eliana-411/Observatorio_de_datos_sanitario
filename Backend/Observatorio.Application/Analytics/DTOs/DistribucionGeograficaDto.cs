using System.ComponentModel;

namespace Observatorio.Application.Analytics.DTOs;

/// <summary>
/// DTO para la distribución geográfica de eventos
/// </summary>
public class DistribucionGeograficaDto
{
    [DisplayName("Código Municipio")]
    public string CodigoMunicipio { get; set; } = string.Empty;

    [DisplayName("Municipio")]
    public string NombreMunicipio { get; set; } = string.Empty;

    
    [DisplayName("Total Casos")]
    public int TotalCasos { get; set; }

    [DisplayName("Hospitalizados")]
    public int Hospitalizados { get; set; }
    
    [DisplayName("No Hospitalizados")]
    public int NoHospitalizados => TotalCasos - Hospitalizados;

    [DisplayName("Tasa Hospitalización %")]
    public decimal TasaHospitalizacion => TotalCasos > 0 
        ? Math.Round((decimal)Hospitalizados / TotalCasos * 100, 2) : 0;

    [DisplayName("Tasa No Hospitalización %")] 
    public decimal TasaNoHospitalizacion => TotalCasos > 0 
    ? Math.Round((decimal)NoHospitalizados / TotalCasos * 100, 2): 0;

    [DisplayName("Distribución por Género")]
    public List<DistribucionItemDto> DistribucionGenero { get; set; } = new();

    [DisplayName("Distribución por Grupo Etario")]
    public List<DistribucionItemDto> DistribucionGrupoEtario { get; set; } = new();

    [DisplayName("Top 3 Métodos")]
    public List<DistribucionItemDto> TopMetodos { get; set; } = new();
}

public class DistribucionItemDto
{
    [DisplayName("Nombre")]
    public string Nombre { get; set; } = string.Empty;

    [DisplayName("Cantidad")]
    public int Cantidad { get; set; }

    [DisplayName("Porcentaje %")]
    public decimal Porcentaje { get; set; }
}

/// <summary>
/// DTO para la respuesta completa de distribución geográfica detallada
/// </summary>
public class DistribucionGeograficaDetalladaResponseDto
{
    [DisplayName("Total Global")]
    public int TotalGlobal { get; set; }
    
    [DisplayName("Municipios")]
    public List<DistribucionGeograficaDto> Municipios { get; set; } = new();
}