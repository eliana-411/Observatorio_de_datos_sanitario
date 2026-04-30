namespace Observatorio.Application.Auth.DTOs;

/// <summary>
/// DTO para registro de usuario
/// </summary>
public class RegisterRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Por defecto "User"
}