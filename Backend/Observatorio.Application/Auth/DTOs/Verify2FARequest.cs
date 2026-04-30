namespace Observatorio.Application.Auth.DTOs;

public class Verify2FARequest
{
    public string Email { get; set; } = string.Empty;
    public string TwoFactorCode { get; set; } = string.Empty;
}
