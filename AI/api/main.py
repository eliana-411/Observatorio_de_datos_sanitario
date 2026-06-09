# AI/api/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.brotes import router as brotes_router
from api.routes.anomalias import router as anomalias_router
from api.routes.demanda import router as demanda_router


app = FastAPI(
    title="Observatorio Sanitario Caldas — API de Predicción",
    description="API para predicción de brotes de intentos de suicidio en Caldas",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(brotes_router)
app.include_router(anomalias_router)
app.include_router(demanda_router)
@app.get("/")
def health():
    return {"status": "ok", "service": "Observatorio Sanitario Caldas"}