using BCrypt.Net;
using Observatorio.Application.Auth.DTOs;
using Observatorio.Application.Auth.Interfaces;
using Observatorio.Domain.Entities;
using Observatorio.Infrastructure.Data.Repositories;
using static Observatorio.Application.Auth.DTOs.AuthExceptions;

namespace Observatorio.Application.Auth.Services;

public class AuthService : IAuthService
{
    private readonly JwtTokenGenerator _jwtTokenGenerator;
    private readonly IUserRepository _userRepository;

    public AuthService(JwtTokenGenerator jwtTokenGenerator, IUserRepository userRepository)
    {
        _jwtTokenGenerator = jwtTokenGenerator;
        _userRepository = userRepository;
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

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
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

        // Generar nuevo refresh token
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var refreshTokenExpiryDate = _jwtTokenGenerator.GetRefreshTokenExpiryDate();

        // Guardar refresh token en BD
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryDate = refreshTokenExpiryDate;
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
}