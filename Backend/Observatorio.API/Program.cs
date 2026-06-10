using Observatorio.Application.Analytics.Interfaces;
using Observatorio.Application.Analytics.Services;
using Observatorio.Application.Anomalias.Interfaces;
using Observatorio.Application.Anomalias.Services;
using Observatorio.Application.Auth.Interfaces;
using Observatorio.Application.Auth.Services;
using Observatorio.Application.Email;
using Observatorio.API.Middleware;
using Observatorio.Infrastructure.Data;
using Observatorio.Infrastructure.Data.Repositories;
using Observatorio.Infrastructure.Sanitario;
using Observatorio.Application.Common.Interfaces;
using Observatorio.Application.Common.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Hangfire;
using Hangfire.SqlServer;
using Observatorio.API.Services;

var builder = WebApplication.CreateBuilder(args);

DotNetEnv.Env.Load();

// Cargar configuration después de cargar el .env
builder.Configuration.AddEnvironmentVariables();
var connectionStringPostgres = Environment.GetEnvironmentVariable("DATABASE_URL");
var connectionStringSqlServer = Environment.GetEnvironmentVariable("DATABASE_SQL_URL");
var aiBaseUrl = Environment.GetEnvironmentVariable("AI_BASE_URL") ?? "http://localhost:8001";

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

// Agregar caché en memoria
builder.Services.AddMemoryCache();

// Registrar servicios
builder.Services.AddScoped<IMunicipiosService, MunicipiosService>();
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IAnomaliaService, AnomaliaService>();
builder.Services.AddScoped<JwtTokenGenerator>();
builder.Services.AddScoped<GoogleOAuth2Service>();
// DbContext para PostgreSQL (Usuarios)
builder.Services.AddDbContext<ObservatorioDbContext>(options => options.UseNpgsql(connectionStringPostgres));

// DbContext para SQL Server (Datos Sanitarios)
builder.Services.AddDbContext<SanitarioDbContext>(options => options.UseSqlServer(connectionStringSqlServer));

builder.Services.AddScoped<IUserRepository, UserRepository>();

// HttpClient para consumir microservicio de AI
builder.Services.AddHttpClient();
builder.Services.AddScoped<HttpClient>();
builder.Services.AddSingleton(aiBaseUrl);
builder.Services
       .AddScoped<ETLJobService>();

// Agregar HttpClientFactory y servicio ETL
builder.Services.AddHttpClient();
builder.Services.AddScoped<IETLProcessorService, ETLProcessorService>();

// Agregar autenticación JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Agregar autorización
builder.Services.AddAuthorization();
builder.Services.AddHangfire(config =>

    config.UseSqlServerStorage(

        connectionStringSqlServer,

        new SqlServerStorageOptions
        {

            CommandBatchMaxTimeout =
                TimeSpan.FromMinutes(5),

            SlidingInvisibilityTimeout =
                TimeSpan.FromMinutes(5),

            QueuePollInterval =
                TimeSpan.Zero,

            UseRecommendedIsolationLevel =
                true,

            DisableGlobalLocks =
                true

        }

    )

);

builder.Services
       .AddHangfireServer();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Console.WriteLine(builder.Configuration["Jwt:Key"]);

var app = builder.Build();
app.UseHangfireDashboard(
    "/hangfire"
);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS must be before HttpsRedirection to avoid blocking preflight requests
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

// Rate Limiting middleware (antes de errores para capturar rate limit)
app.UseMiddleware<RateLimitingMiddleware>();

// Audit Logging middleware (comentado temporalmente para pruebas)
// app.UseMiddleware<AuditLoggingMiddleware>();

// Error middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
RecurringJob.AddOrUpdate<ETLJobService>(
    "etl-observatorio",
    job => job.EjecutarETL(),
    Cron.Daily()
);

app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
