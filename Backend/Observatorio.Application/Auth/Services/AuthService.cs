using Observatorio.Application.Auth.DTOs;
using Observatorio.Application.Auth.Interfaces;

namespace Observatorio.Application.Auth.Services;

public class AuthService : IAuthService
{
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    // Usuarios de prueba (sin BD aún)
    private static readonly Dictionary<string, (string Name, string Email, string Password)> FakeUsers = new()
    {
        { "testuser@example.com", ("Test User", "testuser@example.com", "password123") }
    };

    public AuthService(JwtTokenGenerator jwtTokenGenerator)
    {
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // TODO: Validar que el usuario no exista
        // TODO: Guardar en base de datos
        // TODO: Hash password

        var userId = Guid.NewGuid().ToString();
        var token = _jwtTokenGenerator.GenerateToken(userId, request.Email, request.Name);

        // Simular guardado en usuarios fake
        FakeUsers[request.Email] = (request.Name, request.Email, "hashed-password");

        return await Task.FromResult(new AuthResponse
        {
            Token = token,
            Name = request.Name,
            Email = request.Email
        });
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // TODO: Validar contra base de datos
        // TODO: Validar contraseña con hash

        // Validar que el usuario exista
        if (!FakeUsers.TryGetValue(request.Email, out var user))
        {
            throw new UnauthorizedAccessException("El correo no está registrado. Por favor, regístrate primero.");
        }

        // Validar contraseña
        if (user.Password != request.Password)
        {
            throw new UnauthorizedAccessException("La contraseña es incorrecta.");
        }

        var token = _jwtTokenGenerator.GenerateToken(Guid.NewGuid().ToString(), user.Email, user.Name);

        return await Task.FromResult(new AuthResponse
        {
            Token = token,
            Name = user.Name,
            Email = user.Email
        });
    }
}