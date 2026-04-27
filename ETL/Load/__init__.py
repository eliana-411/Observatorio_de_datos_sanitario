"""
Módulo LOAD del ETL
Responsable de cargar datos transformados a la base de datos
"""
from Load.loader import DatabaseLoader, load_to_database

__all__ = ['DatabaseLoader', 'load_to_database']
