import subprocess
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from api.middleware.auth import jwt_required
from utils.logger import get_logger

logger = get_logger()
router = APIRouter(tags=["training"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def run_training_script(script_name: str, model_name: str) -> dict:
    """Ejecuta un script de entrenamiento y devuelve el resultado."""
    script_path = BASE_DIR / "training" / script_name

    if not script_path.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Script de entrenamiento no encontrado: {script_path}"
        )

    try:
        logger.info(f"Iniciando entrenamiento de {model_name}")
        result = subprocess.run(
            ["python", str(script_path)],
            capture_output=True,
            text=True,
            cwd=BASE_DIR,
            timeout=3600  # 1 hora máximo
        )

        if result.returncode == 0:
            logger.info(f"Entrenamiento de {model_name} completado exitosamente")
            return {
                "status": "success",
                "message": f"Entrenamiento de {model_name} completado",
                "output": result.stdout.strip() if result.stdout else None
            }
        else:
            logger.error(f"Error en entrenamiento de {model_name}: {result.stderr}")
            raise HTTPException(
                status_code=500,
                detail=f"Error en entrenamiento de {model_name}: {result.stderr}"
            )

    except subprocess.TimeoutExpired:
        logger.error(f"Timeout en entrenamiento de {model_name}")
        raise HTTPException(
            status_code=504,
            detail=f"Timeout en entrenamiento de {model_name}"
        )
    except Exception as e:
        logger.error(f"Error inesperado en entrenamiento de {model_name}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado en entrenamiento de {model_name}: {str(e)}"
        )


@router.post("/train/brotes")
def train_brotes(token: str = Depends(jwt_required)):
    """Inicia el entrenamiento del modelo de brotes."""
    return run_training_script("03_train_brotes.py", "brotes")


@router.post("/train/demanda")
def train_demanda(token: str = Depends(jwt_required)):
    """Inicia el entrenamiento del modelo de demanda."""
    return run_training_script("04_train_demanda.py", "demanda")


@router.post("/train/anomalias")
def train_anomalias(token: str = Depends(jwt_required)):
    """Inicia el entrenamiento del modelo de anomalías."""
    return run_training_script("05_train_anomalias.py", "anomalías")

