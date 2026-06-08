"""
LOAD PIPELINE - Carga datos transformados a la Base de Datos
"""
import pyodbc
import numpy as np
import pandas as pd
from datetime import datetime
from Load.config import DATABASE_CONFIG
from Load.logger_config import get_logger

logger = get_logger('ETL.Load')


class DatabaseLoader:

    def __init__(self, config: dict):
        self.config = config
        self.connection = None
        self.cursor = None

    def connect(self):
        try:
            connection_string = (
                f"Driver={{SQL Server}};"
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
        if self.connection:
            self.connection.close()
            logger.info(" Desconectado de BD")

    def _to_python_native(self, val):
        if pd.isna(val) if not isinstance(val, (list, dict)) else False:
            return None
        if isinstance(val, (np.integer,)):
            return int(val)
        if isinstance(val, (np.floating,)):
            return float(val)
        if isinstance(val, (np.bool_,)):
            return int(val)
        if isinstance(val, bool):
            return int(val)
        if isinstance(val, pd.Timestamp):
            return val.date()
        return val

    def _get_identity_column(self, table_name: str):
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
        if df.empty:
            logger.warning(f" DataFrame vacío para tabla {table_name}")
            return 0

        try:
            identity_column = self._get_identity_column(table_name)
            unique_columns  = self._get_unique_columns(table_name)
            insert_columns  = [col for col in df.columns if col != identity_column]
            inserted_count  = 0

            if unique_columns:
                match_cols   = [c for c in unique_columns if c in insert_columns]
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
        logger.info(f"\n Iniciando carga de dimensión: {table_name}")

        df = df.drop_duplicates().reset_index(drop=True)
        identity_column = self._get_identity_column(table_name)
        read_columns = [col for col in df.columns if col != identity_column]

        try:
            query_cols  = ", ".join(read_columns)
            existing_df = pd.read_sql(
                f"SELECT {query_cols} FROM {table_name}",
                self.connection
            )
        except Exception as e:
            logger.warning(f"No se pudo leer {table_name}, asumiendo vacía. Detalle: {e}")
            existing_df = pd.DataFrame(columns=read_columns)

        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = pd.to_datetime(df[col]).dt.strftime('%Y-%m-%d')

        if not existing_df.empty:
            for col in existing_df.columns:
                if pd.api.types.is_datetime64_any_dtype(existing_df[col]):
                    existing_df[col] = pd.to_datetime(existing_df[col]).dt.strftime('%Y-%m-%d')

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

        id_columns = [col for col in df.columns if col == identity_column or col.startswith('id_')]

        if unique_cols:
            key_columns = [col for col in unique_cols if col in df.columns]
            logger.info(f" Columnas con restricción UNIQUE: {key_columns}")
        else:
            key_columns = [col for col in read_columns if col not in id_columns]
            logger.info(f" Columnas de clave natural: {key_columns}")

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


    def _get_id_mapping(self, table_name: str, key_col: str, id_col: str) -> dict:
        """Lee el mapping key → id_identity real de la BD después del INSERT."""
        self.cursor.execute(f"SELECT [{key_col}], [{id_col}] FROM {table_name}")
        return {str(row[0]): row[1] for row in self.cursor.fetchall()}

    def insert_fact_evento(self, table_name: str, df: pd.DataFrame) -> int:

    def leer_ids_reales(self, table_name: str, key_columns: list, id_column: str) -> pd.DataFrame:
        """
        Lee de la BD los IDs reales (IDENTITY) de una dimensión
        junto con sus columnas clave para hacer el re-join en la fact table.
        Esto resuelve el problema de FK: los IDs en memoria pueden diferir
        de los IDs reales cuando la tabla ya tenía datos previos.
        """
        cols_sql = ', '.join([f'[{c}]' for c in key_columns + [id_column]])
        query    = f"SELECT {cols_sql} FROM {table_name}"
        return pd.read_sql(query, self.connection)

    def reconstruir_fact_con_ids_reales(
        self,
        fact: pd.DataFrame,
        dim_persona: pd.DataFrame,
        dim_tiempo: pd.DataFrame,
        dim_lugar: pd.DataFrame,
        dim_metodo: pd.DataFrame,
        dim_atencion: pd.DataFrame,
        dim_contexto: pd.DataFrame,
    ) -> pd.DataFrame:

        """
        Reemplaza los id_* de la fact table (generados en memoria por el transformer)
        con los IDs reales que tienen las dimensiones en la BD.

        Esto es necesario porque:
        - El transformer asigna id_persona=1, id_tiempo=1, etc. empezando desde 1
        - Pero si la BD ya tenía datos, el IDENTITY puede estar en 1000, 2000, etc.
        - La FK falla porque busca id_tiempo=1 y en la BD ese registro no existe
          (fue insertado con id_tiempo=1723 por ejemplo)
        """
        fact_work = fact[['id_registro', 'hospitalizado', 'cantidad_intentos']].copy()

        # ── Leer IDs reales de cada dimensión ─────────────────────────────

        # DIM_PERSONA
        persona_bd = self.leer_ids_reales('DIM_PERSONA',
            ['genero', 'edad', 'estrato', 'grupo_poblacional',
             'estado_civil', 'situacion_sentimental', 'grupo_etario'],
            'id_persona'
        )
        # Necesitamos el grupo_etario del transformer para hacer el join
        persona_join = dim_persona[['genero', 'edad', 'estrato', 'grupo_poblacional',
                                    'estado_civil', 'situacion_sentimental', 'grupo_etario',
                                    'id_persona']].rename(columns={'id_persona': 'id_persona_mem'})
        fact_work = fact_work.merge(
            fact[['id_registro', 'id_persona']].rename(columns={'id_persona': 'id_persona_mem'}),
            on='id_registro', how='left'
        )
        # id_persona_mem → buscar en persona_bd el id_persona real
        # Primero traer atributos de persona desde dim_persona en memoria
        fact_work = fact_work.merge(
            dim_persona[['id_persona', 'genero', 'edad', 'estrato', 'grupo_poblacional',
                          'estado_civil', 'situacion_sentimental', 'grupo_etario']]
            .rename(columns={'id_persona': 'id_persona_mem'}),
            on='id_persona_mem', how='left'
        )
        # Luego cruzar con BD para obtener ID real
        fact_work = fact_work.merge(
            persona_bd,
            on=['genero', 'edad', 'estrato', 'grupo_poblacional',
                'estado_civil', 'situacion_sentimental', 'grupo_etario'],
            how='left'
        )
        fact_work = fact_work.drop(columns=['id_persona_mem', 'genero', 'edad', 'estrato',
                                             'grupo_poblacional', 'estado_civil',
                                             'situacion_sentimental', 'grupo_etario'])

        # DIM_TIEMPO
        tiempo_bd = self.leer_ids_reales('DIM_TIEMPO', ['fecha'], 'id_tiempo')
        tiempo_bd['fecha'] = pd.to_datetime(tiempo_bd['fecha']).dt.strftime('%Y-%m-%d')
        tiempo_join = dim_tiempo[['id_tiempo', 'fecha']].copy()
        tiempo_join['fecha'] = pd.to_datetime(tiempo_join['fecha']).dt.strftime('%Y-%m-%d')
        fact_work = fact_work.merge(
            fact[['id_registro', 'id_tiempo']].rename(columns={'id_tiempo': 'id_tiempo_mem'}),
            on='id_registro', how='left'
        )
        fact_work = fact_work.merge(
            tiempo_join.rename(columns={'id_tiempo': 'id_tiempo_mem'}),
            on='id_tiempo_mem', how='left'
        )
        fact_work = fact_work.merge(tiempo_bd, on='fecha', how='left')
        fact_work = fact_work.drop(columns=['id_tiempo_mem', 'fecha'])

        # DIM_LUGAR
        lugar_bd = self.leer_ids_reales('DIM_LUGAR',
            ['municipio_evento', 'municipio_origen', 'zona_evento'], 'id_lugar')
        lugar_join = dim_lugar[['id_lugar', 'municipio_evento', 'municipio_origen', 'zona_evento']]
        fact_work = fact_work.merge(
            fact[['id_registro', 'id_lugar']].rename(columns={'id_lugar': 'id_lugar_mem'}),
            on='id_registro', how='left'
        )
        fact_work = fact_work.merge(
            lugar_join.rename(columns={'id_lugar': 'id_lugar_mem'}),
            on='id_lugar_mem', how='left'
        )
        fact_work = fact_work.merge(
            lugar_bd, on=['municipio_evento', 'municipio_origen', 'zona_evento'], how='left')
        fact_work = fact_work.drop(columns=['id_lugar_mem', 'municipio_evento',
                                             'municipio_origen', 'zona_evento'])

        # DIM_METODO
        metodo_bd = self.leer_ids_reales('DIM_METODO', ['metodo'], 'id_metodo')
        metodo_join = dim_metodo[['id_metodo', 'metodo']]
        fact_work = fact_work.merge(
            fact[['id_registro', 'id_metodo']].rename(columns={'id_metodo': 'id_metodo_mem'}),
            on='id_registro', how='left'
        )
        fact_work = fact_work.merge(
            metodo_join.rename(columns={'id_metodo': 'id_metodo_mem'}),
            on='id_metodo_mem', how='left'
        )
        fact_work = fact_work.merge(metodo_bd, on='metodo', how='left')
        fact_work = fact_work.drop(columns=['id_metodo_mem', 'metodo'])

        # DIM_ATENCION
        atencion_bd = self.leer_ids_reales('DIM_ATENCION', ['resultado_atencion'], 'id_atencion')
        atencion_join = dim_atencion[['id_atencion', 'resultado_atencion']]
        fact_work = fact_work.merge(
            fact[['id_registro', 'id_atencion']].rename(columns={'id_atencion': 'id_atencion_mem'}),
            on='id_registro', how='left'
        )
        fact_work = fact_work.merge(
            atencion_join.rename(columns={'id_atencion': 'id_atencion_mem'}),
            on='id_atencion_mem', how='left'
        )
        fact_work = fact_work.merge(atencion_bd, on='resultado_atencion', how='left')
        fact_work = fact_work.drop(columns=['id_atencion_mem', 'resultado_atencion'])

        # DIM_CONTEXTO
        contexto_bd = self.leer_ids_reales('DIM_CONTEXTO',
            ['antecedentes_salud_mental', 'consumo_sustancias'], 'id_contexto')
        contexto_join = dim_contexto[['id_contexto', 'antecedentes_salud_mental', 'consumo_sustancias']]
        fact_work = fact_work.merge(
            fact[['id_registro', 'id_contexto']].rename(columns={'id_contexto': 'id_contexto_mem'}),
            on='id_registro', how='left'
        )
        fact_work = fact_work.merge(
            contexto_join.rename(columns={'id_contexto': 'id_contexto_mem'}),
            on='id_contexto_mem', how='left'
        )
        fact_work = fact_work.merge(
            contexto_bd, on=['antecedentes_salud_mental', 'consumo_sustancias'], how='left')
        fact_work = fact_work.drop(columns=['id_contexto_mem', 'antecedentes_salud_mental',
                                             'consumo_sustancias'])

        # Verificar NULLs en FKs finales
        fk_cols   = ['id_persona', 'id_tiempo', 'id_lugar', 'id_metodo', 'id_atencion', 'id_contexto']
        null_check = fact_work[fk_cols].isnull().sum()
        if null_check.any():
            logger.warning(f" NULLs en FKs tras re-join con BD:\n{null_check[null_check > 0]}")
        else:
            logger.info(" Todos los IDs resueltos correctamente contra la BD")

        # Convertir a Int64
        for col in fk_cols:
            fact_work[col] = fact_work[col].astype('Int64')

        return fact_work.reset_index(drop=True)

    def insert_fact_evento(
        self,
        table_name: str,
        df: pd.DataFrame,
        dim_persona: pd.DataFrame,
        dim_tiempo: pd.DataFrame,
        dim_lugar: pd.DataFrame,
        dim_metodo: pd.DataFrame,
        dim_atencion: pd.DataFrame,
        dim_contexto: pd.DataFrame,
    ) -> int:
        logger.info(f"\n Iniciando carga de tabla de hechos: {table_name}")

        # Deduplicar por PK
        filas_antes = len(df)
        df = df.drop_duplicates(subset=['id_registro']).reset_index(drop=True)
        if len(df) < filas_antes:
            logger.warning(f" Eliminados {filas_antes - len(df)} duplicados por id_registro")

        # ── PASO CLAVE: reemplazar IDs en memoria por IDs reales de la BD ──
        logger.info(" Resolviendo FKs contra IDs reales de la BD...")
        df = self.reconstruir_fact_con_ids_reales(
            df, dim_persona, dim_tiempo, dim_lugar,
            dim_metodo, dim_atencion, dim_contexto
        )

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

    loader = DatabaseLoader(DATABASE_CONFIG)
    stats = {
        'dim_persona': 0, 'dim_tiempo': 0, 'dim_lugar': 0,
        'dim_metodo':  0, 'dim_atencion': 0, 'dim_contexto': 0,
        'fact_evento': 0, 'total_registros': 0,
        'tiempo_carga': 0, 'status': 'FALLIDO'
    }

    tiempo_inicio = datetime.now()

    try:
        loader.connect()

        logger.info("\n" + "=" * 60)
        logger.info("INICIANDO CARGA DE DIMENSIONES")
        logger.info("=" * 60)

        stats['dim_persona']  = loader.insert_dimension('DIM_PERSONA',  dim_persona)
        stats['dim_tiempo']   = loader.insert_dimension('DIM_TIEMPO',   dim_tiempo)
        stats['dim_lugar']    = loader.insert_dimension('DIM_LUGAR',    dim_lugar)
        stats['dim_metodo']   = loader.insert_dimension('DIM_METODO',   dim_metodo)
        stats['dim_atencion'] = loader.insert_dimension('DIM_ATENCION', dim_atencion)
        stats['dim_contexto'] = loader.insert_dimension('DIM_CONTEXTO', dim_contexto)

        logger.info("\n" + "=" * 60)
        logger.info("INICIANDO CARGA DE TABLA DE HECHOS")
        logger.info("=" * 60)

        # ── Pasar las dimensiones para resolver IDs reales ──
        stats['fact_evento'] = loader.insert_fact_evento(
            'FACT_EVENTO', fact_evento,
            dim_persona, dim_tiempo, dim_lugar,
            dim_metodo, dim_atencion, dim_contexto
        )

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
        for k in ['dim_persona','dim_tiempo','dim_lugar','dim_metodo',
                  'dim_atencion','dim_contexto','fact_evento']:
            logger.info(f"  - {k.upper()}: {stats[k]}")
        logger.info("=" * 60 + "\n")

    return stats