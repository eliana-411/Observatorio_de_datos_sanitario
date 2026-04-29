"""
LOAD PIPELINE - Carga datos transformados a la Base de Datos
Inserta dimensiones y tabla de hechos en SQL Server
"""
import pyodbc
import numpy as np          # ← FIX #1: faltaba este import (causaba el crash)
import pandas as pd
from datetime import datetime
from Load.config import DATABASE_CONFIG
from Load.logger_config import get_logger

logger = get_logger('ETL.Load')


class DatabaseLoader:
    """Gestor de conexión y carga de datos a SQL Server"""

    def __init__(self, config: dict):
        self.config = config
        self.connection = None
        self.cursor = None

    def connect(self):
        """Conecta a la base de datos SQL Server"""
        try:
            connection_string = (
                f"Driver={{ODBC Driver 17 for SQL Server}};"
                f"Server={self.config['server']},{self.config['port']};"
                f"Database={self.config['database']};"
                f"UID={self.config['user']};"
                f"PWD={self.config['password']}"
            )
            self.connection = pyodbc.connect(connection_string)
            self.cursor = self.connection.cursor()
            logger.info(f" Conectado a BD: {self.config['database']} en {self.config['server']}")
        except Exception as e:
            logger.error(f" Error al conectar a BD: {str(e)}")
            raise

    def disconnect(self):
        """Cierra la conexión a la base de datos"""
        if self.connection:
            self.connection.close()
            logger.info(" Desconectado de BD")

    def _execute_query(self, query: str, params: list = None):
        try:
            if params:
                return self.cursor.execute(query, params)
            else:
                return self.cursor.execute(query)
        except Exception as e:
            logger.error(f" Error ejecutando query: {str(e)}\nQuery: {query}")
            raise

    def _to_python_native(self, val):
        """
        FIX #1 (complemento): convierte tipos numpy/pandas a tipos Python
        nativos que pyodbc pueda serializar correctamente.
        También convierte bool a int para columnas BIT de SQL Server.
        """
        if pd.isna(val) if not isinstance(val, (list, dict)) else False:
            return None
        if isinstance(val, (np.integer,)):
            return int(val)
        if isinstance(val, (np.floating,)):
            return float(val)
        if isinstance(val, (np.bool_,)):
            return int(val)          # BIT en SQL Server necesita 0/1, no True/False
        if isinstance(val, bool):
            return int(val)          # FIX #5/#6: bool Python → int para columnas BIT
        if isinstance(val, pd.Timestamp):
            return val.date()        # FIX #4: Timestamp → date para columnas DATE
        return val

    def _get_identity_column(self, table_name: str):
        """Devuelve el nombre de la columna IDENTITY de la tabla, o None."""
        query = f"""
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = '{table_name}'
              AND COLUMNPROPERTY(object_id(TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 1
        """
        self.cursor.execute(query)
        result = self.cursor.fetchone()
        return result[0] if result else None

    def _get_unique_columns(self, table_name: str) -> list:
        """Devuelve las columnas con restricción UNIQUE de la tabla."""
        try:
            query = f"""
                SELECT ccu.COLUMN_NAME
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
                    ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
                WHERE tc.TABLE_NAME    = '{table_name}'
                  AND tc.CONSTRAINT_TYPE = 'UNIQUE'
            """
            self.cursor.execute(query)
            return [row[0] for row in self.cursor.fetchall()]
        except Exception:
            return []

    def _insert_dataframe(self, table_name: str, df: pd.DataFrame) -> int:
        """
        Inserta filas del DataFrame usando MERGE (upsert) cuando la tabla
        tiene columnas UNIQUE, o INSERT directo cuando no las tiene.
        Esto evita errores de clave duplicada en recargas parciales.
        """
        if df.empty:
            logger.warning(f" DataFrame vacío para tabla {table_name}")
            return 0

        try:
            identity_column  = self._get_identity_column(table_name)
            unique_columns   = self._get_unique_columns(table_name)
            insert_columns   = [col for col in df.columns if col != identity_column]

            inserted_count = 0

            if unique_columns:
                # ── MERGE (upsert): INSERT solo si no existe por clave UNIQUE ──
                # Construye: MERGE target USING (VALUES ?) AS src ON <unique match>
                # WHEN NOT MATCHED → INSERT
                match_cols   = [c for c in unique_columns if c in insert_columns]
                update_cols  = [c for c in insert_columns if c not in match_cols]

                src_cols     = ', '.join([f"? AS [{c}]" for c in insert_columns])
                on_clause    = ' AND '.join([f"t.[{c}] = s.[{c}]" for c in match_cols])
                ins_cols_sql = ', '.join([f"[{c}]" for c in insert_columns])
                ins_vals_sql = ', '.join([f"s.[{c}]" for c in insert_columns])

                merge_query = f"""
                    MERGE INTO {table_name} AS t
                    USING (SELECT {src_cols}) AS s
                    ON ({on_clause})
                    WHEN NOT MATCHED THEN
                        INSERT ({ins_cols_sql}) VALUES ({ins_vals_sql});
                """

                for _, row in df.iterrows():
                    values = [self._to_python_native(row[col]) for col in insert_columns]
                    self.cursor.execute(merge_query, values)
                    if self.cursor.rowcount > 0:
                        inserted_count += 1

            else:
                # ── INSERT directo para tablas sin UNIQUE (ej: DIM_PERSONA, DIM_LUGAR) ──
                columns_sql  = ', '.join([f"[{c}]" for c in insert_columns])
                placeholders = ', '.join(['?' for _ in insert_columns])
                query = f"INSERT INTO {table_name} ({columns_sql}) VALUES ({placeholders})"

                for _, row in df.iterrows():
                    values = [self._to_python_native(row[col]) for col in insert_columns]
                    self.cursor.execute(query, values)
                    inserted_count += 1

            logger.info(f" {inserted_count} registros insertados en {table_name}")
            return inserted_count

        except Exception as e:
            logger.error(f" Error insertando en {table_name}: {str(e)}")
            raise

    def insert_dimension(self, table_name: str, df: pd.DataFrame) -> int:
        """
        Inserta una dimensión evitando duplicados tanto en el DataFrame
        como en la base de datos (SCD Tipo 1 básico).
        """
        logger.info(f"\n Iniciando carga de dimensión: {table_name}")

        # 1. Eliminar duplicados internos
        df = df.drop_duplicates().reset_index(drop=True)

        # FIX #8: excluir columnas IDENTITY al leer existing_df para que
        # la comparación de claves naturales sea correcta
        identity_column = self._get_identity_column(table_name)
        read_columns = [col for col in df.columns if col != identity_column]

        # 2. Leer registros ya existentes en la BD
        try:
            query_cols   = ", ".join(read_columns)
            # FIX advertencia pandas: usar SQLAlchemy-string URI o la conexión
            # pyodbc directamente con parámetro coerce_float
            existing_df = pd.read_sql(
                f"SELECT {query_cols} FROM {table_name}",
                self.connection
            )
        except Exception as e:
            logger.warning(f"No se pudo leer {table_name}, asumiendo tabla vacía. Detalle: {e}")
            existing_df = pd.DataFrame(columns=read_columns)

        # FIX #4: normalizar fechas a string para comparación homogénea
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = pd.to_datetime(df[col]).dt.strftime('%Y-%m-%d')

        if not existing_df.empty:
            for col in existing_df.columns:
                if pd.api.types.is_datetime64_any_dtype(existing_df[col]):
                    existing_df[col] = pd.to_datetime(existing_df[col]).dt.strftime('%Y-%m-%d')

        # 3. Identificar columnas con restricción UNIQUE (claves naturales)
        try:
            query_unique = f"""
                SELECT ccu.COLUMN_NAME
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu
                    ON tc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
                WHERE tc.TABLE_NAME   = '{table_name}'
                  AND tc.CONSTRAINT_TYPE = 'UNIQUE'
            """
            self.cursor.execute(query_unique)
            unique_cols = [row[0] for row in self.cursor.fetchall()]
        except Exception:
            unique_cols = []

        # FIX #8: las columnas id_* son IDENTITY en BD → no las usamos como clave natural
        id_columns = [col for col in df.columns if col == identity_column] + \
                     [col for col in df.columns if col.startswith('id_')]

        if unique_cols:
            key_columns = [col for col in unique_cols if col in df.columns]
            logger.info(f" Columnas con restricción UNIQUE: {key_columns}")
        else:
            key_columns = [col for col in read_columns if col not in id_columns]
            logger.info(f" Columnas de clave natural: {key_columns}")

        # 4. Filtrar solo registros nuevos
        if existing_df.empty:
            df_to_insert = df
        else:
            df_keys_str       = df[key_columns].astype(str)
            existing_keys_str = existing_df[key_columns].astype(str)
            existing_keys_set = set(existing_keys_str.apply(tuple, axis=1))
            mask = df_keys_str.apply(lambda row: tuple(row) not in existing_keys_set, axis=1)
            df_to_insert = df[mask]
            logger.info(f" Registros a insertar: {len(df_to_insert)}")

        if df_to_insert.empty:
            logger.info(f" No hay nuevos registros para insertar en {table_name}")
            return 0

        return self._insert_dataframe(table_name, df_to_insert)

    def insert_fact_evento(self, table_name: str, df: pd.DataFrame) -> int:
        """
        Inserta la tabla de hechos.
        - Deduplica por id_registro (PK) antes de insertar para eliminar
          cualquier duplicado que haya podido generarse en el transformer.
        - Usa MERGE por id_registro para ser idempotente en recargas.
        """
        logger.info(f"\n Iniciando carga de tabla de hechos: {table_name}")

        # Deduplicar por PK antes de cualquier operación
        filas_antes = len(df)
        df = df.drop_duplicates(subset=['id_registro']).reset_index(drop=True)
        if len(df) < filas_antes:
            logger.warning(f" Se eliminaron {filas_antes - len(df)} filas duplicadas por id_registro en la fact table")

        # Validar NULLs en FKs
        fk_columns = ['id_persona', 'id_tiempo', 'id_lugar', 'id_metodo', 'id_atencion', 'id_contexto']
        null_check = df[fk_columns].isnull().sum()
        if null_check.any():
            logger.warning(f" NULLs en FKs:\n{null_check[null_check > 0]}")

        # Insertar usando MERGE por id_registro (PK) — idempotente
        if df.empty:
            logger.warning(" DataFrame vacío para FACT_EVENTO")
            return 0

        insert_columns = list(df.columns)
        match_col      = 'id_registro'
        non_match_cols = [c for c in insert_columns if c != match_col]

        src_cols     = ', '.join([f"? AS [{c}]" for c in insert_columns])
        on_clause    = f"t.[{match_col}] = s.[{match_col}]"
        ins_cols_sql = ', '.join([f"[{c}]" for c in insert_columns])
        ins_vals_sql = ', '.join([f"s.[{c}]" for c in insert_columns])
        upd_sql      = ', '.join([f"t.[{c}] = s.[{c}]" for c in non_match_cols])

        merge_query = f"""
            MERGE INTO {table_name} AS t
            USING (SELECT {src_cols}) AS s
            ON ({on_clause})
            WHEN NOT MATCHED THEN
                INSERT ({ins_cols_sql}) VALUES ({ins_vals_sql})
            WHEN MATCHED THEN
                UPDATE SET {upd_sql};
        """

        inserted_count = 0
        try:
            for _, row in df.iterrows():
                values = [self._to_python_native(row[col]) for col in insert_columns]
                self.cursor.execute(merge_query, values)
                if self.cursor.rowcount > 0:
                    inserted_count += 1

            logger.info(f" {inserted_count} registros insertados/actualizados en {table_name}")
            return inserted_count

        except Exception as e:
            logger.error(f" Error insertando en {table_name}: {str(e)}")
            raise

    def commit(self):
        try:
            self.connection.commit()
            logger.info(" Transacción confirmada (COMMIT)")
        except Exception as e:
            logger.error(f" Error en COMMIT: {str(e)}")
            raise

    def rollback(self):
        try:
            self.connection.rollback()
            logger.warning(" Transacción revertida (ROLLBACK)")
        except Exception as e:
            logger.error(f" Error en ROLLBACK: {str(e)}")
            raise


