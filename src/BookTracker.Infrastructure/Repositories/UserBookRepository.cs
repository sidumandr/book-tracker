using BookTracker.Application.Interfaces;
using BookTracker.Domain.Entities;
using BookTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookTracker.Infrastructure.Repositories;

public class UserBookRepository : IUserBookRepository
{
    private readonly AppDbContext _context;

    public UserBookRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserBook>> GetUserBooksAsync(int userId)
        => await _context.UserBooks
            .Include(ub => ub.Book)   
            .Where(ub => ub.UserId == userId)
            .ToListAsync();

    public async Task<UserBook?> GetUserBookAsync(int userId, int bookId)
        => await _context.UserBooks
            .Include(ub => ub.Book)
            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == bookId);

    public async Task<UserBook> AddToLibraryAsync(UserBook userBook)
    {
        _context.UserBooks.Add(userBook);
        await _context.SaveChangesAsync();
        return userBook;
    }

    public async Task<UserBook?> UpdateProgressAsync(UserBook userBook)
    {
        var existing = await _context.UserBooks
            .FirstOrDefaultAsync(ub => ub.UserId == userBook.UserId && ub.BookId == userBook.BookId);
        
        if (existing is null) return null;

        existing.Status = userBook.Status;
        existing.CurrentPage = userBook.CurrentPage;
        existing.Rating = userBook.Rating;
        existing.Notes = userBook.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        
        if (userBook.Status == ReadingStatus.Reading && existing.StartedAt is null)
            existing.StartedAt = DateTime.UtcNow;

        
        if (userBook.Status == ReadingStatus.Finished && existing.FinishedAt is null)
            existing.FinishedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> RemoveFromLibraryAsync(int userId, int bookId)
    {
        var userBook = await _context.UserBooks
            .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BookId == bookId);
        
        if (userBook is null) return false;

        _context.UserBooks.Remove(userBook);
        await _context.SaveChangesAsync();
        return true;
    }
}