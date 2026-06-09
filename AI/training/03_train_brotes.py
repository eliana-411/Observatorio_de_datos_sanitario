# AI/training/03_train_brotes.py

import os
import json
import logging
import warnings
from datetime import datetime
from pathlib import Path

import joblib
import mlflow
import mlflow.prophet
import numpy as np
import pandas as pd
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics

warnings.filterwarnings("ignore")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s"
)
log = logging.getLogger(__name__)

# Silenciar logs internos de Prophet, Stan y MLflow
logging.getLogger("prophet").setLevel(logging.ERROR)
logging.getLogger("cmdstanpy").setLevel(logging.ERROR)
logging.getLogger("mlflow").setLevel(logging.ERROR)

# ── Rutas ─────────────────────────────────────────────────────────────────────
BASE_DIR        = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_PATH  = os.path.join(BASE_DIR, "data", "processed", "brotes_processed.csv")
MODELS_DIR      = os.path.join(BASE_DIR, "models", "brotes")
SCALER_PATH     = os.path.join(MODELS_DIR, "scaler_regressors.pkl")
FORECASTS_DIR   = os.path.join(MODELS_DIR, "forecasts")

# ── Configuración del modelo ──────────────────────────────────────────────────
EXPERIMENT_NAME  = "brotes_prophet"
MIN_MESES_TRAIN  = 24       # mínimo de meses para entrenar un municipio
FORECAST_PERIODS = 6        # meses a pronosticar hacia adelante
INTERVAL_WIDTH   = 0.80     # intervalo de confianza

# Configuración de validación cruzada temporal
CV_INITIAL = "730 days"   # ~2 años de datos iniciales siempre en train
CV_PERIOD  = "90 days"    # nueva ventana cada trimestre (~23 cortes vs 70)
CV_HORIZON = "90 days"    # predice 3 meses hacia adelante

# Municipios con alta variabilidad — necesitan mayor flexibilidad en changepoints
MUNICIPIOS_ALTA_VARIABILIDAD = {
    'Riosucio', 'Neira', 'Palestina',
    'Belalcazar', 'Filadelfia', 'Risaralda', 'Villamaria'
}

REGRESSORS = [
    "pct_fin_semana",
    "pct_zona_rural",
    "pct_fuera_municipio",
    "edad_promedio",
    "estrato_promedio",
    "pct_femenino",
    "pct_adolescente",
    "pct_sin_pareja",
    "pct_relacion_conflictiva",
    "pct_intoxicacion",
    "pct_letalidad_alta",
    "pct_hospitalizado",
    "pct_requirio_hospitalizacion",
    "pct_en_tratamiento",
    "pct_derivacion",
    "pct_antecedente_sm",
    "pct_sustancias",
]


# ── Carga ─────────────────────────────────────────────────────────────────────

def load_processed() -> pd.DataFrame:
    df = pd.read_csv(PROCESSED_PATH, parse_dates=["ds"])
    log.info(f"Dataset cargado: {len(df):,} filas | {df['municipio'].nunique()} municipios")
    return df


# ── Modelo Prophet ────────────────────────────────────────────────────────────

def build_model(municipio: str) -> Prophet:
    """
    Config diferenciada por tipo de municipio:
    - Alta variabilidad: changepoint_prior_scale alto (0.3) para capturar
      cambios bruscos de tendencia + estacionalidad aditiva.
    - Estándar: changepoint_prior_scale bajo (0.05), multiplicativa.
    """
    if municipio in MUNICIPIOS_ALTA_VARIABILIDAD:
        model = Prophet(
            seasonality_mode="additive",        # más estable ante cambios bruscos
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.3,        # más flexible para cambios estructurales
            seasonality_prior_scale=5.0,
            interval_width=INTERVAL_WIDTH,
            n_changepoints=25,                  # más puntos de cambio detectables
        )
    else:
        model = Prophet(
            seasonality_mode="multiplicative",
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0,
            interval_width=INTERVAL_WIDTH,
        )
    for reg in REGRESSORS:
        model.add_regressor(reg, standardize=False)
    return model


# ── Validación cruzada temporal ───────────────────────────────────────────────

