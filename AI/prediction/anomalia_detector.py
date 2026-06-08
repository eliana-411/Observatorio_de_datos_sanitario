# prediction/anomalia_detector.py

from __future__ import annotations
import json
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd

from utils.config import settings


class AnomaliaDetector:
    """Carga el modelo de detección de anomalías y evalúa puntos nuevos."""

    def __init__(
        self,
        model_path: str | None = None,
        config_path: str | None = None,
    ):
        self.model_path = model_path or settings.MODEL_ANOMALIAS_PATH
        self.config_path = config_path or str(
            Path(settings.MODEL_DIR) / "anomalias" / "config.json")
        self.model = self._load_artifact(self.model_path)
        self.config = self._load_config(self.config_path)
        self.threshold = float(self.config.get(
            "metrics", {}).get("threshold", -0.01))

    def _load_artifact(self, path: str) -> Any:
        path_obj = Path(path)
        if not path_obj.exists():
            raise FileNotFoundError(f"No existe el archivo de modelo: {path}")
        return joblib.load(path)

    def _load_config(self, path: str) -> Dict[str, Any]:
        path_obj = Path(path)
        if not path_obj.exists():
            return {}
        with open(path_obj, "r") as f:
            return json.load(f)

    def _build_input_df(self, medidas: Dict[str, Any]) -> pd.DataFrame:
        """Transforma los datos originales en el formato esperado por el modelo (one-hot),
        usando la configuración del entrenamiento."""
        df = pd.DataFrame([medidas])

        encoding_info = self.config.get("encoding_info", {})
        features = self.config.get("features", [])

        result = {}

        # 1. Variables categóricas → one-hot
        for col_name, col_info in encoding_info.items():
            if col_name not in df.columns:
                for cat in col_info.get("categories", []):
                    col_onehot = f"{col_name}_{cat}"
                    result[col_onehot] = 0
                continue

            valor = df[col_name].iloc[0]
            categories = col_info.get("categories", [])

            for cat in categories:
                col_onehot = f"{col_name}_{cat}"
                result[col_onehot] = 1 if valor == cat else 0

        # 2. Variables numéricas directas
        numericas = ['edad', 'estrato',
                     'cantidad_intentos', 'anio', 'mes', 'trimestre']
        for col in numericas:
            result[col] = medidas.get(col, 0)

        # 3. Variables binarias directas
        binarias = ['es_fin_de_semana', 'mismo_municipio', 'requirio_hospitalizacion',
                    'hospitalizado', 'tiene_antecedente', 'consume_sustancias_flag']
        for col in binarias:
            val = medidas.get(col, False)
            result[col] = 1 if val in [True, 1, 'True', 'true', '1'] else 0

        # 4. Asegurar que todas las features del modelo existan
        for feature in features:
            if feature not in result:
                result[feature] = 0

        df_result = pd.DataFrame([{f: result.get(f, 0) for f in features}])

        return df_result

    def _clasificar_anomalia(self, datos_originales: Dict[str, Any]) -> Dict[str, Any] | None:
        """
        Clasifica la anomalía según las 5 reglas definidas.
        Recibe los datos ORIGINALES (no one-hot).
        """
        metodo = datos_originales.get('metodo', '')
        nivel_letalidad = datos_originales.get('nivel_letalidad', '')
        tiene_antecedente = datos_originales.get('tiene_antecedente', False)
        hospitalizado = datos_originales.get('hospitalizado', False)
        mismo_municipio = datos_originales.get('mismo_municipio', True)
        estado_civil = datos_originales.get('estado_civil', '')
        situacion_sentimental = datos_originales.get(
            'situacion_sentimental', '')
        antecedentes = datos_originales.get('antecedentes_salud_mental', '')
        consumo = datos_originales.get('consumo_sustancias', '')
        municipio_origen = datos_originales.get('municipio_origen', '')
        municipio_evento = datos_originales.get('municipio_evento', '')

        # 1. Primeriza + letalidad alta
        if not tiene_antecedente and nivel_letalidad == 'Alto':
            return {
                'tipo_anomalia': 'Primeriza + letalidad alta',
                'descripcion': f'Primera vez con método de alta letalidad: {metodo}',
                'severidad': 'Alta',
                'categoria': 'Riesgo individual'
            }

        # 2. Desplazamiento geográfico
        if not mismo_municipio:
            metodos_violentos = ['Ahorcamiento', 'Lesión Por Arma De Fuego',
                                 'Lesión Por Arma Cortopunzante', 'Quemaduras']
            if metodo in metodos_violentos:
                return {
                    'tipo_anomalia': 'Desplazamiento geográfico',
                    'descripcion': f'{municipio_origen} → {municipio_evento} con {metodo}',
                    'severidad': 'Media',
                    'categoria': 'Patrón geográfico'
                }

        # 3. Gravedad individual
        if nivel_letalidad == 'Alto' and hospitalizado:
            return {
                'tipo_anomalia': 'Gravedad individual',
                'descripcion': f'Método letal {metodo} requirió hospitalización',
                'severidad': 'Alta',
                'categoria': 'Gravedad clínica'
            }

        # 4. Combinaciones Salud Mental + Sustancias
        perfiles_raros = [
            ('Esquizofrenia', 'Alcohol + Cocaína'),
            ('Sin Antecedentes', 'Alcohol + Cocaína'),
            ('Intento Previo + Depresión', 'No Consume'),
            ('Trastorno Bipolar', 'Alcohol + Cocaína'),
            ('Sin Antecedentes', 'Alcohol + Marihuana'),
            ('Depresión', 'Alcohol + Cocaína'),
        ]
        for antecedente, consumo_esperado in perfiles_raros:
            if antecedentes == antecedente and consumo == consumo_esperado:
                return {
                    'tipo_anomalia': 'Combinaciones Salud Mental + Sustancias',
                    'descripcion': f'{antecedentes} + {consumo}',
                    'severidad': 'Media',
                    'categoria': 'Perfil contextual'
                }

        # 5. Patrones multivariados complejos (default)
        return {
            'tipo_anomalia': 'Patrones multivariados complejos',
            'descripcion': 'Combinación inusual de múltiples variables',
            'severidad': 'Media',
            'categoria': 'Patrón complejo'
        }

    def detect(self, medidas: Dict[str, Any]) -> Dict[str, Any]:
        """Evalúa si un registro contiene una anomalía."""
        datos_originales = medidas.copy()

        # 1. PRIMERO: Reglas de negocio (las 5 anomalías definidas)
        clasificacion_reglas = self._clasificar_anomalia(datos_originales)
        es_regla = clasificacion_reglas['tipo_anomalia'] != 'Patrones multivariados complejos'

        if es_regla:
            return {
                "puntuacion": None,
                "es_anomalia": True,
                "threshold": self.threshold,
                "detalle": clasificacion_reglas,
                "mensaje": f"Anomalía detectada: {clasificacion_reglas['tipo_anomalia']}",
            }

        # 2. SI NO es regla: Usar modelo ML para patrones complejos
        df = self._build_input_df(medidas)
        X = df.fillna(0).values
        score = float(self.model.decision_function(X)[0])
        es_anomalia = bool(score < self.threshold)

        if es_anomalia:
            return {
                "puntuacion": score,
                "es_anomalia": True,
                "threshold": self.threshold,
                "detalle": clasificacion_reglas,
                "mensaje": "Anomalía detectada por patrón multivariado complejo",
            }

        return {
            "puntuacion": score,
            "es_anomalia": False,
            "threshold": self.threshold,
            "detalle": None,
            "mensaje": "Sin anomalía detectada",
        }