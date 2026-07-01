namespace JuegoPicayFama.Api.Models;

public class Player
{
    public int Id { get; set; }
    public string Lastname { get; set; } = string.Empty;
    public string Firstname { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Game> Games { get; set; } = new();
}