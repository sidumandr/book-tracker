using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Domain.Entities;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BookTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Email kontrolü
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            throw new InvalidOperationException("Bu email zaten kullanılıyor.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password) // Şifreyi hashle
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user.Id, user.Email);
        return new AuthResponseDto(token, user.Email, user.Username);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email)
            ?? throw new UnauthorizedAccessException("Email veya şifre hatalı.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email veya şifre hatalı.");

        var token = GenerateJwtToken(user.Id, user.Email);
        return new AuthResponseDto(token, user.Email, user.Username);
    }

    public string GenerateJwtToken(int userId, string email)
    {
        // JWT: Header.Payload.Signature formatında güvenli token
        var jwtKey = _config["Jwt:Key"] ?? _config["Jwt:Secret"]
            ?? throw new InvalidOperationException("Jwt:Key veya Jwt:Secret yapılandırmada tanımlı değil.");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}