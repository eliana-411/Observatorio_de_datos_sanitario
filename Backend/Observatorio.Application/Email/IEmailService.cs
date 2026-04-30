namespace Observatorio.Application.Email;

public interface IEmailService
{
    Task<bool> SendVerificationEmailAsync(string toEmail, string userName, string verificationCode);
    Task<bool> SendTwoFactorEmailAsync(string toEmail, string userName, string twoFactorCode);
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetLink);
    Task<bool> SendWelcomeEmailAsync(string toEmail, string userName);
}