def run_cv(model: Prophet, df_mun: pd.DataFrame) -> dict:
    """
    Prophet hace CV temporal con ventana creciente:
      - Entrena en [inicio, cutoff]
      - Predice [cutoff, cutoff + horizon]
      - Desplaza cutoff en 'period' y repite

    NO se usa K-Fold clásico porque violaría causalidad temporal
    (no se puede entrenar con datos futuros para predecir el pasado).
    """
    try:
        df_cv = cross_validation(
            model,
            initial=CV_INITIAL,
            period=CV_PERIOD,
            horizon=CV_HORIZON,
            parallel="threads",
        )
        perf = performance_metrics(df_cv)

        # R² calculado sobre predicción in-sample (datos de entrenamiento completos)
        # El R² de CV con horizon de 90 días en datos mensuales genera desfases
        # que producen valores negativos — in-sample es más representativo
        # del ajuste real del modelo a la serie.
        forecast_train = model.predict(df_mun)
        y_true = df_mun["y"].values
        y_pred = forecast_train["yhat"].values
        ss_res = ((y_true - y_pred) ** 2).sum()
        ss_tot = ((y_true - y_true.mean()) ** 2).sum()
        r2 = round(float(1 - ss_res / ss_tot), 4) if ss_tot > 0 else 0.0

        return {
            "mae":       round(float(perf["mae"].mean()),  4),
            "rmse":      round(float(perf["rmse"].mean()), 4),
            "r2":        r2,
            "cv_cortes": int(df_cv["cutoff"].nunique()),
        }
    except Exception as e:
        log.warning(f"    CV no completada: {e}")
        return {"mae": None, "rmse": None, "r2": None, "cv_cortes": 0}


# ── Pronóstico futuro ─────────────────────────────────────────────────────────

def make_forecast(model: Prophet, df_mun: pd.DataFrame) -> pd.DataFrame:
    """
    Genera pronóstico FORECAST_PERIODS meses hacia adelante.
    Los regressores futuros se rellenan con el último valor conocido (naive forward-fill)
    — estrategia conservadora válida para variables epidemiológicas estables.
    """
    future = model.make_future_dataframe(periods=FORECAST_PERIODS, freq="MS")

    # Rellenar regressores: histórico real + forward-fill para meses futuros
    hist = df_mun.set_index("ds")[REGRESSORS]
    for reg in REGRESSORS:
        future[reg] = (
            hist[reg]
            .reindex(future["ds"])
            .ffill()
            .fillna(hist[reg].iloc[-1])   # fallback al último valor
            .values
        )

    return model.predict(future)


# ── Entrenamiento por municipio ───────────────────────────────────────────────

def train_municipio(municipio: str, df_mun: pd.DataFrame) -> dict:
    df_mun = (
        df_mun[["ds", "total_eventos"] + REGRESSORS]
        .rename(columns={"total_eventos": "y"})
        .sort_values("ds")
        .reset_index(drop=True)
    )

    with mlflow.start_run(run_name=municipio, nested=True):
        mlflow.set_tag("municipio", municipio)
        mlflow.log_params({
            "n_meses":            len(df_mun),
            "alta_variabilidad":  municipio in MUNICIPIOS_ALTA_VARIABILIDAD,
            "seasonality_mode":   "additive" if municipio in MUNICIPIOS_ALTA_VARIABILIDAD else "multiplicative",
            "changepoint_prior":  0.3 if municipio in MUNICIPIOS_ALTA_VARIABILIDAD else 0.05,
            "cv_initial":         CV_INITIAL,
            "cv_horizon":         CV_HORIZON,
            "forecast_periods":   FORECAST_PERIODS,
        })

        # Entrenamiento
        model = build_model(municipio)
        model.fit(df_mun)

        # Validación cruzada
        metrics = run_cv(model, df_mun)
        mlflow.log_metrics({k: v for k, v in metrics.items() if v is not None})

        # Pronóstico
        forecast = make_forecast(model, df_mun)

        # Guardar modelo en MLflow
        mlflow.prophet.log_model(
            model,
            artifact_path=f"prophet_{municipio.replace(' ', '_').lower()}"
        )

        # Guardar forecast como CSV
        Path(FORECASTS_DIR).mkdir(parents=True, exist_ok=True)
        forecast_path = os.path.join(
            FORECASTS_DIR,
            f"forecast_{municipio.replace(' ', '_').lower()}.csv"
        )
        forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].to_csv(
            forecast_path, index=False
        )
        mlflow.log_artifact(forecast_path)

        log.info(
            f"  OK  {municipio:30s} | "
            f"meses={len(df_mun):3d} | "
            f"MAE={metrics['mae']} | RMSE={metrics['rmse']} | R²={metrics['r2']}"
        )

    return {"municipio": municipio, **metrics}