def load_to_database(
    dim_persona, dim_tiempo, dim_lugar, dim_metodo,
    dim_atencion, dim_contexto, fact_evento
) -> dict:
    """Carga todas las dimensiones y la tabla de hechos a la BD."""

    loader = DatabaseLoader(DATABASE_CONFIG)
    stats = {
        'dim_persona':  0, 'dim_tiempo':   0, 'dim_lugar':   0,
        'dim_metodo':   0, 'dim_atencion': 0, 'dim_contexto': 0,
        'fact_evento':  0, 'total_registros': 0,
        'tiempo_carga': 0, 'status': 'FALLIDO'
    }

    tiempo_inicio = datetime.now()

    try:
        loader.connect()

        logger.info("\n" + "=" * 60)
        logger.info("INICIANDO CARGA DE DIMENSIONES")
        logger.info("=" * 60)

        # Orden importante: primero todas las dimensiones, luego hechos
        stats['dim_persona']  = loader.insert_dimension('DIM_PERSONA',  dim_persona)
        stats['dim_tiempo']   = loader.insert_dimension('DIM_TIEMPO',   dim_tiempo)
        stats['dim_lugar']    = loader.insert_dimension('DIM_LUGAR',    dim_lugar)
        stats['dim_metodo']   = loader.insert_dimension('DIM_METODO',   dim_metodo)
        stats['dim_atencion'] = loader.insert_dimension('DIM_ATENCION', dim_atencion)
        stats['dim_contexto'] = loader.insert_dimension('DIM_CONTEXTO', dim_contexto)

        logger.info("\n" + "=" * 60)
        logger.info("INICIANDO CARGA DE TABLA DE HECHOS")
        logger.info("=" * 60)

        stats['fact_evento'] = loader.insert_fact_evento('FACT_EVENTO', fact_evento)

        loader.commit()

        stats['total_registros'] = sum([
            stats['dim_persona'], stats['dim_tiempo'],  stats['dim_lugar'],
            stats['dim_metodo'],  stats['dim_atencion'], stats['dim_contexto'],
            stats['fact_evento']
        ])
        stats['status'] = 'ÉXITO'

        logger.info("\n" + "=" * 60)
        logger.info(" CARGA COMPLETADA EXITOSAMENTE")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"\n ERROR EN CARGA: {str(e)}")
        logger.error("Revirtiendo cambios...")
        loader.rollback()
        stats['status'] = 'FALLIDO'

    finally:
        tiempo_fin = datetime.now()
        stats['tiempo_carga'] = (tiempo_fin - tiempo_inicio).total_seconds()
        loader.disconnect()

        logger.info("\n" + "=" * 60)
        logger.info("RESUMEN DE CARGA")
        logger.info("=" * 60)
        logger.info(f"Status: {stats['status']}")
        logger.info(f"Total registros cargados: {stats['total_registros']}")
        logger.info(f"Tiempo de carga: {stats['tiempo_carga']:.2f} segundos")
        for k in ['dim_persona','dim_tiempo','dim_lugar','dim_metodo','dim_atencion','dim_contexto','fact_evento']:
            logger.info(f"  - {k.upper()}: {stats[k]}")
        logger.info("=" * 60 + "\n")

    return stats