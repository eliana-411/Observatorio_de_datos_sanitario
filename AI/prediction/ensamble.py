from __future__ import annotations
from typing import Dict


class EnsemblePredictor:
    """Combina predicciones de brotes y demanda para obtener un resultado integrado."""

    def __init__(self, weight_brotes: float = 0.5, weight_demanda: float = 0.5):
        self.weight_brotes = weight_brotes
        self.weight_demanda = weight_demanda

    def blend(self, brotes_output: Dict[str, any], demanda_output: Dict[str, any]) -> Dict[str, any]:
        fechas = brotes_output["fechas"] if len(brotes_output["fechas"]) >= len(demanda_output["fechas"]) else demanda_output["fechas"]
        brotes = brotes_output.get("casos_estimados", [0.0] * len(fechas))
        demanda = demanda_output.get("demanda_estimadas", [0.0] * len(fechas))
        length = min(len(brotes), len(demanda), len(fechas))

        blended = [
            float(self.weight_brotes * brotes[i] + self.weight_demanda * demanda[i])
            for i in range(length)
        ]

        return {
            "fechas": fechas[:length],
            "valor_ensemble": blended,
            "peso_brotes": self.weight_brotes,
            "peso_demanda": self.weight_demanda,
        }
