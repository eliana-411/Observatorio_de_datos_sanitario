from fastapi import Header, HTTPException, status

from utils.config import settings

try:
    import jwt
except ImportError:
    jwt = None


def jwt_required(authorization: str | None = Header(None)) -> str:
    """Valida el token JWT si el modo auth está habilitado."""
    if not settings.JWT_ENABLED:
        return "jwt_disabled"

    if jwt is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT no está instalado en el entorno. Instala PyJWT.",
        )

    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso faltante o incorrecto.",
        )

    token = authorization.split("Bearer ")[-1].strip()
    try:
        jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token JWT inválido o expirado.",
        )

    return token
