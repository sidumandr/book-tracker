using System.Text;
using BookTracker.Application.Interfaces;
using BookTracker.Infrastructure.Data;
using BookTracker.Infrastructure.Repositories;
using BookTracker.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;


var builder = WebApplication.CreateBuilder(args);

// db
builder.Services.AddDbContext<AppDbContext>(opt => 
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// di
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IUserBookRepository, UserBookRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

// jwt (use Jwt__Key or Jwt__Secret on Render)
var jwtSecret = builder.Configuration["Jwt:Key"] ?? builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Key veya Jwt:Secret yapılandırmada tanımlı değil (Render env: Jwt__Key / Jwt__Secret).");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
       opt.TokenValidationParameters = new TokenValidationParameters
       {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Issuer"]) ? "BookTrackerAPI" : builder.Configuration["Jwt:Issuer"],
        ValidAudience = string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Audience"]) ? "BookTrackerApp" : builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)) 
       };
    });

// cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProductionPolicy", policy =>
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
            })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .SetPreflightMaxAge(TimeSpan.FromSeconds(86400));
    });
});

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(opt => opt.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);
builder.Services.AddEndpointsApiExplorer();

// swagger
builder.Services.AddSwaggerGen(opt =>
{
    opt.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Bearer TOKEN şeklinde girin."
    });
    opt.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// dev only: check db connection on startup
if (app.Environment.IsDevelopment())
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (!await db.Database.CanConnectAsync())
            Console.WriteLine("[WARN] Could not connect to db. Check ConnectionStrings and Supabase.");
    }
    catch (Exception ex)
    {
        Console.WriteLine("[WARN] Db connection: " + ex.Message);
    }
}

app.UseSwagger();
app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookTracker API V1"); });

app.UseCors("ProductionPolicy");
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// health check for connectivity (no auth)
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();

app.MapControllers();
app.Run();