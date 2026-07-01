using GameCore;
using JuegoPicayFama.Api.Data;
using JuegoPicayFama.Api.DataTransferObjects;
using JuegoPicayFama.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JuegoPicayFama.Api.Services;

public class GameService : IGameService
{
    private readonly GameDbContext _context;
    private readonly IConfiguration _configuration;

    public GameService(GameDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<TokenResponse?> RegisterPlayerAsync(RegisterPlayerRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Lastname) ||
            string.IsNullOrWhiteSpace(request.Firstname) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            request.Age <= 0)
        {
            return null;
        }

        var emailExists = await _context.Players.AnyAsync(p => p.Email == request.Email);

        if (emailExists)
        {
            return null;
        }

        var player = new Player
        {
            Lastname = request.Lastname,
            Firstname = request.Firstname,
            Age = request.Age,
            Email = request.Email,
            Password = request.Password,
            CreatedAt = DateTime.UtcNow
        };

        _context.Players.Add(player);
        await _context.SaveChangesAsync();

        return new TokenResponse { Token = GenerateToken(player) };
    }

    public async Task<TokenResponse?> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        var player = await _context.Players
            .FirstOrDefaultAsync(p => p.Email == request.Email && p.Password == request.Password);

        if (player == null)
        {
            return null;
        }

        return new TokenResponse { Token = GenerateToken(player) };
    }

    public async Task<StartGameResponse?> StartGameAsync(int playerId)
    {
        var player = await _context.Players.FindAsync(playerId);

        if (player == null)
        {
            return null;
        }

        var activeGame = await _context.Games
            .FirstOrDefaultAsync(g => g.PlayerId == playerId && !g.IsFinished);

        if (activeGame != null)
        {
            return new StartGameResponse
            {
                GameId = activeGame.Id,
                PlayerId = activeGame.PlayerId,
                CreatedAt = activeGame.CreatedAt
            };
        }

        var game = new Game
        {
            PlayerId = playerId,
            SecretNumber = GenerateSecretNumber(),
            IsFinished = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Games.Add(game);
        await _context.SaveChangesAsync();

        return new StartGameResponse
        {
            GameId = game.Id,
            PlayerId = game.PlayerId,
            CreatedAt = game.CreatedAt
        };
    }

    public async Task<GuessNumberResponse?> GuessNumberAsync(int playerId, GuessNumberRequest request)
    {
        if (request.GameId <= 0 || string.IsNullOrWhiteSpace(request.AttemptedNumber))
        {
            return null;
        }

        if (!IsValidNumber(request.AttemptedNumber))
        {
            return new GuessNumberResponse
            {
                GameId = request.GameId,
                AttemptedNumber = request.AttemptedNumber,
                Message = "El número debe tener 4 dígitos y no debe contener dígitos repetidos."
            };
        }

        var game = await _context.Games
            .FirstOrDefaultAsync(g => g.Id == request.GameId && g.PlayerId == playerId);

        if (game == null)
        {
            return null;
        }

        if (game.IsFinished)
        {
            return new GuessNumberResponse
            {
                GameId = game.Id,
                AttemptedNumber = request.AttemptedNumber,
                Message = $"El juego {game.Id} ya ha finalizado."
            };
        }

        int famas = 0;
        int picas = 0;

        for (int i = 0; i < 4; i++)
        {
            if (request.AttemptedNumber[i] == game.SecretNumber[i])
            {
                famas++;
            }
            else if (game.SecretNumber.Contains(request.AttemptedNumber[i]))
            {
                picas++;
            }
        }

        var result = Evaluator.ValidateAttempt(game.SecretNumber, request.AttemptedNumber);
        string message = result.Message;

        var attempt = new Attempt
        {
            GameId = game.Id,
            AttemptedNumber = request.AttemptedNumber,
            Famas = famas,
            Picas = picas,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };

        _context.Attempts.Add(attempt);

        if (famas == 4)
        {
            game.IsFinished = true;
        }

        await _context.SaveChangesAsync();

        return new GuessNumberResponse
        {
            GameId = game.Id,
            AttemptedNumber = request.AttemptedNumber,
            Message = message
        };
    }

    private bool IsValidNumber(string number)
    {
        return number.Length == 4 &&
               number.All(char.IsDigit) &&
               number.Distinct().Count() == 4;
    }

    private string GenerateSecretNumber()
    {
        var random = new Random();
        var digits = new List<int>();

        while (digits.Count < 4)
        {
            var digit = random.Next(0, 10);

            if (!digits.Contains(digit))
            {
                digits.Add(digit);
            }
        }

        return string.Join("", digits);
    }

    private string GenerateToken(Player player)
    {
        var jwtKey = _configuration["Jwt:Key"]!;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, player.Id.ToString()),
            new Claim("playerId", player.Id.ToString()),
            new Claim(ClaimTypes.Email, player.Email),
            new Claim(ClaimTypes.Name, $"{player.Firstname} {player.Lastname}")
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}