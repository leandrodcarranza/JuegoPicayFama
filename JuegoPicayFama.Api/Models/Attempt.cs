namespace JuegoPicayFama.Api.Models;

public class Attempt
{
    public int Id { get; set; }
    public int GameId { get; set; }
    public Game? Game { get; set; }

    public string AttemptedNumber { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int Picas { get; set; }
    public int Famas { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}