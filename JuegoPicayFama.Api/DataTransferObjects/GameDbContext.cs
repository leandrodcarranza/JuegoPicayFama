using JuegoPicayFama.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JuegoPicayFama.Api.Data;

public class GameDbContext : DbContext
{
    public GameDbContext(DbContextOptions<GameDbContext> options) : base(options)
    {
    }

    public DbSet<Player> Players { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<Attempt> Attempts { get; set; }
}