using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService authService, IWebHostEnvironment env)
    {
        _authService = authService;
        _env = env;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message == "Bu email zaten kullanılıyor." || ex.Message == "Bu kullanıcı adı zaten kullanılıyor.")
                return BadRequest(new { message = ex.Message });
            return StatusCode(500, new { message = ex.Message });
        }
        catch (InvalidCastException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException is Npgsql.PostgresException pg && pg.SqlState == "23505")
            {
                if (pg.ConstraintName == "IX_Users_Email")
                    return BadRequest(new { message = "Bu email zaten kullanılıyor." });
                if (pg.ConstraintName == "IX_Users_Username")
                    return BadRequest(new { message = "Bu kullanıcı adı zaten kullanılıyor." });
            }
            return StatusCode(500, new { message = ex.InnerException?.Message ?? ex.Message });
        }
        catch (Exception ex)
        {
            var raw = ex.Message + (ex.InnerException != null ? " " + ex.InnerException.Message : "");
            var msg = raw.Contains("transient", StringComparison.OrdinalIgnoreCase)
                ? "Veritabanı bağlantısı kurulamadı. Supabase açık mı, şifre doğru mu kontrol edin."
                : ex.Message;
            if (_env.IsDevelopment())
                return StatusCode(500, new { message = msg, detail = ex.ToString() });
            return StatusCode(500, new { message = msg });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            var raw = ex.Message + (ex.InnerException != null ? " " + ex.InnerException.Message : "");
            var msg = raw.Contains("transient", StringComparison.OrdinalIgnoreCase)
                ? "Veritabanı bağlantısı kurulamadı. Lütfen tekrar deneyin."
                : ex.Message;
            if (_env.IsDevelopment())
                return StatusCode(500, new { message = msg, detail = ex.ToString() });
            return StatusCode(500, new { message = msg });
        }
    }
}

