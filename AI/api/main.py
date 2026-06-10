# AI/api/main.py

import warnings
warnings.filterwarnings(
    "ignore",
    message='Field "model_name" in PromptModelConfig',
    category=UserWarning,
)

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.brotes import router as brotes_router
from api.routes.anomalias import router as anomalias_router
from api.routes.demanda import router as demanda_router
from api.routes.chat import router as chat_router


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
app.include_router(chat_router)
@app.get("/")
def health():
    return {"status": "ok", "service": "Observatorio Sanitario Caldas"}