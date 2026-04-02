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
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
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

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var sub = User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(name))
        {
            return Unauthorized();
        }

        return Ok(new { id = sub, email, name });
    }
}