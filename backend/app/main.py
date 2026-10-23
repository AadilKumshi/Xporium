
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import models
from app.database.database import engine
from app.routers.authentication import router as authentication_router
from app.routers.runs import router as runs_router
from app.routers.artifacts import router as artifacts_router
from app.routers.experiments import router as experiments_router
from app.routers.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Xporium", version="1.0.0", lifespan=lifespan)


app.include_router(authentication_router)
app.include_router(admin_router)
app.include_router(runs_router)
app.include_router(artifacts_router)
app.include_router(experiments_router)


@app.get("/")
def health_check():
    return {"Status": "Healthy"}
