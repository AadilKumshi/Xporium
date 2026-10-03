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