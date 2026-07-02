using JuegoPicayFama.Api.DataTransferObjects;

namespace JuegoPicayFama.Api.Services;

public interface IGameService
{
    Task<TokenResponse?> RegisterPlayerAsync(RegisterPlayerRequest request);
    Task<TokenResponse?> LoginAsync(LoginRequest request);
    Task<StartGameResponse?> StartGameAsync(int playerId);
    Task<GuessNumberResponse?> GuessNumberAsync(int playerId, GuessNumberRequest request);
    Task<GameHistoryResponse?> GetGameHistoryAsync(int playerId, int gameId);
    Task<bool> AbandonGameAsync(int playerId, int gameId);
}