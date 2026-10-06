from fastapi import FastAPI
from app.database import models
from app.database.database import engine, migrate_user_identity_column
from app.routers.authentication import router as authentication_router
from app.routers.runs import router as runs_router
from app.routers.artifacts import router as artifacts_router
from app.routers.experiments import router as experiments_router
from app.routers.admin import router as admin_router



app = FastAPI(title="Xporium", version="1.0.0")


migrate_user_identity_column()
models.Base.metadata.create_all(bind=engine)
app.include_router(authentication_router)
app.include_router(admin_router)
app.include_router(runs_router)
app.include_router(artifacts_router)
app.include_router(experiments_router)
@app.get("/")
def health_check():
    return {"Status": "Healthy"}
