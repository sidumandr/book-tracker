namespace BookTracker.Domain.Entities;

public class Book
{
    public int Id {get; set;} //pk
    public string Title {get; set;} = string.Empty;
    public string Author {get; set;} = string.Empty;
    public string? ISBN {get; set;}
    public int PageCount {get; set;}
    public string? CoverImageUrl {get; set;}
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    //nav prop
    public ICollection<UserBook> UserBooks {get; set;} = new List<UserBook>();

}

