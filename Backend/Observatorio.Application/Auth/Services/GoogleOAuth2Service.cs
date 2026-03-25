using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using Observatorio.Application.Auth.DTOs;

namespace Observatorio.Application.Auth.Services;

public class GoogleOAuth2Service
{
    private readonly IConfiguration _configuration;
    private readonly JwtTokenGenerator _jwtTokenGenerator;

    public GoogleOAuth2Service(IConfiguration configuration, JwtTokenGenerator jwtTokenGenerator)
    {
        _configuration = configuration;
        _jwtTokenGenerator = jwtTokenGenerator;
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

            // Si llegamos aquí, el token es válido
            var userId = Guid.NewGuid().ToString();
            var jwtToken = _jwtTokenGenerator.GenerateToken(userId, payload.Email, payload.Name);

            return new AuthResponse
            {
                Token = jwtToken,
                Name = payload.Name,
                Email = payload.Email
            };
        }
        catch (InvalidOperationException ex)
        {
            throw new UnauthorizedAccessException($"Token de Google inválido: {ex.Message}");
        }
    }
}
