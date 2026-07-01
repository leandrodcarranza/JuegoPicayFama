namespace JuegoPicayFama.Api.Models;

public class Game
{
    public int Id { get; set; }
    public int PlayerId { get; set; }
    public Player? Player { get; set; }

    public string SecretNumber { get; set; } = string.Empty;
    public bool IsFinished { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Attempt> Attempts { get; set; } = new();
}