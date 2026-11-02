using System.Diagnostics;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Fijar Kestrel únicamente en localhost (no expone puertos a la red LAN por seguridad y evita prompt del Firewall de Windows)
builder.WebHost.UseUrls("http://127.0.0.1:5123");

// Reducir logging innecesario en consola para ahorrar I/O en PCs modestas
builder.Logging.SetMinimumLevel(LogLevel.Warning);

// 2. Configurar ruta de SQLite en AppData\Local\MicroPos
var appDataPath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
    "MicroPos"
);
Directory.CreateDirectory(appDataPath);
var dbPath = Path.Combine(appDataPath, "micropos.db");

// Connection String con Pooling activado
var connectionString = new SqliteConnectionStringBuilder
{
    DataSource = dbPath,
    Mode = SqliteOpenMode.ReadWriteCreate,
    Cache = SqliteCacheMode.Shared,
}.ToString();

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

// 3. Configurar CORS para permitir peticiones desde Vite (dev) y WebView2 (producción)
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "TauriCors",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:1420",
                    "http://127.0.0.1:1420",
                    "http://tauri.localhost",
                    "https://tauri.localhost"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    );
});

var app = builder.Build();
app.UseCors("TauriCors");

// 4. Inicializar Base de Datos y aplicar PRAGMAs de alto rendimiento (Modo WAL)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    // PRAGMAs críticos para discos mecánicos (HDD) o SSDs económicos:
    // - journal_mode=WAL: Lecturas y escrituras ocurren en paralelo sin bloquear la base de datos.
    // - synchronous=NORMAL: Seguro contra caídas del sistema en modo WAL, pero hasta 5x más rápido en escrituras.
    // - temp_store=MEMORY: Tablas temporales e índices intermedios se procesan en RAM.
    db.Database.ExecuteSqlRaw("PRAGMA journal_mode=WAL;");
    db.Database.ExecuteSqlRaw("PRAGMA synchronous=NORMAL;");
    db.Database.ExecuteSqlRaw("PRAGMA temp_store=MEMORY;");
}

// 5. Endpoint de Healthcheck y Diagnóstico
app.MapGet(
    "/api/health",
    (AppDbContext db) =>
    {
        using var proc = Process.GetCurrentProcess();
        var journalMode = db
            .Database.SqlQueryRaw<string>("PRAGMA journal_mode;")
            .AsEnumerable()
            .FirstOrDefault();

        return Results.Ok(
            new
            {
                status = "online",
                engine = ".NET 10 Minimal API",
                pid = Environment.ProcessId,
                memoryMb = Math.Round(proc.WorkingSet64 / 1024.0 / 1024.0, 2),
                sqliteMode = journalMode?.ToUpperInvariant() ?? "UNKNOWN",
                databasePath = dbPath,
                timestamp = DateTime.UtcNow,
            }
        );
    }
);

app.Run();

// DbContext base (se moverá a Database/AppDbContext.cs al agregar las entidades del MVP)
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options) { }
