using BookTracker.Application.Interfaces;
using BookTracker.Domain.Entities;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;


public class BookRepository : IBookRepository
{
    private readonly AppDbContext _context;

    // ctor
    public BookRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Book>> GetAllAsync()
        => await _context.Books.ToListAsync();

    public async Task<Book?> GetByIdAsync(int id)
        => await _context.Books.FindAsync(id);

    public async Task<Book> CreateAsync(Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return book;
    }

    public async Task<Book?> UpdateAsync(Book book)
    {
        var existing = await _context.Books.FindAsync(book.Id);
        if (existing is null) return null;

        existing.Title = book.Title;
        existing.Author = book.Author;
        existing.ISBN = book.ISBN;
        existing.PageCount = book.PageCount;
        existing.CoverImageUrl = book.CoverImageUrl;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book is null) return false;

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return true;
    }
}