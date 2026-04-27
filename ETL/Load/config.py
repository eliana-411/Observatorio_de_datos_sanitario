"""
Configuración de conexión a Base de Datos
"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración SQL Server
DATABASE_CONFIG = {
    'server': os.getenv('SQLSERVER_HOST', 'localhost'),
    'port': int(os.getenv('SQLSERVER_PORT', 1433)),
    'user': os.getenv('SQLSERVER_USER', 'sa'),
    'password': os.getenv('SQLSERVER_PASSWORD', ''),
    'database': os.getenv('SQLSERVER_DATABASE', 'ObservatorioDW'),
}

# Configuración PostgreSQL (opcional, para datos anonimizados)
POSTGRES_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRES_PORT', 5432)),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', 'admin123'),
    'database': os.getenv('POSTGRES_DB', 'observatorio'),
}

# Configuración de logging
LOGGING_CONFIG = {
    'log_file': 'ETL/Logs/etl_load.log',
    'log_level': 'INFO',
}
