from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

# from sqlalchemy.orm import Session
from sqlalchemy import text

from core.config import settings
from api.v1.endpoints.datasets import router as datasets_router
from db.session import init_db, engine
# from db.session import SessionLocal
# from models.dataset import Dataset

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database berhasil terhubung.")
    
    except Exception as e:
        print(f"Gagal terhubung ke database: {e}")

    yield
    

app = FastAPI(title="Stats API", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets_router, prefix="/api/v1/datasets", tags=["datasets"])

@app.get("/health")
def health():
    return {"status": "ok"}

# @app.get("/health/db")
# def health_db():
#     try:
#         with engine.connect() as conn:
#             conn.execute(text("SELECT 1"))
#         return {"status": "ok", "message": "Database terkoneksi"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}
    
# @app.get("/health/db-tables")
# def health_db_tables():
#     db: Session = SessionLocal()
#     try:
#         _ = db.query(Dataset).first()
#         return {"status": "ok", "message": "Tabel ditemukan"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}
#     finally:
#         db.close()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)