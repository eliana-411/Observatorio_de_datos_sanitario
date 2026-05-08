#!/usr/bin/env python3
"""
Script de validación de vistas del DW para el microservicio AI.

Este script verifica que las vistas vw_brotes, vw_demanda y vw_anomalias
estén creadas y funcionando correctamente en el DW.
"""

import pandas as pd
from utils.config import settings
from utils.database import get_sqlserver_engine


def test_vista(vista_nombre: str, query: str) -> bool:
    """Prueba una vista ejecutando una consulta simple."""
    try:
        engine = get_sqlserver_engine()
        df = pd.read_sql(query, engine)
        print(f"✅ {vista_nombre}: {len(df)} registros encontrados")
        if len(df) > 0:
            print(f"   Columnas: {list(df.columns)}")
            print(f"   Primer registro: {df.iloc[0].to_dict()}")
        return True
    except Exception as e:
        print(f"❌ {vista_nombre}: Error - {e}")
        return False


def main():
    """Valida todas las vistas del DW."""
    print("🔍 Validando vistas del Data Warehouse...\n")

    departamento = settings.DEPARTAMENTO.strip()
    dept_filter = f"WHERE departamento = '{departamento}' " if departamento else ""

    # Pruebas de vistas
    pruebas = [
        ("vw_brotes", f"SELECT TOP 5 * FROM vw_brotes {dept_filter}"),
        ("vw_demanda", f"SELECT TOP 5 * FROM vw_demanda {dept_filter}"),
        ("vw_anomalias", f"SELECT TOP 5 * FROM vw_anomalias {dept_filter}"),
    ]

    resultados = []
    for vista, query in pruebas:
        exito = test_vista(vista, query)
        resultados.append(exito)
        print()

    # Resumen
    exitos = sum(resultados)
    total = len(resultados)

    print("📊 Resumen de validación:")
    print(f"   Vistas probadas: {total}")
    print(f"   Vistas exitosas: {exitos}")
    print(f"   Vistas fallidas: {total - exitos}")

    if exitos == total:
        print("🎉 Todas las vistas están funcionando correctamente!")
        return True
    else:
        print("⚠️  Algunas vistas necesitan revisión.")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)