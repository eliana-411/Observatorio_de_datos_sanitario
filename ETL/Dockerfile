FROM python:3.11-slim
WORKDIR /app

# Dependencias del sistema para pyodbc (SQL Server) y psycopg2 (PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl gnupg unixodbc-dev \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list \
       > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql17 \
    && rm -rf /var/lib/apt/lists/*

COPY ../requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
