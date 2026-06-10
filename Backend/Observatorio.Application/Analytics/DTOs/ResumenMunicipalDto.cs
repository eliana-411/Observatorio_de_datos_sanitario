namespace Observatorio.Application.Analytics.DTOs;

public class ResumenMunicipalDto
{
    public string NombreMunicipio { get; set; } = string.Empty;
    public string CodigoDANE { get; set; } = string.Empty;
    public int TotalCasos { get; set; }
    public int Hospitalizados { get; set; }
    public decimal TasaHospitalizacion { get; set; }
}

public class ResumenMunicipalResponseDto
{
    public PeriodoDto? Periodo { get; set; }
    public List<ResumenMunicipalDto> Data { get; set; } = new();
}

public class ResumenMunicipalFiltrosDto
{
    public string? Municipio { get; set; }
    public int? Anio { get; set; }
}