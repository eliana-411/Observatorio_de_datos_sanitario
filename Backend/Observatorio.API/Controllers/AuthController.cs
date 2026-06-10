using Microsoft.AspNetCore.Mvc;
using Observatorio.Application.Auth.DTOs;
using Observatorio.Application.Auth.Interfaces;
using Observatorio.Application.Auth.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Observatorio.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly GoogleOAuth2Service _googleOAuth2Service;

    public AuthController(IAuthService authService, GoogleOAuth2Service googleOAuth2Service)
    {
        _authService = authService;
        _googleOAuth2Service = googleOAuth2Service;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(result);
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        var result = await _googleOAuth2Service.AuthenticateWithGoogleAsync(request.Token);
        return Ok(result);
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        name = name ?? email?.Split('@')[0]; // Si no hay nombre, usar la parte antes del @ del email
        name = name ?? "Usuario"; // Si no hay email, usar un valor por defecto
        var sub = User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(name))
        {
            return Unauthorized();
        }

        return Ok(new { id = sub, email, name });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        await _authService.LogoutAsync(int.Parse(userId));
        return Ok(new { message = "Logout exitoso" });
    }

    [HttpPost("verify-2fa")]
    public async Task<IActionResult> Verify2FA([FromBody] Verify2FARequest request)
    {
        try
        {
            var result = await _authService.VerifyTwoFactorCodeAsync(request.Email, request.TwoFactorCode);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Código 2FA inválido") || ex.Message.Contains("Código 2FA expirado"))
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Usuario no encontrado") || ex.Message.Contains("2FA no habilitado"))
        {
            return BadRequest(new { message = "Error al verificar el código 2FA" });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Error interno al verificar el código de autenticación" });
        }
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _authService.RequestPasswordResetAsync(request);
        // Siempre 200 OK, sin importar si el email existe
        return Ok(new { message = "Si el email está registrado, recibirás un código de restablecimiento" });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] VerifyResetCodeRequest request)
    {
        try
        {
            await _authService.ResetPasswordAsync(request);
            return Ok(new { message = "Contraseña actualizada exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}