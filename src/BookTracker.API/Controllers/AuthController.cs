using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookTracker.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
            
            if (ex.Message == "Bu email zaten kullanılıyor.")
                return BadRequest(new { message = ex.Message });
            return StatusCode(500, new { message = ex.Message });
        }
        catch (InvalidCastException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            var raw = ex.Message + (ex.InnerException != null ? " " + ex.InnerException.Message : "");
            var msg = raw.Contains("transient", StringComparison.OrdinalIgnoreCase)
                ? "Veritabanı bağlantısı kurulamadı. Supabase açık mı, şifre doğru mu kontrol edin."
                : ex.Message;
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
            return StatusCode(500, new { message = msg });
        }
    }
}

