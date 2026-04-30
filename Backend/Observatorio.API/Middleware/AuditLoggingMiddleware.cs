using Microsoft.AspNetCore.Http;
using Observatorio.Domain.Entities;
using Observatorio.Infrastructure.Data;
using System.Security.Claims;

namespace Observatorio.API.Middleware;

/// <summary>
/// Middleware para Auditoría
/// Registra todas las acciones (CREATE, READ, UPDATE, DELETE)
/// para cumplimiento y análisis
/// </summary>
public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IServiceProvider _serviceProvider;

    public AuditLoggingMiddleware(RequestDelegate next, IServiceProvider serviceProvider)
    {
        _next = next;
        _serviceProvider = serviceProvider;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Capturar request
        var originalBodyStream = context.Response.Body;
        
        using (var responseBody = new MemoryStream())
        {
            context.Response.Body = responseBody;
            
            try
            {
                await _next(context);
                
                // Log después de la respuesta
                await LogAuditAsync(context);
            }
            catch (Exception ex)
            {
                await LogAuditErrorAsync(context, ex);
                throw;
            }
            finally
            {
                await responseBody.CopyToAsync(originalBodyStream);
            }
        }
    }

    private async Task LogAuditAsync(HttpContext context)
    {
        // No auditar ciertos endpoints
        var path = context.Request.Path.Value?.ToLower() ?? string.Empty;
        if (path.Contains("/health") || path.Contains("/swagger"))
            return;

        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = context.User?.FindFirst(ClaimTypes.Email)?.Value ?? "anonymous";
        var method = context.Request.Method;
        var action = MapMethodToAction(method);
        var resource = context.Request.Path.Value ?? "unknown";
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = context.Request.Headers["User-Agent"].ToString() ?? "unknown";
        var statusCode = context.Response.StatusCode;

        var isSuccess = statusCode >= 200 && statusCode < 300;

        var auditLog = new AuditLog
        {
            UserId = int.TryParse(userId, out var id) ? id : null,
            Email = email,
            Accion = action,
            Recurso = resource,
            IpAddress = ip,
            UserAgent = userAgent,
            Timestamp = DateTime.UtcNow,
            EsExitosa = isSuccess,
            MensajeError = !isSuccess ? $"HTTP {statusCode}" : null
        };

        await SaveAuditLogAsync(auditLog);
    }

    private async Task LogAuditErrorAsync(HttpContext context, Exception ex)
    {
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = context.User?.FindFirst(ClaimTypes.Email)?.Value ?? "anonymous";
        var method = context.Request.Method;
        var resource = context.Request.Path.Value ?? "unknown";
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = context.Request.Headers["User-Agent"].ToString() ?? "unknown";

        var auditLog = new AuditLog
        {
            UserId = int.TryParse(userId, out var id) ? id : null,
            Email = email,
            Accion = MapMethodToAction(method),
            Recurso = resource,
            IpAddress = ip,
            UserAgent = userAgent,
            Timestamp = DateTime.UtcNow,
            EsExitosa = false,
            MensajeError = ex.Message
        };

        await SaveAuditLogAsync(auditLog);
    }

    private string MapMethodToAction(string method)
    {
        return method switch
        {
            "GET" => "READ",
            "POST" => "CREATE",
            "PUT" => "UPDATE",
            "PATCH" => "UPDATE",
            "DELETE" => "DELETE",
            _ => "UNKNOWN"
        };
    }

    private async Task SaveAuditLogAsync(AuditLog log)
    {
        try
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ObservatorioDbContext>();
                dbContext.AuditLogs.Add(log);
                await dbContext.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            // Log local si falla guardar auditoría (no queremos crashear la API)
            Console.WriteLine($"[AUDIT ERROR] Failed to log audit: {ex.Message}");
        }
    }
}
