from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from utils.config import settings


def get_sqlserver_engine() -> Engine:
    """Crea un engine de SQL Server usando la cadena de conexión de entorno."""
    conn_value = settings.SQLSERVER_CONN
    if conn_value.strip().upper().startswith("DRIVER="):
        connection_url = f"mssql+pyodbc:///?odbc_connect={quote_plus(conn_value)}"
    else:
        connection_url = conn_value

    return create_engine(connection_url, echo=False, future=True)


def get_postgres_engine() -> Engine:
    """Crea un engine de PostgreSQL usando la cadena de conexión de entorno."""
    return create_engine(settings.POSTGRES_CONN, echo=False, future=True)
