using Microsoft.AspNetCore.Http;

namespace Observatorio.API.Middleware;

/// <summary>
/// Middleware para Rate Limiting
/// Limita intentos por IP/email para proteger contra fuerza bruta
/// Ej: máximo 5 intentos fallidos de login en 15 minutos
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly Dictionary<string, (int Count, DateTime ExpiryTime)> _requestCounts = new();
    private static readonly object _lock = new object();
    
    // Configuración
    private const int MaxAttempts = 5;
    private const int WindowMinutes = 15;
    private const string LoginPath = "/api/auth/login";

    public RateLimitingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Solo aplicar rate limiting a endpoints sensibles (login, register, 2FA)
        var path = context.Request.Path.Value?.ToLower() ?? string.Empty;
        
        if (path.Contains("login") || path.Contains("register") || path.Contains("verify-2fa"))
        {
            var key = GetRateLimitKey(context);
            
            if (!IsAllowed(key))
            {
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.Response.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Demasiados intentos. Intenta más tarde.",
                    errorCode = "RATE_LIMIT_EXCEEDED",
                    retryAfter = WindowMinutes
                });
                return;
            }
        }

        await _next(context);
    }

    private string GetRateLimitKey(HttpContext context)
    {
        // Usar combinación de IP + endpoint como clave
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var path = context.Request.Path.Value ?? string.Empty;
        return $"{ip}:{path}";
    }

    private bool IsAllowed(string key)
    {
        lock (_lock)
        {
            var now = DateTime.UtcNow;
            
            if (_requestCounts.TryGetValue(key, out var entry))
            {
                // Si expiró el window, reiniciar contador
                if (now > entry.ExpiryTime)
                {
                    _requestCounts[key] = (1, now.AddMinutes(WindowMinutes));
                    return true;
                }
                
                // Si aún está dentro del window
                if (entry.Count >= MaxAttempts)
                {
                    return false; // Bloqueado
                }
                
                // Incrementar contador
                _requestCounts[key] = (entry.Count + 1, entry.ExpiryTime);
                return true;
            }
            
            // Primera solicitud
            _requestCounts[key] = (1, now.AddMinutes(WindowMinutes));
            return true;
        }
    }
}
