using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Observatorio.Application.Auth.DTOs;
using Observatorio.Domain.Entities;
using Observatorio.Infrastructure.Data.Repositories;

namespace Observatorio.Application.Auth.Services;

public class GoogleOAuth2Service
{
    private readonly IConfiguration _configuration;
    private readonly JwtTokenGenerator _jwtTokenGenerator;
    private readonly IUserRepository _userRepository;

    public GoogleOAuth2Service(IConfiguration configuration, JwtTokenGenerator jwtTokenGenerator, IUserRepository userRepository)
    {
        _configuration = configuration;
        _jwtTokenGenerator = jwtTokenGenerator;
        _userRepository = userRepository;
    }

    public async Task<AuthResponse> AuthenticateWithGoogleAsync(string googleToken)
    {
        try
        {
            var clientId = _configuration["GoogleAuth:ClientId"];
            
            // Validar el token de Google
            var payload = await GoogleJsonWebSignature.ValidateAsync(googleToken, new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new[] { clientId }
            });

            // Buscar o crear usuario
            var user = await _userRepository.GetByEmailAsync(payload.Email);
            
            if (user == null)
            {
                // Crear nuevo usuario con Google
                user = new User
                {
                    Name = payload.Name ?? payload.Email,
                    Email = payload.Email,
                    PasswordHash = string.Empty, // Sin password para OAuth
                    Provider = "Google",
                    ProviderId = payload.Subject,
                    CreatedAt = DateTime.UtcNow,
                };

                await _userRepository.AddAsync(user);
            }
            else if (user.Provider != "Google")
            {
                // Actualizar si ya existe pero es local
                user.Provider = "Google";
                user.ProviderId = payload.Subject;
                await _userRepository.UpdateAsync(user);
            }

            // Generar JWT
            var jwtToken = _jwtTokenGenerator.GenerateToken(user.Id.ToString(), user.Email, user.Name);

            return new AuthResponse
            {
                Token = jwtToken,
                Name = user.Name,
                Email = user.Email
            };
        }
        catch (InvalidOperationException ex)
        {
            throw new UnauthorizedAccessException($"Token de Google inválido: {ex.Message}");
        }
    }
}
