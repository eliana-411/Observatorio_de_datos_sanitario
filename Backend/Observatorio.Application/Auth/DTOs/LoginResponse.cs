namespace Observatorio.Application.Auth.DTOs;

public class LoginResponse
{
    public bool RequiresTwoFactor { get; set; }
    public string? Message { get; set; }
    // Si 2FA está habilitado, no retorna tokens aquí
    // Si 2FA no está habilitado, retorna los tokens normales
    public string? Token { get; set; }
    public string? RefreshToken { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
}
