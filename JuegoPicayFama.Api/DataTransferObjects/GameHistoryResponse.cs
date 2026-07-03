namespace JuegoPicayFama.Api.DataTransferObjects;

public class GameHistoryResponse
{
    public int GameId { get; set; }
    public bool IsFinished { get; set; }
    public List<AttemptDto> Attempts { get; set; } = new();
}

public class AttemptDto
{
    public string AttemptedNumber { get; set; } = string.Empty;
    public int Famas { get; set; }
    public int Picas { get; set; }
    public string Message { get; set; } = string.Empty;
}
