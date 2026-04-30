namespace Observatorio.Domain.Entities;

/// <summary>
/// Entidad de Auditoría - registra acciones del usuario
/// </summary>
public class AuditLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Accion { get; set; } = string.Empty; // CREATE, READ, UPDATE, DELETE
    public string Recurso { get; set; } = string.Empty; // ej: "users/5", "eventos/123"
    public string? CambiosAnteriores { get; set; }
    public string? CambiosNuevos { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool EsExitosa { get; set; } = true;
    public string? MensajeError { get; set; }
}
