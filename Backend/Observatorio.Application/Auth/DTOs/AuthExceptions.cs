namespace Observatorio.Application.Auth.DTOs;

public class AuthExceptions
{
    public class UserNotFoundException : Exception
    {
        public UserNotFoundException(string message = "El usuario no está registrado en la base de datos") 
            : base(message)
        {
        }
    }

    public class InvalidPasswordException : Exception
    {
        public InvalidPasswordException(string message = "La contraseña es incorrecta") 
            : base(message)
        {
        }
    }
}
