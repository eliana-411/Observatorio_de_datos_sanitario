from Extract.extractor import extraer_datos
from Validate.validator import validar_dataset, guardar_errores, eliminar_duplicados
from Validate.normalizer import normalizar_dataframe
from Transform.transformer import transformar_datos
from Load.loader import load_to_database
from Load.logger_config import get_logger
from Load.config import POSTGRES_CONFIG
from Anonymize.anonymizer import ejecutar_anonimizacion

logger = get_logger('ETL.Pipeline')

if __name__ == "__main__":
    ruta = "Data/dataset_intentos_suicidio.csv"
    #ruta = "Data/dataset_intentos_suicidio.xlsx"

    logger.info("INICIANDO PIPELINE ETL COMPLETO")


    # ── FASE 0: EXTRACT para anonimización (datos crudos sin procesar) ────
    # Se extrae el CSV original ANTES de cualquier transformación.
    # Los datos anonimizados van a PostgreSQL staging para la API pública.
    # Este paso es independiente del resto del pipeline — si falla,
    # el ETL hacia SQL Server continúa de todas formas.
    logger.info("\n FASE 0: ANONYMIZE - Anonimizando datos para PostgreSQL staging...")
    df_raw = extraer_datos(ruta)

    if df_raw is not None:
        stats_anon = ejecutar_anonimizacion(
            df=df_raw,
            pg_config=POSTGRES_CONFIG,
            source_id='csv_intentos_suicidio'
        )
        if stats_anon['status'] == 'ÉXITO':
            logger.info(
                f" Anonimización exitosa: "
                f"{stats_anon['registros_cargados']} registros en PostgreSQL staging"
            )
        else:
            logger.warning(
                " Anonimización hacia PostgreSQL falló — "
                "el pipeline ETL hacia SQL Server continúa"
            )
    else:
        logger.warning(" No se pudo leer el archivo para anonimización — continuando pipeline")

    # ── FASE 1: EXTRACT ───────────────────────────────────────────────────
    logger.info("\n FASE 1: EXTRACT - Extrayendo datos desde el archivo de entrada...")
    df = extraer_datos(ruta)

    if df is not None:

        logger.info(f"\n Registros extraídos: {len(df)}")

        # ── FASE 2: NORMALIZE D
        logger.info("\n FASE 2: NORMALIZE - Normalizando datos...")
        df = normalizar_dataframe(df)
        logger.info(f" Datos normalizados")

        # ── FASE 3: DEDUPLICATE 
        logger.info("\n FASE 3: DEDUPLICATE - Eliminando duplicados...")
        df = eliminar_duplicados(df)
        logger.info(f" Registros después de deduplicación: {len(df)}")

        # ── FASE 4: VALIDATE 
        logger.info("\n  FASE 4: VALIDATE - Validando datos...")
        df_validos, df_invalidos = validar_dataset(df)
        logger.info(f" Registros válidos: {len(df_validos)}")
        logger.info(f"  Registros inválidos: {len(df_invalidos)}")

        # ── FASE 5: GUARDAR ERRORES 
        if not df_invalidos.empty:
            logger.info("\n Guardando registros con errores...")
            guardar_errores(df_invalidos)

        # ── FASE 6: TRANSFORM 
        if not df_validos.empty:
            logger.info("\n FASE 6: TRANSFORM - Transformando datos a modelo dimensional...")
            tablas_transformadas = transformar_datos(df_validos)

            # ── FASE 7: LOAD 
            logger.info("\n FASE 7: LOAD - Cargando datos a la base de datos...")
            stats = load_to_database(
                dim_persona=tablas_transformadas['dim_persona'],
                dim_tiempo=tablas_transformadas['dim_tiempo'],
                dim_lugar=tablas_transformadas['dim_lugar'],
                dim_metodo=tablas_transformadas['dim_metodo'],
                dim_atencion=tablas_transformadas['dim_atencion'],
                dim_contexto=tablas_transformadas['dim_contexto'],
                fact_evento=tablas_transformadas['fact_evento']
            )

            logger.info("\n" + "=" * 70)
            if stats['status'] == 'ÉXITO':
                logger.info(" PIPELINE COMPLETADO EXITOSAMENTE")
                logger.info(f"Total de registros cargados en SQL Server: {stats['total_registros']}")
                logger.info(f"Registros en PostgreSQL staging:           {stats_anon.get('registros_cargados', 0)}")
                logger.info(f"Tiempo total: {stats['tiempo_carga']:.2f} segundos")
            else:
                logger.error(" PIPELINE FALLÓ EN LA FASE LOAD")
            logger.info("=" * 70)

        else:
            logger.error(" No hay datos válidos para transformar. Verificar archivo de errores.")

    else:
        logger.error(" Error en fase EXTRACT. Revisar archivo de entrada.")