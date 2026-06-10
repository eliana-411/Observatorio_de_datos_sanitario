"""
API FastAPI para recibir y procesar archivos CSV sin guardarlos en local
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import io
import os
import pandas as pd
from pathlib import Path
import logging
from typing import Optional

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

app = FastAPI(title="ETL Observatorio API", version="1.0.0")
logger = get_logger('ETL.API')


@app.post("/process-csv")
async def process_csv_endpoint(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    """
    Endpoint para procesar un archivo CSV sin guardarlo en local.
    El procesamiento se ejecuta en background.
    
    Parameters:
    - file: Archivo CSV cargado
    
    Returns:
    - JSON con el status del procesamiento
    """
    try:
        # Validar que sea un CSV
        if file.filename and not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400, 
                detail="Solo se aceptan archivos CSV"
            )
        
        logger.info(f"Recibido archivo: {file.filename} ({file.size} bytes)")
        
        # Leer el archivo en memoria
        contents = await file.read()
        
        if not contents:
            raise HTTPException(
                status_code=400, 
                detail="El archivo está vacío"
            )
        
        # Encolar el procesamiento en background
        if background_tasks:
            background_tasks.add_task(
                procesar_csv_en_background, 
                contents, 
                file.filename
            )
        else:
            # Procesar de forma sincrónica si no hay background tasks
            procesar_csv_en_background(contents, file.filename)
        
        return JSONResponse(
            status_code=202,
            content={
                "message": "El archivo ha sido encolado para procesamiento",
                "fileName": file.filename,
                "fileSize": file.size,
                "status": "processing"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al procesar CSV: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Error al procesar el archivo: {str(e)}"
        )


def procesar_csv_en_background(file_contents: bytes, file_name: str):
    """
    Procesa el CSV en memoria sin guardarlo en disco
    """
    try:
        logger.info("=" * 70)
        logger.info(f"INICIANDO PROCESAMIENTO DE {file_name}")
        logger.info("=" * 70)
        
        # Convertir bytes a DataFrame directamente
        csv_buffer = io.BytesIO(file_contents)
        df_raw = pd.read_csv(csv_buffer)
        
        logger.info(f"Archivo leído: {df_raw.shape[0]} filas, {df_raw.shape[1]} columnas")
        
        metrics = ETLMetrics()
        metrics.iniciar()
        
        # FASE 0 - ANONIMIZACIÓN
        logger.info("\nFASE 0: ANONYMIZE - Anonimizando datos...")
        
        stats_anon = {
            "status": "NO_EJECUTADO",
            "registros_cargados": 0
        }
        
        if df_raw is not None:
            logger.info(f"Registros antes de anonimización: {len(df_raw)}")
            
            # Ejecutar anonimización
            df_anonimizado, stats_anon = ejecutar_anonimizacion(df_raw)
            logger.info(f"Anonimización completada: {stats_anon}")
            
            # FASE 1 - VALIDACIÓN
            logger.info("\nFASE 1: VALIDATE - Validando datos...")
            
            try:
                df_validado = validar_dataset(df_anonimizado)
                logger.info(f"Validación exitosa: {len(df_validado)} registros válidos")
            except Exception as e:
                logger.error(f"Error en validación: {str(e)}")
                guardar_errores(df_anonimizado, str(e))
                raise
            
            # FASE 2 - NORMALIZACIÓN
            logger.info("\nFASE 2: NORMALIZE - Normalizando datos...")
            
            df_normalizado = normalizar_dataframe(df_validado)
            logger.info(f"Normalización completada: {len(df_normalizado)} registros")
            
            # FASE 3 - ELIMINACIÓN DE DUPLICADOS
            logger.info("\nFASE 3: DEDUPLICATION - Eliminando duplicados...")
            
            registros_antes = len(df_normalizado)
            df_sin_duplicados = eliminar_duplicados(df_normalizado)
            registros_eliminados = registros_antes - len(df_sin_duplicados)
            
            logger.info(f"Duplicados eliminados: {registros_eliminados}")
            logger.info(f"Registros restantes: {len(df_sin_duplicados)}")
            
            # FASE 4 - TRANSFORMACIÓN
            logger.info("\nFASE 4: TRANSFORM - Transformando datos...")
            
            df_transformado = transformar_datos(df_sin_duplicados)
            logger.info(f"Transformación completada: {len(df_transformado)} registros")
            
            # FASE 5 - CARGA
            logger.info("\nFASE 5: LOAD - Cargando datos a base de datos...")
            
            resultado_carga = load_to_database(df_transformado, POSTGRES_CONFIG)
            logger.info(f"Carga completada: {resultado_carga}")
            
            # Métricas finales
            metrics.finalizar()
            logger.info("\n" + "=" * 70)
            logger.info(f"PIPELINE COMPLETADO EXITOSAMENTE")
            logger.info(f"Tiempo total: {metrics.obtener_tiempo_total()}")
            logger.info("=" * 70)
            
            return {
                "status": "success",
                "message": "Procesamiento completado",
                "fileName": file_name,
                "recordsProcessed": len(df_transformado),
                "recordsDeleted": registros_eliminados,
                "metrics": {
                    "totalTime": metrics.obtener_tiempo_total(),
                    "anonymizationStats": stats_anon
                }
            }
        else:
            logger.error("No se pudo leer el archivo CSV")
            return {"status": "error", "message": "No se pudo leer el archivo"}
    
    except Exception as e:
        logger.error(f"Error en pipeline: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "message": f"Error en procesamiento: {str(e)}",
            "fileName": file_name
        }


@app.get("/health")
async def health_check():
    """
    Endpoint para verificar que el servicio ETL está corriendo
    """
    return {"status": "healthy", "service": "ETL API"}


@app.post("/process-csv-legacy")
async def process_csv_legacy(file_path: str):
    """
    Endpoint para procesar un CSV desde un path (método tradicional)
    Mantener por compatibilidad
    """
    try:
        if not Path(file_path).exists():
            raise HTTPException(status_code=404, detail="Archivo no encontrado")
        
        logger.info(f"Procesando archivo desde path: {file_path}")
        
        # Usar la función existente del ETL
        df_raw = extraer_datos(file_path)
        
        if df_raw is None:
            raise HTTPException(status_code=400, detail="No se pudo leer el archivo")
        
        logger.info(f"Archivo procesado: {len(df_raw)} registros")
        
        return {
            "status": "success",
            "message": "Procesamiento completado",
            "recordsProcessed": len(df_raw),
            "filePath": file_path
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al procesar archivo: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    # Obtener puerto del environment o usar 8002 por defecto
    port = int(os.getenv("ETL_PORT", 8002))
    host = os.getenv("ETL_HOST", "0.0.0.0")
    
    logger.info(f"Iniciando servidor ETL en {host}:{port}")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
