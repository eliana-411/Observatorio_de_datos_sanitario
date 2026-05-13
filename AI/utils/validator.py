from typing import Any


def ensure_non_empty_string(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"El campo '{field_name}' debe ser una cadena no vacía.")
    return value.strip()


def ensure_positive_int(value: Any, field_name: str) -> int:
    if not isinstance(value, int) or value <= 0:
        raise ValueError(f"El campo '{field_name}' debe ser un entero positivo.")
    return value