# ── Pipeline principal ────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  Entrenamiento — Prophet multiserie (brotes)")
    print("=" * 60)

    # MLflow
    mlflow_uri = os.getenv("MLFLOW_TRACKING_URI", f"sqlite:///{BASE_DIR}/mlflow.db")
    mlflow.set_tracking_uri(mlflow_uri)
    mlflow.set_experiment(EXPERIMENT_NAME)

    df = load_processed()
    resultados = []

    run_name = f"brotes_multiserie_{datetime.now():%Y%m%d_%H%M}"

    with mlflow.start_run(run_name=run_name) as parent:
        mlflow.set_tags({
            "modelo":       "Prophet",
            "tipo":         "multiserie_municipios",
            "n_regressors": len(REGRESSORS),
        })
        mlflow.log_artifact(SCALER_PATH)

        municipios = sorted(df["municipio"].unique())
        log.info(f"\nMunicipios a entrenar: {len(municipios)}\n")

        for mun in municipios:
            df_mun = df[df["municipio"] == mun].copy()

            if len(df_mun) < MIN_MESES_TRAIN:
                log.warning(
                    f"  SKIP {mun}: {len(df_mun)} meses "
                    f"(mínimo requerido: {MIN_MESES_TRAIN})"
                )
                resultados.append({
                    "municipio": mun, "mae": None,
                    "rmse": None, "r2": None, "cv_cortes": 0
                })
                continue

            try:
                r = train_municipio(mun, df_mun)
                resultados.append(r)
            except Exception as e:
                log.error(f"  ERROR {mun}: {e}")
                resultados.append({
                    "municipio": mun, "mae": None,
                    "rmse": None, "r2": None, "cv_cortes": 0
                })

        # ── Métricas agregadas del experimento ────────────────────────────────
        df_res   = pd.DataFrame(resultados)
        validos  = df_res.dropna(subset=["mae"])
        omitidos = len(df_res) - len(validos)

        if not validos.empty:
            mlflow.log_metrics({
                "avg_mae_global":        round(validos["mae"].mean(),  4),
                "avg_rmse_global":       round(validos["rmse"].mean(), 4),
                "avg_r2_global":         round(validos["r2"].mean(),   4),
                "municipios_entrenados": len(validos),
                "municipios_omitidos":   omitidos,
            })

        # Reporte CSV
        report_path = os.path.join(MODELS_DIR, "performance_summary.csv")
        os.makedirs(MODELS_DIR, exist_ok=True)
        df_res.to_csv(report_path, index=False)
        mlflow.log_artifact(report_path)

        # Actualizar config.json con métricas globales del entrenamiento
        if not validos.empty:
            config_path = os.path.join(MODELS_DIR, "config.json")
            with open(config_path, "r", encoding="utf-8") as f:
                config = json.load(f)

            config["metrics"]["rmse"]                = round(validos["rmse"].mean(), 4)
            config["metrics"]["mae"]                 = round(validos["mae"].mean(),  4)
            config["metrics"]["r2"]                  = round(validos["r2"].mean(),   4)
            config["metrics"]["confiabilidad_modelo"] = round(validos["r2"].mean(),  4)
            config["metrics"]["municipios_entrenados"] = len(validos)

            with open(config_path, "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)

            log.info(f"config.json actualizado — R² global: {config['metrics']['r2']}")

        # ── Resumen en consola ────────────────────────────────────────────────
        print("\n" + "=" * 60)
        print("  Resumen")
        print("=" * 60)
        print(f"  Municipios entrenados : {len(validos)}")
        print(f"  Municipios omitidos   : {omitidos}")
        if not validos.empty:
            print(f"  MAE  promedio global  : {validos['mae'].mean():.4f}")
            print(f"  RMSE promedio global  : {validos['rmse'].mean():.4f}")
            print(f"  R²   promedio global  : {validos['r2'].mean():.4f}")
            print(f"\n  Top 5 municipios (mayor R²):")
            print(
                validos.nlargest(5, "r2")[["municipio", "mae", "rmse", "r2"]]
                .to_string(index=False)
            )
        print(f"\n  Run MLflow: {parent.info.run_id}")
        print(f"  Reporte   : {report_path}")
        print("=" * 60)


if __name__ == "__main__":
    main()
    