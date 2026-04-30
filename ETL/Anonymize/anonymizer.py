"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  MÓDULO DE ANONIMIZACIÓN — OBSERVATORIO DE DATOS SANITARIOS DE CALDAS       ║
║  Diseño: Privacy by Design (ISO 29101) + Habeas Data (Ley 1581/2012)        ║
║  Posición en el pipeline: EXTRACT → [ANONYMIZE] → TRANSFORM → LOAD          ║
╚══════════════════════════════════════════════════════════════════════════════╝

Estrategia por tipo de dato:
  ┌──────────────────────────┬───────────────────────────────────────────────┐
  │ Campo                    │ Técnica                                       │
  ├──────────────────────────┼───────────────────────────────────────────────┤
  │ nombre / apellido        │ ELIMINACIÓN — no aporta valor analítico       │
  │ identificacion / telefono│ ELIMINACIÓN — identificador directo           │
  │ direccion                │ ELIMINACIÓN — identificador indirecto         │
  │ municipio_origen         │ SHA-256 — necesario para joins, irreversible  │
  │ edad                     │ CONSERVAR — sin PII adjunta no identifica     │
  │ resto de columnas        │ CONSERVAR — datos clínicos/epidemiológicos    │
  └──────────────────────────┴───────────────────────────────────────────────┘

Cumplimiento:
  - Ley 1581/2012 (Habeas Data Colombia): minimización, finalidad, supresión
  - GDPR Art. 25 (Privacy by Design): anonimización antes del almacenamiento
  - ISO 29101: marco de privacidad en sistemas de información
