** Instalar Docker
https://docs.docker.com/desktop/setup/install/windows-install/
** Instalar SQL Server 2022
https://www.microsoft.com/en-us/evalcenter/download-sql-server-2022
** PostgreSQL
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
** pgAdmin
https://www.pgadmin.org/download/pgadmin-4-windows/
Password: admin123
Port 5434
Extenciones
- Container Tools
- SQL Server (mssql) para configurar La base de datos sql

** levantar el Docker desde /DataBase
docker compose up -d
- Verfiicar que se esten ejecutando
docker ps

** Conectarse a la base de datos SQL server
Instalar extención
SQL Server (mssql)-Microsoft

localhost,1433
user: sa
password: ****


## PostgreSQL
Instalar extención
PostgreSQL - Chris Kolkman

localhost:5434
db: observatorio_public
user: admin
password: admin123

# Observatorio de Datos Sanitarios

## Requisitos previos

### Frontend
**Ejecución**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Bases de datos

**Instalar Docker**

- https://docs.docker.com/desktop/setup/install/windows-install/

**Instalar SQL Server 2022**

- https://www.microsoft.com/en-us/evalcenter/download-sql-server-2022

**PostgreSQL**

- https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
- Password: admin123
- Port: 5433

**Extensiones**

- Container Tools

### Backend

- [.NET 8.0.25 (SDK 8.0.419)] (https://dotnet.microsoft.com/es-es/download/dotnet/8.0

  **Ejecución**

  ```bash
  cd Backend/Observatorio.API
  dotnet run
  ```

  Después de ejecutar, la API estará disponible en:
- ```bash
  API: https://localhost:7083
  Swagger/OpenAPI: https://localhost:7083/swagger
  ```



## Dependencias .NET


Las dependencias se instalan automáticamente con:

```bash

cd Backend
dotnetrestore
```

**Backend/Observatorio.API:**

- Microsoft.AspNetCore.Authentication.JwtBearer (8.0.0)
- DotNetEnv (3.1.1)
- System.IdentityModel.Tokens.Jwt (8.16.0)

**Backend/Observatorio.Application:**

- System.IdentityModel.Tokens.Jwt (8.16.0)
- Microsoft.Extensions.Configuration (8.0.0)
