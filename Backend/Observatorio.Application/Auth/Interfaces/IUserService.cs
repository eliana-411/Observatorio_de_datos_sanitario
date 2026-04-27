using Observatorio.Application.Auth.DTOs;

namespace Observatorio.Application.Auth.Interfaces;

public interface IUserService
{
    Task<UserResponse?> GetUserByIdAsync(int id);
    Task<IEnumerable<UserResponse>> GetAllUsersAsync();
    Task<UserResponse> UpdateUserAsync(int id, UpdateUserRequest request);
    Task DeleteUserAsync(int id);
}
