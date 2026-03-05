namespace BookTracker.Domain.Entities;

public class UserBook
{
    public int Id {get; set;}
    public int UserId {get; set;}
    public int BookId {get; set;}
    public ReadingStatus Status {get; set;} = ReadingStatus.WantToRead;
    public int? CurrentPage {get; set;}
    public int? Rating {get; set;}
    public string? Notes {get; set;}
    public DateTime? StartedAt {get; set;}
    public DateTime? FinishedAt {get; set;}
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    public User User {get; set;} = null!;
    public Book Book {get; set;} = null!;

}


// status enum
public enum ReadingStatus
{
    WantToRead = 0,
    Reading = 1,
    Finished = 2,
    Dropped = 3
}