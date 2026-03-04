namespace BookTracker.Application.DTOs;

public record BookDto(int Id, string Title, string Author, string? ISBN, int PageCount, string? CoverImageUrl);
public record CreateBookDto(string Title, string Author, string? ISBN, int PageCount, string? CoverImageUrl);

public record UserBookDto(
    int Id, int BookId, string Title, string Author,
    string? CoverImageUrl,
    string Status, int? CurrentPage, int PageCount,
    int? Rating, string? Notes, DateTime? StartedAt, DateTime? FinishedAt
);

public record AddToLibraryDto(int BookId, string Status);
public record UpdateProgressDto(string Status, int? CurrentPage, int? Rating, string? Notes);
