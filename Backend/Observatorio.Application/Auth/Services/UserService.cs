using BCrypt.Net;
using Observatorio.Application.Auth.DTOs;
using Observatorio.Application.Auth.Interfaces;
using Observatorio.Infrastructure.Data.Repositories;

namespace Observatorio.Application.Auth.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserResponse?> GetUserByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return null;

        return MapToUserResponse(user);
    }

    public async Task<IEnumerable<UserResponse>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToUserResponse).ToList();
    }

    public async Task<UserResponse> UpdateUserAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw new InvalidOperationException($"Usuario con ID {id} no encontrado");

        if (!string.IsNullOrEmpty(request.Name))
            user.Name = request.Name;

        if (!string.IsNullOrEmpty(request.Email))
            user.Email = request.Email;

        if (!string.IsNullOrEmpty(request.Password))
        {
            if (request.Password.Length < 6)
                throw new InvalidOperationException("La contraseña debe tener al menos 6 caracteres");
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        await _userRepository.UpdateAsync(user);
        return MapToUserResponse(user);
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            throw new InvalidOperationException($"Usuario con ID {id} no encontrado");

        await _userRepository.DeleteAsync(id);
    }

    private static UserResponse MapToUserResponse(Domain.Entities.User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }
}
