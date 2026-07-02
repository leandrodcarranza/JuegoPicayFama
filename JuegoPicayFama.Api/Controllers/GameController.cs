using JuegoPicayFama.Api.DataTransferObjects;
using JuegoPicayFama.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JuegoPicayFama.Api.Controllers;

[ApiController]
[Route("api/game/v1")]
public class GameController : ControllerBase
{
    private readonly IGameService _gameService;

    public GameController(IGameService gameService)
    {
        _gameService = gameService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterPlayerRequest request)
    {
        try
        {
            var response = await _gameService.RegisterPlayerAsync(request);

            if (response == null)
            {
                return BadRequest(new
                {
                    message = "Los datos ingresados son inválidos o el email ya se encuentra registrado."
                });
            }

            return Ok(response);
        }
        catch
        {
            return StatusCode(500, new
            {
                message = "Ocurrió un error interno al registrar el jugador."
            });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        try
        {
            var response = await _gameService.LoginAsync(request);

            if (response == null)
            {
                return BadRequest(new
                {
                    message = "Email o contraseña incorrectos."
                });
            }

            return Ok(response);
        }
        catch
        {
            return StatusCode(500, new
            {
                message = "Ocurrió un error interno al iniciar sesión."
            });
        }
    }

    [Authorize]
    [HttpPost("start")]
    public async Task<IActionResult> Start()
    {
        try
        {
            var playerIdClaim = User.FindFirst("playerId")?.Value;

            if (string.IsNullOrWhiteSpace(playerIdClaim))
            {
                return Unauthorized(new
                {
                    message = "Token inválido o sin playerId."
                });
            }

            var playerId = int.Parse(playerIdClaim);

            var response = await _gameService.StartGameAsync(playerId);

            if (response == null)
            {
                return NotFound(new
                {
                    message = "No se encontró el jugador."
                });
            }

            return Ok(response);
        }
        catch
        {
            return StatusCode(500, new
            {
                message = "Ocurrió un error interno al iniciar el juego."
            });
        }
    }

    [Authorize]
    [HttpPost("guess")]
    public async Task<IActionResult> Guess(GuessNumberRequest request)
    {
        try
        {
            var playerIdClaim = User.FindFirst("playerId")?.Value;

            if (string.IsNullOrWhiteSpace(playerIdClaim))
            {
                return Unauthorized(new
                {
                    message = "Token inválido o sin playerId."
                });
            }

            var playerId = int.Parse(playerIdClaim);

            var response = await _gameService.GuessNumberAsync(playerId, request);

            if (response == null)
            {
                return NotFound(new
                {
                    message = "No se encontró el juego solicitado."
                });
            }

            return Ok(response);
        }
        catch
        {
            return StatusCode(500, new
            {
                message = "Ocurrió un error interno al procesar el intento."
            });
        }
    }
    [Authorize]
    [HttpGet("history/{gameId}")]
    public async Task<IActionResult> GetHistory(int gameId)
    {
        try
        {
            var playerIdClaim = User.FindFirst("playerId")?.Value;
            if (string.IsNullOrWhiteSpace(playerIdClaim))
                return Unauthorized(new { message = "Token inválido." });

            var playerId = int.Parse(playerIdClaim);
            var response = await _gameService.GetGameHistoryAsync(playerId, gameId);

            if (response == null)
                return NotFound(new { message = "Juego no encontrado." });

            return Ok(response);
        }
        catch
        {
            return StatusCode(500, new { message = "Error interno." });
        }
    }
    [Authorize]
    [HttpPost("abandon/{gameId}")]
    public async Task<IActionResult> Abandon(int gameId)
    {
        try
        {
            var playerIdClaim = User.FindFirst("playerId")?.Value;
            if (string.IsNullOrWhiteSpace(playerIdClaim))
                return Unauthorized(new { message = "Token inválido." });

            var playerId = int.Parse(playerIdClaim);
            var result = await _gameService.AbandonGameAsync(playerId, gameId);

            if (!result)
                return NotFound(new { message = "Juego no encontrado." });

            return Ok(new { message = "Juego abandonado." });
        }
        catch
        {
            return StatusCode(500, new { message = "Error interno." });
        }
    }
}