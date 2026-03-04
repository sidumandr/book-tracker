using BookTracker.Application.DTOs;
using BookTracker.Application.Interfaces;
using BookTracker.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class BooksController : ControllerBase
{
    private readonly IBookRepository _repo;

    public BooksController(IBookRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<ActionResult<List<BookDto>>> GetAll()
    {
        var books = await _repo.GetAllAsync();
        return Ok(books.Select(b => new BookDto(
            b.Id, b.Title, b.Author, b.ISBN, b.PageCount, b.CoverImageUrl)));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookDto>> GetById(int id)
    {
        var book = await _repo.GetByIdAsync(id);
        if (book is null) return NotFound();
        return Ok(new BookDto(book.Id, book.Title, book.Author, book.ISBN, book.PageCount, book.CoverImageUrl));
    }


    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<ActionResult> SearchBooks([FromQuery] string query)
    {
        if(string.IsNullOrWhiteSpace(query))
            return BadRequest(new { message  = "Arama terimi boş olamaz."});

        using var httpClient = new HttpClient();
        var url = $"https://openlibrary.org/search.json?q={Uri.EscapeDataString(query)}&limit=10&fields=key,title,author_name,isbn,number_of_pages_median,cover_i";

        var response = await httpClient.GetStringAsync(url);
        return Content(response, "application/json");
    
    }


    [HttpPost]
    public async Task<ActionResult<BookDto>> Create(CreateBookDto dto)
    {
        var book = new Book
        {
            Title = dto.Title, Author = dto.Author,
            ISBN = dto.ISBN, PageCount = dto.PageCount,
            CoverImageUrl = dto.CoverImageUrl
        };
        var created = await _repo.CreateAsync(book);
        return CreatedAtAction(nameof(GetById), new { id = created.Id },
            new BookDto(created.Id, created.Title, created.Author, created.ISBN, created.PageCount, created.CoverImageUrl));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _repo.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }
}