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

