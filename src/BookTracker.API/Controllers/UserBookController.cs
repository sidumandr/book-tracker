using System.Security.Claims;
using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserBookController : ControllerBase
{
    private readonly IUserBookRepository _repo;

    public UserBookController(IUserBookRepository repo)
    {
        _repo = repo;
    }

    private int? GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(id, out var uid) ? uid : null;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserBookDto>>> GetMyBooks()
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized(new { message = "Geçersiz oturum. Tekrar giriş yapın." });

        try
        {
            var userBooks = await _repo.GetUserBooksAsync(userId.Value);
            var dtos = userBooks
                .Where(ub => ub.Book != null)
                .Select(ub => new UserBookDto(
                    ub.Id,
                    ub.BookId,
                    ub.Book!.Title,
                    ub.Book.Author,
                    ub.Book.CoverImageUrl,
                    ub.Status.ToString(),
                    ub.CurrentPage,
                    ub.Book.PageCount,
                    ub.Rating,
                    ub.Notes,
                    ub.StartedAt,
                    ub.FinishedAt
                ))
                .ToList();
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<UserBookDto>> AddToLibrary(AddToLibraryDto dto)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized(new { message = "Geçersiz oturum. Tekrar giriş yapın." });

        var existing = await _repo.GetUserBookAsync(userId.Value, dto.BookId);
        if (existing is not null)
            return BadRequest(new { message = "Bu kitap zaten kütüphanenizde." });

        var userBook = new UserBook
        {
            UserId = userId.Value,
            BookId = dto.BookId,
            Status = Enum.Parse<ReadingStatus>(dto.Status)
        };

        var created = await _repo.AddToLibraryAsync(userBook);
        return Ok(new { message = "Kitap kütüphaneye eklendi.", id = created.Id });
    }

    [HttpPut("{bookId}")]
    public async Task<ActionResult<UserBookDto>> UpdateProgress(int bookId, UpdateProgressDto dto)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized(new { message = "Geçersiz oturum. Tekrar giriş yapın." });

        var userBook = new UserBook
        {
            UserId = userId.Value,
            BookId = bookId,
            Status = Enum.Parse<ReadingStatus>(dto.Status),
            CurrentPage = dto.CurrentPage,
            Rating = dto.Rating,
            Notes = dto.Notes
        };

        var updated = await _repo.UpdateProgressAsync(userBook);
        if (updated is null) return NotFound(new { message = "Kitap kütüphanenizde bulunamadı." });

        return Ok(new { message = "İlerleme güncellendi." });
    }

    [HttpDelete("{bookId}")]
    public async Task<IActionResult> RemoveFromLibrary(int bookId)
    {
        var userId = GetUserId();
        if (userId is null)
            return Unauthorized(new { message = "Geçersiz oturum. Tekrar giriş yapın." });
        var success = await _repo.RemoveFromLibraryAsync(userId.Value, bookId);
        return success ? NoContent() : NotFound(new { message = "Kitap kütüphanenizde bulunamadı." });
    }
}