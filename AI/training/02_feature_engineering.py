from pathlib import Path

import pandas as pd

RAW_DIR = Path("../data/raw").resolve()
PROCESSED_DIR = Path("../data/processed").resolve()
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def build_time_features(df: pd.DataFrame, date_col: str = "fecha") -> pd.DataFrame:
    df[date_col] = pd.to_datetime(df[date_col])
    df["dia"] = df[date_col].dt.day
    df["mes"] = df[date_col].dt.month
    df["dia_semana"] = df[date_col].dt.dayofweek
    df["trimester"] = df[date_col].dt.quarter
    return df


def add_lag_features(df: pd.DataFrame, group_cols: list[str], value_col: str, lags: list[int]) -> pd.DataFrame:
    for lag in lags:
        df[f"lag_{value_col}_{lag}"] = (
            df.groupby(group_cols)[value_col]
            .shift(lag)
            .fillna(0)
        )
    return df


def process_brotes() -> None:
    path = RAW_DIR / "brotes.csv"
    if not path.exists():
        print(f"Archivo no encontrado: {path}")
        return

    df = pd.read_csv(path)
    df = build_time_features(df, "fecha")
    df = add_lag_features(df, ["municipio"], "casos", [1, 7, 14])
    output_path = PROCESSED_DIR / "brotes_processed.csv"
    df.to_csv(output_path, index=False)
    print(f"Brotes procesados en {output_path}")


def process_demanda() -> None:
    path = RAW_DIR / "demanda.csv"
    if not path.exists():
        print(f"Archivo no encontrado: {path}")
        return

    df = pd.read_csv(path)
    df = build_time_features(df, "fecha")
    df = add_lag_features(df, ["servicio"], "demanda", [1, 7, 14])
    output_path = PROCESSED_DIR / "demanda_processed.csv"
    df.to_csv(output_path, index=False)
    print(f"Demanda procesada en {output_path}")


def process_anomalias() -> None:
    path = RAW_DIR / "anomalias.csv"
    if not path.exists():
        print(f"Archivo no encontrado: {path}")
        return

    df = pd.read_csv(path)
    df = build_time_features(df, "fecha")
    output_path = PROCESSED_DIR / "anomalias_processed.csv"
    df.to_csv(output_path, index=False)
    print(f"Anomalías procesadas en {output_path}")


def main() -> None:
    process_brotes()
    process_demanda()
    process_anomalias()


if __name__ == "__main__":
    main()
