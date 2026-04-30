namespace Observatorio.Application.Common.DTOs;

/// <summary>
/// Respuesta estándar para toda la API
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ErrorCode { get; set; }
    public T? Data { get; set; }
    public Dictionary<string, string[]>? Details { get; set; } // Para errores de validación
}

/// <summary>
/// Versión sin genérico para respuestas simples
/// </summary>
public class ApiResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ErrorCode { get; set; }
    public Dictionary<string, string[]>? Details { get; set; }
}
