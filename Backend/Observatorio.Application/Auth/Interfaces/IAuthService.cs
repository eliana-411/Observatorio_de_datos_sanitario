using Observatorio.Application.Auth.DTOs;

namespace Observatorio.Application.Auth.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> VerifyTwoFactorCodeAsync(string email, string twoFactorCode);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(int userId);
}