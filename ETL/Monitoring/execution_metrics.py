import json
import time
from pathlib import Path
from datetime import datetime


class ETLMetrics:

    def __init__(self):

        self.metrics = {

            "inicio": None,
            "fin": None,
            "duracion_segundos": 0,

            "extraidos": 0,
            "validos": 0,
            "invalidos": 0,

            "anonimizados": 0,

            "estado": "INICIADO",
            "error": None

        }

    def iniciar(self):

        self.metrics["inicio"] = datetime.now().isoformat()
        self._timer = time.time()

    def finalizar(self):

        self.metrics["fin"] = datetime.now().isoformat()

        self.metrics["duracion_segundos"] = round(
            time.time() - self._timer,
            2
        )

    def guardar(self):

        Path("metadata").mkdir(exist_ok=True)

        archivo = (
            f"metadata/"
            f"etl_"
            f"{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            f".json"
        )

        with open(
            archivo,
            "w",
            encoding="utf8"
        ) as f:

            json.dump(
                self.metrics,
                f,
                indent=4,
                ensure_ascii=False
            )

        return archivo