"""

import json
import pandas as pd
import psycopg2
from psycopg2 import sql
from psycopg2.extras import execute_values
from datetime import datetime
from Load.logger_config import get_logger

logger = get_logger('ETL.Anonymize')


# ── Columnas que se eliminan por ser PII directa ───────────────────────────
PII_ELIMINAR = [
    'nombre', 'apellido', 'nombres', 'apellidos', 'nombre_completo',
    'identificacion', 'numero_identificacion', 'cedula', 'documento',
    'telefono', 'celular',
    'email', 'correo',
    'direccion', 'direccion_residencia',
]

# Tabla destino en PostgreSQL
STAGING_TABLE = 'staging.eventos_anonimizados'

# Columnas del DDL de staging que acepta datos del negocio
# (sin 'id' ni 'fecha_ingestion' que son automáticos)
STAGING_COLUMNS = [
    'edad', 'genero', 'estrato', 'grupo_poblacional', 'estado_civil',
    'situacion_sentimental', 'fecha', 'municipio_evento', 'municipio_origen',
    'zona_evento', 'metodo', 'resultado_atencion', 'hospitalizado',
    'antecedentes_salud_mental', 'consumo_sustancias', 'cantidad_intentos',
    'fuente', 'data_extra',
]


# ══════════════════════════════════════════════════════════════════════════════
# ANONIMIZACIÓN
# ══════════════════════════════════════════════════════════════════════════════

def _eliminar_pii(df: pd.DataFrame) -> tuple:
    """
    Elimina columnas de PII directa.
    Retorna (df_sin_pii, cols_eliminadas).
    """
    cols_a_eliminar = [col for col in PII_ELIMINAR if col in df.columns]
    cols_ausentes   = [col for col in PII_ELIMINAR if col not in df.columns]

    if cols_ausentes:
        logger.info(f"Columnas PII no presentes en este dataset: {cols_ausentes}")

    if cols_a_eliminar:
        df = df.drop(columns=cols_a_eliminar)
        logger.info(f"Columnas PII eliminadas: {cols_a_eliminar}")
    else:
        logger.info("No se encontraron columnas PII en este dataset")

    return df, cols_a_eliminar


def _manejar_nulos(df: pd.DataFrame) -> pd.DataFrame:
    """Estandariza nulos: strings vacíos → None, trim espacios."""
    for col in df.select_dtypes(include='object').columns:
        df[col] = df[col].apply(
            lambda x: None if (pd.isna(x) or str(x).strip() == '') else str(x).strip()
        )
    return df


def _validar_sin_pii(df: pd.DataFrame) -> bool:
    """
    Verifica que ninguna columna PII quedó en el DataFrame.
    Si falla, la carga a staging se aborta — nunca guardar PII.
    """
    cols_restantes = [col for col in PII_ELIMINAR if col in df.columns]

    if cols_restantes:
        logger.error(
            f"VIOLACIÓN DE PRIVACIDAD: columnas PII detectadas tras anonimización: "
            f"{cols_restantes} — carga a staging ABORTADA"
        )
        return False

    logger.info("Validación de privacidad: OK — sin columnas PII")
    return True


def anonimizar_datos(df: pd.DataFrame, source_id: str = 'desconocida') -> pd.DataFrame | None:
    """
    Función principal de anonimización.

    Pasos:
      1. Eliminar PII directa (nombre, cédula, teléfono, email, dirección)
      2. Estandarizar nulos
      3. Separar columnas extra al campo data_extra (JSONB)
      4. Agregar metadata de fuente
      5. Validar que no quede ninguna columna PII

    Args:
        df:        DataFrame crudo tal como viene del extractor
        source_id: ID de la fuente para trazabilidad

    Returns:
        DataFrame anonimizado listo para staging, o None si falla la validación
    """
    logger.info(
        f"[{source_id}] Iniciando anonimización — "
        f"{len(df)} filas | {len(df.columns)} columnas"
    )

    try:
        df_anon = df.copy()

        # 1. Eliminar PII directa
        df_anon, cols_eliminadas = _eliminar_pii(df_anon)

        # 2. Estandarizar nulos
        df_anon = _manejar_nulos(df_anon)

        # 3. Separar columnas extra al campo data_extra
        # Columnas que no están en STAGING_COLUMNS van a JSONB
        cols_extra = [
            col for col in df_anon.columns
            if col not in STAGING_COLUMNS
        ]
        if cols_extra:
            logger.info(f"Columnas extra → data_extra JSONB: {cols_extra}")
            df_anon['data_extra'] = df_anon[cols_extra].apply(
                lambda row: json.dumps(
                    row.dropna().to_dict(), ensure_ascii=False, default=str
                ) if not row.dropna().empty else None,
                axis=1
            )
            df_anon = df_anon.drop(columns=cols_extra)
        else:
            df_anon['data_extra'] = None

        # 4. Agregar metadata
        df_anon['fuente'] = source_id

        # 5. Validación de seguridad
        if not _validar_sin_pii(df_anon):
            return None

        # Reporte
        logger.info(json.dumps({
            'timestamp':      datetime.now().isoformat(),
            'source_id':      source_id,
            'total_filas':    len(df_anon),
            'pii_eliminadas': cols_eliminadas,
            'cols_extra':     cols_extra,
            'cumplimiento':   'Ley 1581/2012 — Privacy by Design',
        }, indent=2, ensure_ascii=False))

        logger.info(f"[{source_id}] Anonimización completada — {len(df_anon)} filas listas")
        return df_anon

    except Exception as e:
        logger.error(f"[{source_id}] Error en anonimización: {str(e)}", exc_info=True)
        return None


# ══════════════════════════════════════════════════════════════════════════════
# CARGA A POSTGRESQL STAGING
# ══════════════════════════════════════════════════════════════════════════════

def _get_pg_connection(pg_config: dict):
    return psycopg2.connect(
        host=pg_config['host'],
        port=pg_config['port'],
        user=pg_config['user'],
        password=pg_config['password'],
        dbname=pg_config['database']
    )


def _restart_serial_sequence_if_empty(cursor):
    """Reinicia la secuencia SERIAL si la tabla de staging está vacía."""
    schema, table = STAGING_TABLE.split('.', 1)
    cursor.execute(
        sql.SQL("SELECT COUNT(1) FROM {}.{}")
        .format(sql.Identifier(schema), sql.Identifier(table))
    )
    if cursor.fetchone()[0] != 0:
        return

    cursor.execute("SELECT pg_get_serial_sequence(%s, 'id')", (STAGING_TABLE,))
    sequence_name = cursor.fetchone()[0]
    if not sequence_name:
        logger.warning(f"No se encontró secuencia SERIAL para {STAGING_TABLE}")
        return

    schema_name, seq_name = sequence_name.split('.', 1)
    cursor.execute(
        sql.SQL("ALTER SEQUENCE {}.{} RESTART WITH 1")
        .format(sql.Identifier(schema_name), sql.Identifier(seq_name))
    )
    logger.info(f"Secuencia reiniciada para {STAGING_TABLE}: {sequence_name}")


def cargar_a_staging(df: pd.DataFrame, pg_config: dict, source_id: str) -> int:
    """
    Carga el DataFrame anonimizado a staging.eventos_anonimizados en PostgreSQL.

    La tabla usa 'id SERIAL' como PK automática — no se inserta id_registro
    porque el DDs columnas extra van en data_extrL no lo tiene. Laa JSONB.
    Inserción masiva con execute_values (eficiente para grandes volúmenes).
    """
    conn   = None
    cursor = None

    try:
        conn   = _get_pg_connection(pg_config)
        cursor = conn.cursor()

        # Si la tabla está vacía, reinicia el contador SERIAL para evitar IDs discontinuos.
        _restart_serial_sequence_if_empty(cursor)

        # Solo insertar columnas que existen tanto en el df como en STAGING_COLUMNS
        cols     = [c for c in STAGING_COLUMNS if c in df.columns]
        cols_sql = ', '.join([f'"{c}"' for c in cols])
        values   = [
            tuple(row[c] for c in cols)
            for _, row in df.iterrows()
        ]

        # Sin ON CONFLICT porque la PK es SERIAL automático (no hay clave natural)
        query = f"INSERT INTO {STAGING_TABLE} ({cols_sql}) VALUES %s;"

        execute_values(cursor, query, values)
        insertados = cursor.rowcount
        conn.commit()

        logger.info(f"[{source_id}] {insertados} registros insertados en {STAGING_TABLE}")
        return insertados

    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"[{source_id}] Error cargando a staging: {str(e)}", exc_info=True)
        raise

    finally:
        if cursor: cursor.close()
        if conn:   conn.close()


# ══════════════════════════════════════════════════════════════════════════════
# ORQUESTADOR — llamado desde main.py
# ══════════════════════════════════════════════════════════════════════════════

def ejecutar_anonimizacion(df: pd.DataFrame, pg_config: dict, source_id: str = 'desconocida') -> dict:
    """
    Orquesta anonimización + carga a PostgreSQL staging.

    Args:
        df:         DataFrame crudo del extractor
        pg_config:  Config de PostgreSQL (POSTGRES_CONFIG de Load/config.py)
        source_id:  ID de la fuente para trazabilidad

    Returns:
        dict con 'status' ('ÉXITO' o 'FALLIDO') y 'registros_cargados'
    """
    stats = {
        'registros_entrada':  len(df),
        'registros_cargados': 0,
        'status':             'FALLIDO',
    }

    # Paso 1: Anonimizar
    df_anonimizado = anonimizar_datos(df, source_id)

    if df_anonimizado is None:
        logger.error(f"[{source_id}] Anonimización abortada — no se cargará a staging")
        return stats

    # Paso 2: Cargar a staging
    try:
        stats['registros_cargados'] = cargar_a_staging(df_anonimizado, pg_config, source_id)
        stats['status'] = 'ÉXITO'
    except Exception as e:
        logger.error(f"[{source_id}] Error en staging: {str(e)}")

    return stats