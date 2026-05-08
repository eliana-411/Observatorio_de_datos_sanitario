#!/usr/bin/env python3
"""
Script de validación de conexiones a bases de datos.

Este script verifica que las conexiones a SQL Server y PostgreSQL
estén funcionando correctamente para el microservicio AI.
"""

import sys
from sqlalchemy import text
from utils.config import settings
from utils.database import get_sqlserver_engine, get_postgres_engine


def test_sqlserver_connection():
    """Prueba la conexión a SQL Server."""
    try:
        engine = get_sqlserver_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT @@VERSION as version"))
            version = result.fetchone()[0]
            print("✅ SQL Server: Conexión exitosa")
            print(f"   Versión: {version[:50]}...")
            return True
    except Exception as e:
        print(f"❌ SQL Server: Error de conexión - {e}")
        return False


def test_postgres_connection():
    """Prueba la conexión a PostgreSQL."""
    try:
        engine = get_postgres_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print("✅ PostgreSQL: Conexión exitosa")
            print(f"   Versión: {version[:50]}...")
            return True
    except Exception as e:
        print(f"❌ PostgreSQL: Error de conexión - {e}")
        return False


def test_database_exists():
    """Verifica que la base de datos ObservatorioDW existe."""
    try:
        engine = get_sqlserver_engine()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT name FROM sys.databases WHERE name = 'ObservatorioDW'"))
            exists = result.fetchone() is not None
            if exists:
                print("✅ Base de datos 'ObservatorioDW' existe")
                return True
            else:
                print("❌ Base de datos 'ObservatorioDW' no existe")
                return False
    except Exception as e:
        print(f"❌ Error verificando base de datos - {e}")
        return False


def main():
    """Ejecuta todas las pruebas de conexión."""
    print("🔍 Validando conexiones a bases de datos...\n")

    tests = [
        ("SQL Server", test_sqlserver_connection),
        ("PostgreSQL", test_postgres_connection),
        ("Base de datos DW", test_database_exists),
    ]

    results = []
    for name, test_func in tests:
        print(f"Probando {name}...")
        success = test_func()
        results.append(success)
        print()

    # Resumen
    successes = sum(results)
    total = len(results)

    print("📊 Resumen de conexiones:")
    print(f"   Pruebas realizadas: {total}")
    print(f"   Conexiones exitosas: {successes}")
    print(f"   Conexiones fallidas: {total - successes}")

    if successes == total:
        print("🎉 Todas las conexiones están funcionando!")
        return True
    else:
        print("⚠️  Algunas conexiones necesitan configuración.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)