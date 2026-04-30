using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.Extensions.Configuration;

namespace Observatorio.Application.Email;

public class EmailService : IEmailService
{
    private readonly SendGridClient _client;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration)
    {
        var apiKey = configuration["SENDGRID_API_KEY"] ?? 
                     Environment.GetEnvironmentVariable("SENDGRID_API_KEY");
        
        _fromEmail = configuration["FromEmail"] ?? 
                     Environment.GetEnvironmentVariable("FromEmail") ?? 
                     "noreply@observatorio.com";
        
        _fromName = configuration["FromName"] ?? 
                    Environment.GetEnvironmentVariable("FromName") ?? 
                    "Observatorio";

        if (string.IsNullOrEmpty(apiKey))
            throw new InvalidOperationException("SendGrid API Key no configurado");

        _client = new SendGridClient(apiKey);
    }

    public async Task<bool> SendVerificationEmailAsync(string toEmail, string userName, string verificationCode)
    {
        var subject = "Verifica tu correo - Observatorio de Datos";
        var plainTextContent = $"Hola {userName},\n\nTu código de verificación es: {verificationCode}\n\nEste código expira en 24 horas.";
        var htmlContent = $@"
            <h2>Bienvenido a Observatorio de Datos</h2>
            <p>Hola {userName},</p>
            <p>Tu código de verificación es:</p>
            <h1 style='color: #2E86AB;'>{verificationCode}</h1>
            <p>Este código expira en 24 horas.</p>
            <p>Si no solicitaste esta verificación, ignora este correo.</p>";

        return await SendEmailAsync(toEmail, userName, subject, plainTextContent, htmlContent);
    }

    public async Task<bool> SendTwoFactorEmailAsync(string toEmail, string userName, string twoFactorCode)
    {
        var subject = "Tu código de autenticación - Observatorio de Datos";
        var plainTextContent = $"Hola {userName},\n\nTu código de autenticación es: {twoFactorCode}\n\nEste código expira en 5 minutos.";
        var htmlContent = $@"
            <h2>Autenticación de Doble Factor</h2>
            <p>Hola {userName},</p>
            <p>Tu código de autenticación es:</p>
            <h1 style='color: #2E86AB;'>{twoFactorCode}</h1>
            <p>Este código expira en 5 minutos.</p>
            <p>Si no solicitaste este código, ignora este correo.</p>";

        return await SendEmailAsync(toEmail, userName, subject, plainTextContent, htmlContent);
    }

    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var subject = "Restablece tu contraseña - Observatorio de Datos";
        var plainTextContent = $"Para restablecer tu contraseña, haz clic en: {resetLink}";
        var htmlContent = $@"
            <h2>Restablecer Contraseña</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña.</p>
            <p><a href='{resetLink}' style='background-color: #2E86AB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Restablecer Contraseña</a></p>
            <p>Este enlace expira en 1 hora.</p>";

        return await SendEmailAsync(toEmail, "Usuario", subject, plainTextContent, htmlContent);
    }

    public async Task<bool> SendWelcomeEmailAsync(string toEmail, string userName)
    {
        var subject = "¡Bienvenido a Observatorio de Datos!";
        var plainTextContent = $"Hola {userName}, ¡bienvenido a nuestro platform!";
        var htmlContent = $@"
            <h2>¡Bienvenido {userName}!</h2>
            <p>Gracias por registrarte en Observatorio de Datos.</p>
            <p>Puedes comenzar a usar tu cuenta ahora mismo.</p>";

        return await SendEmailAsync(toEmail, userName, subject, plainTextContent, htmlContent);
    }

    private async Task<bool> SendEmailAsync(string toEmail, string toName, string subject, string plainTextContent, string htmlContent)
    {
        try
        {
            var from = new EmailAddress(_fromEmail, _fromName);
            var to = new EmailAddress(toEmail, toName);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

            var response = await _client.SendEmailAsync(msg);

            return response.StatusCode == System.Net.HttpStatusCode.Accepted || 
                   response.StatusCode == System.Net.HttpStatusCode.OK;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error enviando email: {ex.Message}");
            return false;
        }
    }
}
