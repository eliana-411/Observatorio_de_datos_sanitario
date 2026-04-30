namespace Observatorio.Domain.Entities;

public class User
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? Provider { get; set; } // Google, Microsoft, Local

    public string? ProviderId { get; set; } // ID del proveedor OAuth

    public string Role { get; set; } = "User"; // Admin, User, etc.

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? RefreshToken { get; set; } // Para refresh token

    public DateTime? RefreshTokenExpiryDate { get; set; } // Expiración del refresh token

    public bool IsTwoFactorEnabled { get; set; } = true; // Habilitar 2FA por defecto

    public string? TwoFactorCode { get; set; } // Código para autenticación de doble factor

    public DateTime? TwoFactorCodeExpiry { get; set; } // Expiración del código 2FA

}