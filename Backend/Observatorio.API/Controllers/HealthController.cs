using Microsoft.AspNetCore.Mvc;
using Observatorio.Infrastructure.Data;
using Observatorio.Infrastructure.Sanitario;

namespace Observatorio.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ObservatorioDbContext _postgresContext;
        private readonly SanitarioDbContext _sqlServerContext;
        private readonly ILogger<HealthController> _logger;

        public HealthController(ObservatorioDbContext postgresContext, SanitarioDbContext sqlServerContext, ILogger<HealthController> logger)
        {
            _postgresContext = postgresContext;
            _sqlServerContext = sqlServerContext;
            _logger = logger;
        }

        /// <summary>
        /// Verifica el estado de ambas conexiones a base de datos
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetHealth()
        {
            var postgresStatus = await CheckPostgresConnection();
            var sqlServerStatus = await CheckSqlServerConnection();

            var response = new Dictionary<string, object>
            {
                { "timestamp", DateTime.UtcNow },
                { "status", "ok" },
                { "databases", new Dictionary<string, string>
                    {
                        { "postgres", postgresStatus },
                        { "sqlServer", sqlServerStatus }
                    }
                }
            };

            return Ok(response);
        }

        private async Task<string> CheckPostgresConnection()
        {
            try
            {
                // Verifica que pueda conectarse a la BD
                bool canConnect = await _postgresContext.Database.CanConnectAsync();
                if (canConnect)
                {
                    _logger.LogInformation("PostgreSQL connection successful");
                    return "connected";
                }
                else
                {
                    _logger.LogWarning("PostgreSQL connection failed: Cannot connect");
                    return "failed: Cannot connect";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"PostgreSQL connection failed: {ex.Message}");
                return $"failed: {ex.Message}";
            }
        }

        private async Task<string> CheckSqlServerConnection()
        {
            try
            {
                // Verifica que pueda conectarse a la BD
                bool canConnect = await _sqlServerContext.Database.CanConnectAsync();
                if (canConnect)
                {
                    _logger.LogInformation("SQL Server connection successful");
                    return "connected";
                }
                else
                {
                    _logger.LogWarning("SQL Server connection failed: Cannot connect");
                    return "failed: Cannot connect";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"SQL Server connection failed: {ex.Message}");
                return $"failed: {ex.Message}";
            }
        }
    }
}
