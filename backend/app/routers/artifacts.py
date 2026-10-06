from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import UploadFile, File, Form
import base64
from app.database import database, models, schemas
from app.security.Oauth2 import get_current_user


router = APIRouter(prefix="/run", tags=["Artifacts"])



@router.post("/{run_id}/artifact", response_model=schemas.ArtifactResponse) 

async def create_artifact(
    run_id: int,
    image: UploadFile | None = File(default=None),
    note: str | None = Form(default=None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    run = (
        db.query(models.Run)
        .join(
            models.DataConfiguration,
            models.Run.data_config_id == models.DataConfiguration.id
        )
        .join(
            models.Experiment,
            models.DataConfiguration.experiment_id == models.Experiment.id
        )
        .filter(
            models.Run.id == run_id,
            models.Experiment.user_id == current_user.id
        )
        .first()
    )

    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )


    existing_artifact = (
    db.query(models.Artifact)
    .filter(models.Artifact.run_id == run_id)
    .first()
    )

    if existing_artifact is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Artifact already exists for this run"
    )

    if image is None and note is None:
        raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Artifact must contain an image or a note",
    )

    image_data = None
    image_filename = None
    image_type = None

    if image is not None:
        image_data = await image.read()
        image_filename = image.filename
        image_type = image.content_type

    new_artifact = models.Artifact(
        run_id=run_id,
        image_data=image_data,
        image_filename=image_filename,
        image_type=image_type,
        note=note
    )

    db.add(new_artifact)
    db.commit()
    db.refresh(new_artifact)

    return schemas.ArtifactResponse(
        id=new_artifact.id,
        image_data=(
            base64.b64encode(new_artifact.image_data).decode("utf-8")
            if new_artifact.image_data
            else None
        ),
        image_filename=new_artifact.image_filename,
        image_type=new_artifact.image_type,
        note=new_artifact.note,
        created_at=new_artifact.created_at
    )




@router.get("/{run_id}/artifact", response_model=schemas.ArtifactResponse)
def get_artifact(
    run_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    run = (
        db.query(models.Run)
        .join(
            models.DataConfiguration,
            models.Run.data_config_id == models.DataConfiguration.id
        )
        .join(
            models.Experiment,
            models.DataConfiguration.experiment_id == models.Experiment.id
        )
        .filter(
            models.Run.id == run_id,
            models.Experiment.user_id == current_user.id
        )
        .first()
    )

    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    artifact = (
        db.query(models.Artifact)
        .filter(models.Artifact.run_id == run_id)
        .first()
    )

    if artifact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artifact not found"
        )

    return schemas.ArtifactResponse(
        id=artifact.id,
        image_data=(
            base64.b64encode(artifact.image_data).decode("utf-8")
            if artifact.image_data
            else None
        ),
        image_filename=artifact.image_filename,
        image_type=artifact.image_type,
        note=artifact.note,
        created_at=artifact.created_at
    )



@router.delete("/{run_id}/artifact", status_code=status.HTTP_204_NO_CONTENT)

def delete_artifact(
    run_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    run = (
        db.query(models.Run)
        .join(
            models.DataConfiguration,
            models.Run.data_config_id == models.DataConfiguration.id
        )
        .join(
            models.Experiment,
            models.DataConfiguration.experiment_id == models.Experiment.id
        )
        .filter(
            models.Run.id == run_id,
            models.Experiment.user_id == current_user.id
        )
        .first()
    )

    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    artifact = (
        db.query(models.Artifact)
        .filter(models.Artifact.run_id == run_id)
        .first()
    )

    if artifact is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artifact not found"
        )

    db.delete(artifact)
    db.commit()