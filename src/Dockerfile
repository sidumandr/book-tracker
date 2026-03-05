FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["BookTracker.API/BookTracker.API.csproj", "BookTracker.API/"]
COPY ["BookTracker.Application/BookTracker.Application.csproj", "BookTracker.Application/"]
COPY ["BookTracker.Domain/BookTracker.Domain.csproj", "BookTracker.Domain/"]
COPY ["BookTracker.Infrastructure/BookTracker.Infrastructure.csproj", "BookTracker.Infrastructure/"]

RUN dotnet restore "BookTracker.API/BookTracker.API.csproj"

COPY . .

RUN dotnet publish "BookTracker.API/BookTracker.API.csproj" -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "BookTracker.API.dll"]