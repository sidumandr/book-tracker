using BookTracker.Domain.Entities;

namespace BookTracker.Application.Interfaces;

public interface IUserBookRepository
{
    Task<List<UserBook>> GetUserBooksAsync(int userId);
    Task<UserBook?> GetUserBookAsync(int userId, int bookId);
    Task<UserBook> AddToLibraryAsync(UserBook userBook);
    Task<UserBook?> UpdateProgressAsync(UserBook userBook);
    Task<bool> RemoveFromLibraryAsync(int userId, int bookId);

}

