from pathlib import Path
import json
import shutil

from utils.config import settings

MODEL_DIR = Path(settings.MODEL_DIR)


def bump_version(config_path: Path) -> str:
    if not config_path.exists():
        return "1.0"

    config = json.loads(config_path.read_text(encoding="utf-8"))
    version = config.get("version", "1.0")
    major, minor = version.split(".")
    new_version = f"{major}.{int(minor) + 1}"
    config["version"] = new_version
    config_path.write_text(json.dumps(config, indent=2), encoding="utf-8")
    return new_version


def version_artifacts(model_name: str) -> None:
    model_path = MODEL_DIR / model_name
    config_path = model_path / "config.json"
    if not config_path.exists():
        print(f"No hay config para {model_name}")
        return

    version = bump_version(config_path)
    archive_dir = MODEL_DIR / f"{model_name}_v{version}"
    archive_dir.mkdir(parents=True, exist_ok=True)

    for artifact in ["{model_name}_model.pkl", "scaler.pkl", "config.json"]:
        src = model_path / artifact.replace("{model_name}", model_name)
        if src.exists():
            shutil.copy(src, archive_dir / src.name)

    print(f"Versionado {model_name}: {version} -> {archive_dir}")


def main() -> None:
    for model in ["brotes", "demanda", "anomalias"]:
        version_artifacts(model)


if __name__ == "__main__":
    main()
