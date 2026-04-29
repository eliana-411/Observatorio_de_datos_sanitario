from Extract.extractor import extraer_datos
from Validate.validator import validar_dataset, guardar_errores, eliminar_duplicados
from Validate.normalizer import normalizar_dataframe
from Transform.transformer import transformar_datos
from Load.loader import load_to_database
from Load.logger_config import get_logger

logger = get_logger('ETL.Pipeline')

if __name__ == "__main__":
    ruta = "Data/dataset_intentos_suicidio.csv"
    #ruta = "Data/dataset_intentos_suicidio.xlsx"

    logger.info("INICIANDO PIPELINE ETL COMPLETO")
    logger.info("="*70)

    # 🔹 1. EXTRACT
    logger.info("\n FASE 1: EXTRACT - Extrayendo datos...")
    df = extraer_datos(ruta)

    if df is not None:

        logger.info(f"\n Registros extraídos: {len(df)}")
        logger.info(f"Primeros registros:\n{df.head()}")

        # 🔹 2. NORMALIZAR
        logger.info("\n FASE 2: NORMALIZE - Normalizando datos...")
        df = normalizar_dataframe(df)
        logger.info(f" Datos normalizados")

        # 🔹 3. ELIMINAR DUPLICADOS
        logger.info("\n FASE 3: DEDUPLICATE - Eliminando duplicados...")
        df = eliminar_duplicados(df)
        logger.info(f" Registros después de deduplicación: {len(df)}")

        # 🔹 4. VALIDAR
        logger.info("\n  FASE 4: VALIDATE - Validando datos...")
        df_validos, df_invalidos = validar_dataset(df)
        logger.info(f" Registros válidos: {len(df_validos)}")
        logger.info(f"  Registros inválidos: {len(df_invalidos)}")

        # 🔹 5. GUARDAR ERRORES
        if not df_invalidos.empty:
            logger.info("\n Guardando registros con errores...")
            guardar_errores(df_invalidos)

        # 🔹 6. TRANSFORM
        if not df_validos.empty:
            logger.info("\n FASE 5: TRANSFORM - Transformando datos a modelo dimensional...")
            tablas_transformadas = transformar_datos(df_validos)
            
            # 🔹 7. LOAD
            logger.info("\n FASE 6: LOAD - Cargando datos a la base de datos...")
            stats = load_to_database(
                dim_persona=tablas_transformadas['dim_persona'],
                dim_tiempo=tablas_transformadas['dim_tiempo'],
                dim_lugar=tablas_transformadas['dim_lugar'],
                dim_metodo=tablas_transformadas['dim_metodo'],
                dim_atencion=tablas_transformadas['dim_atencion'],
                dim_contexto=tablas_transformadas['dim_contexto'],
                fact_evento=tablas_transformadas['fact_evento']
            )
            
            logger.info("\n" + "="*70)
            if stats['status'] == 'ÉXITO':
                logger.info(" PIPELINE COMPLETADO EXITOSAMENTE")
                logger.info(f"Total de registros cargados: {stats['total_registros']}")
                logger.info(f"Tiempo total: {stats['tiempo_carga']:.2f} segundos")
            else:
                logger.error(" PIPELINE FALLÓ EN LA FASE LOAD")
            logger.info("="*70)
        
        else:
            logger.error(" No hay datos válidos para transformar. Verificar archivo de errores.")

    else:
        logger.error(" Error en fase EXTRACT. Revisar archivo de entrada.")