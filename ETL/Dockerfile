# Debian 12 (bookworm) — compatible con el repositorio de Microsoft para msodbcsql18
FROM python:3.11-slim-bookworm
WORKDIR /app

# Dependencias del sistema para pyodbc (SQL Server) y psycopg2 (PostgreSQL)
# gpg reemplaza al obsoleto apt-key
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl gnupg unixodbc-dev \
    && mkdir -p /usr/share/keyrings \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc \
       | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] \
       https://packages.microsoft.com/debian/12/prod bookworm main" \
       > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt está en la raíz del contexto (.)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar solo los archivos del ETL al workdir
COPY ETL/ .

CMD ["python", "main.py"]
