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
        EnsureJwtConfigValid();

        
        var emailNorm = dto.Email.Trim().ToLower();
        var usernameTrim = dto.Username.Trim();

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == emailNorm))
            throw new InvalidOperationException("Bu email zaten kullanılıyor.");

        if (await _context.Users.AnyAsync(u => u.Username == usernameTrim))
            throw new InvalidOperationException("Bu kullanıcı adı zaten kullanılıyor.");

        var user = new User
        {
            Username = usernameTrim,
            Email = emailNorm,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password) 
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user.Id, user.Email);

        return new AuthResponseDto(token, user.Email, user.Username);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var emailNorm = dto.Email.Trim().ToLower();

        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailNorm)
            ?? throw new UnauthorizedAccessException("Email veya şifre hatalı.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email veya şifre hatalı.");

        var token = GenerateJwtToken(user.Id, user.Email);
        return new AuthResponseDto(token, user.Email, user.Username);
    }

    private const string DefaultIssuer = "BookTrackerAPI";
    private const string DefaultAudience = "BookTrackerApp";

    private void EnsureJwtConfigValid()
    {
        var key = _config["Jwt:Key"] ?? _config["Jwt:Secret"];
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Jwt:Key veya Jwt:Secret yapılandırmada tanımlı değil.");
    }

    public string GenerateJwtToken(int userId, string email)
    {
        var raw = _config["Jwt:Key"] ?? _config["Jwt:Secret"] ?? "";
        if (string.IsNullOrWhiteSpace(raw))
            throw new InvalidOperationException("Jwt:Key or Jwt:Secret is missing.");


        var jwtKey = raw.Trim();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        
        var issuer = _config["Jwt:Issuer"] ?? DefaultIssuer;
        var audience = _config["Jwt:Audience"] ?? DefaultAudience;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}