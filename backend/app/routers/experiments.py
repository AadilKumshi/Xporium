import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import database, models, schemas
from app.security.Oauth2 import get_current_user


router = APIRouter(prefix="/experiments", tags=["Experiments"])




@router.post("/", response_model=schemas.ExperimentResponse)
def create_experiment(
    experiment: schemas.ExperimentCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_experiment = models.Experiment(
        user_id=current_user.id,
        name=experiment.name,
        description=experiment.description,
        project_url=str(experiment.project_url)
            if experiment.project_url
            else None,
        dataset_name=experiment.dataset_name,
        dataset_public_url=str(experiment.dataset_public_url)
            if experiment.dataset_public_url
            else None,
        experiment_type=experiment.experiment_type,
    )

    db.add(new_experiment)
    db.commit()
    db.refresh(new_experiment)

    return new_experiment


@router.get("/", response_model=list[schemas.ExperimentResponse])
def get_experiments(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    experiments = (
        db.query(models.Experiment)
        .filter(models.Experiment.user_id == current_user.id)
        .all()
    )

    return experiments


@router.post(
    "/{experiment_id}/share",
    response_model=schemas.ShareCodeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_share_code(
    experiment_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    experiment = (
        db.query(models.Experiment)
        .filter(
            models.Experiment.id == experiment_id,
            models.Experiment.user_id == current_user.id,
        )
        .first()
    )
    if experiment is None:
        raise HTTPException(status_code=404, detail="Experiment not found")

    now = datetime.now(timezone.utc)
    active_token = (
        db.query(models.ExperimentShareToken)
        .filter(
            models.ExperimentShareToken.experiment_id == experiment.id,
            models.ExperimentShareToken.owner_id == current_user.id,
            models.ExperimentShareToken.expires_at > now,
        )
        .order_by(models.ExperimentShareToken.expires_at.desc())
        .first()
    )
    if active_token is not None:
        return active_token

    code = str(secrets.randbelow(1_000_000)).zfill(6)
    while db.query(models.ExperimentShareToken).filter_by(code=code).first():
        code = str(secrets.randbelow(1_000_000)).zfill(6)

    token = models.ExperimentShareToken(
        experiment_id=experiment.id,
        owner_id=current_user.id,
        code=code,
        expires_at=now + timedelta(minutes=180),
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


@router.get(
    "/library",
    response_model=list[schemas.LibraryExperimentResponse],
)
def get_library(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    entries = (
        db.query(models.LibraryExperiment)
        .join(models.Experiment)
        .join(models.User, models.Experiment.user_id == models.User.id)
        .filter(models.LibraryExperiment.user_id == current_user.id)
        .order_by(models.LibraryExperiment.added_at.desc())
        .all()
    )
    return [
        {
            **entry.experiment.__dict__,
            "owner_username": entry.experiment.user.username,
            "added_at": entry.added_at,
        }
        for entry in entries
    ]


@router.post(
    "/library",
    response_model=schemas.LibraryExperimentResponse,
    status_code=status.HTTP_201_CREATED,
)
def redeem_share_code(
    request: schemas.RedeemShareCodeRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    token = (
        db.query(models.ExperimentShareToken)
        .filter(models.ExperimentShareToken.code == request.code)
        .first()
    )
    if token is None or token.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Share code is invalid or expired")

    if token.owner_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot add your own experiment to your library",
        )

    existing = (
        db.query(models.LibraryExperiment)
        .filter_by(user_id=current_user.id, experiment_id=token.experiment_id)
        .first()
    )
    if existing is None:
        existing = models.LibraryExperiment(
            user_id=current_user.id,
            experiment_id=token.experiment_id,
        )
        db.add(existing)
        db.commit()
        db.refresh(existing)
    else:
        db.refresh(existing)

    experiment = existing.experiment
    return {
        **experiment.__dict__,
        "owner_username": experiment.user.username,
        "added_at": existing.added_at,
    }


def _get_library_experiment(
    experiment_id: int,
    db: Session,
    current_user: models.User,
) -> models.Experiment:
    experiment = (
        db.query(models.Experiment)
        .join(models.LibraryExperiment)
        .filter(
            models.Experiment.id == experiment_id,
            models.LibraryExperiment.user_id == current_user.id,
        )
        .first()
    )
    if experiment is None:
        raise HTTPException(status_code=404, detail="Library experiment not found")
    return experiment


@router.get("/library/{experiment_id}", response_model=schemas.ExperimentResponse)
def get_library_experiment(
    experiment_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return _get_library_experiment(experiment_id, db, current_user)


@router.get(
    "/library/{experiment_id}/data-configurations",
    response_model=list[schemas.DataConfigurationResponse],
)
def get_library_data_configurations(
    experiment_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    _get_library_experiment(experiment_id, db, current_user)
    return (
        db.query(models.DataConfiguration)
        .filter(models.DataConfiguration.experiment_id == experiment_id)
        .all()
    )







@router.patch("/{experiment_id}", response_model=schemas.ExperimentResponse)
def update_experiment(
    experiment_id: int,
    experiment_update: schemas.ExperimentUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    experiment = (
        db.query(models.Experiment)
        .filter(
            models.Experiment.id == experiment_id,
            models.Experiment.user_id == current_user.id
        )
        .first()
    )

    if experiment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )

    update_data = experiment_update.model_dump(exclude_unset=True)

    if "project_url" in update_data:
        update_data["project_url"] = (
            str(update_data["project_url"])
            if update_data["project_url"] is not None
            else None
        )

    if "dataset_public_url" in update_data:
        update_data["dataset_public_url"] = (
            str(update_data["dataset_public_url"])
            if update_data["dataset_public_url"] is not None
            else None
        )

    for field, value in update_data.items():
        setattr(experiment, field, value)

    db.commit()
    db.refresh(experiment)

    return experiment






@router.delete("/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(
    experiment_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    experiment = (
        db.query(models.Experiment)
        .filter(
            models.Experiment.id == experiment_id,
            models.Experiment.user_id == current_user.id
        )
        .first()
    )

    if experiment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )

    db.delete(experiment)
    db.commit()





@router.post(
    "/{experiment_id}/data-configurations",
    response_model=schemas.DataConfigurationResponse
)
def create_data_configuration(
    experiment_id: int,
    data_config: schemas.DataConfigurationCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    experiment = (
        db.query(models.Experiment)
        .filter(
            models.Experiment.id == experiment_id,
            models.Experiment.user_id == current_user.id
        )
        .first()
    )

    if experiment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )

    new_data_config = models.DataConfiguration(
        experiment_id=experiment_id,
        name=data_config.name,
        dataset_version=data_config.dataset_version,
        description=data_config.description,
        train_ratio=data_config.train_ratio,
        validation_ratio=data_config.validation_ratio,
        test_ratio=data_config.test_ratio,
        shuffle=data_config.shuffle,
        random_seed=data_config.random_seed,
        stratified=data_config.stratified,
    )

    new_data_config.preprocessing_steps = [
        models.PreprocessingStep(
            name=step.name,
            type=step.type,
            configuration=step.configuration,
            step_order=step.step_order
        )
        for step in data_config.preprocessing_steps
    ]

    db.add(new_data_config)
    db.commit()
    db.refresh(new_data_config)

    return new_data_config





@router.get(
    "/{experiment_id}/data-configurations",
    response_model=list[schemas.DataConfigurationResponse]
)
def get_data_configurations(
    experiment_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    experiment = (
        db.query(models.Experiment)
        .filter(
            models.Experiment.id == experiment_id,
            models.Experiment.user_id == current_user.id
        )
        .first()
    )

    if experiment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found"
        )

    return (
        db.query(models.DataConfiguration)
        .filter(
            models.DataConfiguration.experiment_id == experiment_id
        )
        .all()
    )


@router.delete(
    "/{experiment_id}/data-configurations/{data_config_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_data_configuration(
    experiment_id: int,
    data_config_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    data_config = (
        db.query(models.DataConfiguration)
        .join(models.Experiment)
        .filter(
            models.DataConfiguration.id == data_config_id,
            models.DataConfiguration.experiment_id == experiment_id,
            models.Experiment.user_id == current_user.id,
        )
        .first()
    )

    if data_config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data configuration not found",
        )

    db.delete(data_config)
    db.commit()