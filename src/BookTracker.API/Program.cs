using System.Text;
using BookTracker.Application.Interfaces;
using BookTracker.Infrastructure.Data;
using BookTracker.Infrastructure.Repositories;
using BookTracker.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Db: pooler-friendly, short timeout, minimal retries
var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseNpgsql(connStr, npgsql =>
    {
        npgsql.CommandTimeout(15);
        npgsql.EnableRetryOnFailure();
    });
});

builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IUserBookRepository, UserBookRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

// JWT (env: Jwt__Key or Jwt__Secret; Render may replace + with space)
var jwtRaw = builder.Configuration["Jwt:Key"] ?? builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Key or Jwt:Secret required (Render: Jwt__Key).");
var jwtKey = jwtRaw.Trim().Replace(' ', '+');
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Issuer"]) ? "BookTrackerAPI" : builder.Configuration["Jwt:Issuer"]!.Trim(),
            ValidAudience = string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Audience"]) ? "BookTrackerApp" : builder.Configuration["Jwt:Audience"]!.Trim(),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("App", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrEmpty(origin)) return false;
            try
            {
                var host = new Uri(origin).Host.ToLowerInvariant();
                if (host.EndsWith("vercel.app")) return true;
                if (host is "localhost" or "127.0.0.1") return true;
                return false;
            }
            catch { return false; }
        }).AllowAnyMethod().AllowAnyHeader().SetPreflightMaxAge(TimeSpan.FromSeconds(86400));
    });
});

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(opt => opt.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization", Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer", BearerFormat = "JWT", In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });
    opt.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        { new Microsoft.OpenApi.Models.OpenApiSecurityScheme { Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } }, Array.Empty<string>() }
    });
});

var app = builder.Build();

// Warm DB in background so first request is fast (no blocking)
app.Lifetime.ApplicationStarted.Register(() =>
{
    _ = Task.Run(async () =>
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.CanConnectAsync();
        }
        catch { /* ignore */ }
    });
});

app.UseSwagger();
app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookTracker API"); });
app.UseCors("App");
app.UseRouting();

app.Use(async (context, next) =>
{
    try { await next(context); }
    catch (Exception ex)
    {
        if (context.Response.HasStarted) throw;
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var raw = ex.Message + (ex.InnerException?.Message ?? "");
        var msg = ex is TimeoutException || ex.InnerException is TimeoutException || raw.Contains("timeout", StringComparison.OrdinalIgnoreCase)
            ? "Veritabanı bağlantısı zaman aşımı. Tekrar deneyin."
            : raw.Contains("transient", StringComparison.OrdinalIgnoreCase)
            ? "Veritabanı bağlantısı kurulamadı. Bağlantı bilgilerini kontrol edin."
            : ex.Message;
        await context.Response.WriteAsJsonAsync(new { message = msg });
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();
app.MapControllers();

app.Run();
