using System.Security.Cryptography;
using BCrypt.Net;
using Observatorio.Application.Auth.DTOs;
using Observatorio.Application.Auth.Interfaces;
using Observatorio.Application.Email;
using Observatorio.Domain.Entities;
using Observatorio.Infrastructure.Data.Repositories;
using static Observatorio.Application.Auth.DTOs.AuthExceptions;

namespace Observatorio.Application.Auth.Services;

public class AuthService : IAuthService
{
    private readonly JwtTokenGenerator _jwtTokenGenerator;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;

    public AuthService(JwtTokenGenerator jwtTokenGenerator, IUserRepository userRepository, IEmailService emailService)
    {
        _jwtTokenGenerator = jwtTokenGenerator;
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Validar que el usuario no exista
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("El usuario ya existe");
        }

        // Hashear password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Generar refresh token
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiryDate = _jwtTokenGenerator.GetRefreshTokenExpiryDate();

        // Crear nuevo usuario
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash,
            Provider = "Local",
            Role = request.Role ?? "User",
            CreatedAt = DateTime.UtcNow,
            RefreshToken = refreshToken,
            RefreshTokenExpiryDate = refreshTokenExpiryDate,
            IsTwoFactorEnabled = true,
        };

        // Guardar en BD
        await _userRepository.AddAsync(user);

        // Generar JWT
        var token = _jwtTokenGenerator.GenerateToken(user.Id.ToString(), user.Email, user.Name);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Buscar usuario por email
        var user = await _userRepository.GetByEmailAsync(request.Email);
        
        if (user == null)
        {
            throw new UserNotFoundException();
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidPasswordException();
        }

        // Si 2FA está habilitado, generar código y enviar email
        if (user.IsTwoFactorEnabled)
        {
            // Generar código de 6 dígitos aleatorio
            var twoFactorCode = new Random().Next(100000, 999999).ToString();
            var expiryDate = DateTime.UtcNow.AddMinutes(5); // Válido por 5 minutos

            // Guardar en BD
            user.TwoFactorCode = twoFactorCode;
            user.TwoFactorCodeExpiry = expiryDate;
            await _userRepository.UpdateAsync(user);

            // Enviar código por email
            await _emailService.SendTwoFactorEmailAsync(user.Email, user.Name, twoFactorCode);

            return new LoginResponse
            {
                RequiresTwoFactor = true,
                Message = "Código de autenticación enviado a tu email"
            };
        }

        // Si 2FA no está habilitado, retornar tokens directamente
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiryDate = _jwtTokenGenerator.GetRefreshTokenExpiryDate();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryDate = refreshTokenExpiryDate;
        await _userRepository.UpdateAsync(user);

        var token = _jwtTokenGenerator.GenerateToken(user.Id.ToString(), user.Email, user.Name);

        return new LoginResponse
        {
            RequiresTwoFactor = false,
            Token = token,
            RefreshToken = refreshToken,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<AuthResponse> VerifyTwoFactorCodeAsync(string email, string twoFactorCode)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            throw new UserNotFoundException();

        // Validar que el código coincida
        if (user.TwoFactorCode != twoFactorCode)
            throw new InvalidOperationException("Código de autenticación inválido");

        // Validar que no haya expirado
        if (user.TwoFactorCodeExpiry == null || user.TwoFactorCodeExpiry < DateTime.UtcNow)
            throw new InvalidOperationException("Código de autenticación expirado");

        // Generar tokens
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiryDate = _jwtTokenGenerator.GetRefreshTokenExpiryDate();

        // Guardar refresh token en BD y limpiar código 2FA
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryDate = refreshTokenExpiryDate;
        user.TwoFactorCode = null;
        user.TwoFactorCodeExpiry = null;
        await _userRepository.UpdateAsync(user);

        // Generar JWT
        var token = _jwtTokenGenerator.GenerateToken(user.Id.ToString(), user.Email, user.Name);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        // Buscar usuario por refresh token
        var users = await _userRepository.GetAllAsync();

        var user = users.FirstOrDefault(u => u.RefreshToken == refreshToken);

        if (user == null || user.RefreshTokenExpiryDate == null || user.RefreshTokenExpiryDate < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Refresh token inválido o expirado");
        }

        // Generar nuevo JWT
        var newToken = _jwtTokenGenerator.GenerateToken(user.Id.ToString(), user.Email, user.Name);

        // Generar nuevo refresh token
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var newRefreshTokenExpiryDate = _jwtTokenGenerator.GetRefreshTokenExpiryDate();

        // Guardar nuevo refresh token en BD
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryDate = newRefreshTokenExpiryDate;
        await _userRepository.UpdateAsync(user);

        return new AuthResponse
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task LogoutAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryDate = null;
            await _userRepository.UpdateAsync(user);
        }
    }

    public async Task RequestPasswordResetAsync(ForgotPasswordRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        
        // SIEMPRE mismo mensaje, sin importar si el email existe (anti-enumeración)
        if (user == null)
        {
            // Opcional: loggear intento con email inexistente
            return;
        }

        // Generar código seguro de 6 dígitos
        var resetCode = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(10);

        // Guardar en BD (reutilizamos campos de 2FA o creamos nuevos)
        user.PasswordResetCode = resetCode;
        user.PasswordResetCodeExpiry = expiry;
        await _userRepository.UpdateAsync(user);

        // Enviar email
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetCode);
    }

    public async Task ResetPasswordAsync(VerifyResetCodeRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            throw new InvalidOperationException("Código inválido o expirado"); // Mensaje genérico

        // Validar código
        if (user.PasswordResetCode != request.Code)
            throw new InvalidOperationException("Código inválido o expirado");

        // Validar expiración
        if (user.PasswordResetCodeExpiry == null || user.PasswordResetCodeExpiry < DateTime.UtcNow)
            throw new InvalidOperationException("Código inválido o expirado");

        // Validar que no sea la misma contraseña anterior (opcional pero recomendado)
        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            throw new InvalidOperationException("La nueva contraseña debe ser diferente a la anterior");

        // Hashear nueva contraseña (igual que en registro)
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        
        // Limpiar código usado (single-use)
        user.PasswordResetCode = null;
        user.PasswordResetCodeExpiry = null;
        
        // Invalidar sesiones existentes (seguridad)
        user.RefreshToken = null;
        user.RefreshTokenExpiryDate = null;

        await _userRepository.UpdateAsync(user);
    }

}