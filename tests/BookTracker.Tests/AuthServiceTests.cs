using Microsoft.EntityFrameworkCore;
using BookTracker.Application.DTOs;
using BookTracker.Domain.Entities;
using BookTracker.Infrastructure.Data;
using BookTracker.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using FluentAssertions;

namespace BookTracker.Tests;

public class AuthServiceTests
{
    private readonly AppDbContext _context;
    private readonly Mock<IConfiguration> _configMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new AppDbContext(options);

        _configMock = new Mock<IConfiguration>();
        _configMock.Setup(x => x["Jwt:Secret"]).Returns("cE3YXJp9bZGeMA1UoOm4VSI3oAXMGyyO");
        _configMock.Setup(x => x["Jwt:Issuer"]).Returns("BookTracker");
        _configMock.Setup(x => x["Jwt:Audience"]).Returns("BookTrackerUsers");

        _authService = new AuthService(_context, _configMock.Object);
    }

    [Fact]
    public async Task Login_WrongPassword_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var user = new User { 
            Username = "safa", 
            Email = "safa@test.com", 
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct123") 
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var loginDto = new LoginDto("safa@test.com", "wrong_password");

        // Act
        Func<Task> act = async () => await _authService.LoginAsync(loginDto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("The email or password is incorrect.");
    }

    [Fact]
    public async Task Register_NewUser_ShouldSaveSuccessfully()
    {
        // Arrange
        var registerDto = new RegisterDto("newuser", "new@test.com", "Password123!");

        // Act
        var response = await _authService.RegisterAsync(registerDto);

        // Assert
        response.Should().NotBeNull();
        response.Email.Should().Be("new@test.com");
        
        var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == "new@test.com");
        userInDb.Should().NotBeNull();
    }
}