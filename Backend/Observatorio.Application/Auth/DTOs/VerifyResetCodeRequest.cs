using System.ComponentModel.DataAnnotations;

namespace Observatorio.Application.Auth.DTOs;

public class VerifyResetCodeRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, RegularExpression(@"^\d{6}$", ErrorMessage = "El código debe tener 6 dígitos")]
    public string Code { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;

    [Required, Compare(nameof(NewPassword))]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}