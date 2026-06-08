from Extract.extractor import extraer_datos
from Validate.validator import (
    validar_dataset,
    guardar_errores,
    eliminar_duplicados
)
from Validate.normalizer import normalizar_dataframe
from Transform.transformer import transformar_datos
from Load.loader import load_to_database
from Load.logger_config import get_logger
from Load.config import POSTGRES_CONFIG
from Anonymize.anonymizer import ejecutar_anonimizacion
from Monitoring.execution_metrics import ETLMetrics


logger = get_logger('ETL.Pipeline')


def main():

    metrics = ETLMetrics()
    metrics.iniciar()

    ruta = "Data/datos_nuevos.csv"
    # ruta = "Data/dataset_intentos_suicidio.xlsx"

    stats_anon = {
        "status": "NO_EJECUTADO",
        "registros_cargados": 0
    }

    try:

        logger.info("=" * 70)
        logger.info("INICIANDO PIPELINE ETL COMPLETO")
        logger.info("=" * 70)

        # ==========================================================
        # FASE 0 - ANONYMIZE
        # ==========================================================

        logger.info(
            "\nFASE 0: ANONYMIZE - "
            "Anonimizando datos para PostgreSQL staging..."
        )

        df_raw = extraer_datos(ruta)

        if df_raw is not None:

            try:

                stats_anon = ejecutar_anonimizacion(
                    df=df_raw,
                    pg_config=POSTGRES_CONFIG,
                    source_id='csv_intentos_suicidio'
                )

                metrics.metrics["anonimizados"] = (
                    stats_anon.get(
                        "registros_cargados",
                        0
                    )
                )

                if stats_anon["status"] == "ÉXITO":

                    logger.info(
                        f"Anonimización exitosa: "
                        f"{stats_anon['registros_cargados']} "
                        f"registros PostgreSQL staging"
                    )

                else:

                    logger.warning(
                        "Anonimización falló. "
                        "Pipeline SQL Server continúa."
                    )

            except Exception as e:

                logger.warning(
                    f"Error anonimización: {e}"
                )

        else:

            logger.warning(
                "No se pudo leer archivo "
                "para anonimización."
            )

        # ==========================================================
        # FASE 1 - EXTRACT
        # ==========================================================

        logger.info(
            "\nFASE 1: EXTRACT - "
            "Extrayendo datos..."
        )

        df = extraer_datos(ruta)

        if df is None:

            raise Exception(
                "EXTRACT falló. "
                "No se pudieron leer datos."
            )

        metrics.metrics["extraidos"] = len(df)

        logger.info(
            f"Registros extraídos: "
            f"{len(df)}"
        )

        # ==========================================================
        # FASE 2 - NORMALIZE
        # ==========================================================

        logger.info(
            "\nFASE 2: NORMALIZE"
        )

        df = normalizar_dataframe(df)

        logger.info(
            "Datos normalizados"
        )

        # ==========================================================
        # FASE 3 - DEDUPLICATE
        # ==========================================================

        logger.info(
            "\nFASE 3: DEDUPLICATE"
        )

        df = eliminar_duplicados(df)

        logger.info(
            f"Registros después "
            f"deduplicación: {len(df)}"
        )

        # ==========================================================
        # FASE 4 - VALIDATE
        # ==========================================================

        logger.info(
            "\nFASE 4: VALIDATE"
        )

        df_validos, df_invalidos = validar_dataset(df)

        metrics.metrics["validos"] = len(df_validos)
        metrics.metrics["invalidos"] = len(df_invalidos)

        logger.info(
            f"Registros válidos: "
            f"{len(df_validos)}"
        )

        logger.info(
            f"Registros inválidos: "
            f"{len(df_invalidos)}"
        )

        # ==========================================================
        # FASE 5 - GUARDAR ERRORES
        # ==========================================================

        if not df_invalidos.empty:

            logger.info(
                "\nGuardando errores..."
            )

            guardar_errores(df_invalidos)

        # ==========================================================
        # FASE 6 - TRANSFORM
        # ==========================================================

        if df_validos.empty:

            raise Exception(
                "No existen registros válidos."
            )

        logger.info(
            "\nFASE 6: TRANSFORM"
        )

        tablas_transformadas = transformar_datos(
            df_validos
        )

        # ==========================================================
        # FASE 7 - LOAD
        # ==========================================================

        logger.info(
            "\nFASE 7: LOAD"
        )

        stats = load_to_database(

            dim_persona=tablas_transformadas[
                'dim_persona'
            ],

            dim_tiempo=tablas_transformadas[
                'dim_tiempo'
            ],

            dim_lugar=tablas_transformadas[
                'dim_lugar'
            ],

            dim_metodo=tablas_transformadas[
                'dim_metodo'
            ],

            dim_atencion=tablas_transformadas[
                'dim_atencion'
            ],

            dim_contexto=tablas_transformadas[
                'dim_contexto'
            ],

            fact_evento=tablas_transformadas[
                'fact_evento'
            ]

        )

        if stats["status"] != "ÉXITO":

            raise Exception(
                "Falló LOAD SQL Server."
            )

        logger.info("=" * 70)

        logger.info(
            "PIPELINE COMPLETADO EXITOSAMENTE"
        )

        logger.info(
            f"SQL Server: "
            f"{stats['total_registros']}"
        )

        logger.info(
            f"PostgreSQL staging: "
            f"{stats_anon.get('registros_cargados',0)}"
        )

        logger.info(
            f"Tiempo carga SQL: "
            f"{stats['tiempo_carga']:.2f}s"
        )

        logger.info("=" * 70)

        metrics.metrics["estado"] = "EXITO"

    except Exception as e:

        metrics.metrics["estado"] = "ERROR"
        metrics.metrics["error"] = str(e)

        logger.exception(
            f"PIPELINE FALLÓ: {e}"
        )

    finally:

        metrics.finalizar()

        archivo_metricas = metrics.guardar()

        logger.info(
            f"Métricas guardadas: "
            f"{archivo_metricas}"
        )

if __name__ == "__main__":
    main()