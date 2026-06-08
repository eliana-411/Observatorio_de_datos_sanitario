# ── Etapa 1: Build ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Observatorio.Domain/Observatorio.Domain.csproj         Observatorio.Domain/
COPY Observatorio.Application/Observatorio.Application.csproj Observatorio.Application/
COPY Observatorio.Infrastructure/Observatorio.Infrastructure.csproj Observatorio.Infrastructure/
COPY Observatorio.API/Observatorio.API.csproj               Observatorio.API/

RUN dotnet restore Observatorio.API/Observatorio.API.csproj

COPY . .

RUN dotnet publish Observatorio.API/Observatorio.API.csproj \
    -c Release -o /app/publish --no-restore

# ── Etapa 2: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "Observatorio.API.dll"]
