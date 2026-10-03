from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import database, models, schemas
from app.security.Oauth2 import get_current_user


router = APIRouter(tags=["Runs"])





@router.post("/{experiment_id}/runs", response_model=schemas.RunResponse)

def create_run(
    experiment_id: int,
    run: schemas.RunCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Check that the experiment exists and belongs to the user
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

    # 2. Check that the data configuration belongs to this experiment
    data_config = (
        db.query(models.DataConfiguration)
        .filter(
            models.DataConfiguration.id == run.data_config_id,
            models.DataConfiguration.experiment_id == experiment_id
        )
        .first()
    )

    if data_config is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data configuration not found"
        )

    # 3. Create the Run
    new_run = models.Run(
        data_config_id=run.data_config_id,
        model_name=run.model_name,
        training_duration=run.training_duration,
        environment_type=run.environment_type,
        environment_specs=run.environment_specs
    )

    # 4. Create Parameters
    new_run.parameters = [
        models.Parameter(
            name=parameter.name,
            value=parameter.value,
            type=parameter.type
        )
        for parameter in run.parameters
    ]

    # 5. Create Metrics
    new_run.metrics = [
        models.Metric(
            name=metric.name,
            value=metric.value,
            split=metric.split
        )
        for metric in run.metrics
    ]

    # 6. Add the Run and its children to the session
    db.add(new_run)

    # 7. Save everything
    db.commit()

    # 8. Refresh the Run with database-generated values
    db.refresh(new_run)

    return new_run




@router.get("/{experiment_id}/runs", response_model=list[schemas.RunResponse])

def get_runs(
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

    runs = (
        db.query(models.Run)
        .join(
            models.DataConfiguration,
            models.Run.data_config_id == models.DataConfiguration.id
        )
        .filter(
            models.DataConfiguration.experiment_id == experiment_id
        )
        .all()
    )

    return runs



@router.patch("/runs/{run_id}", response_model=schemas.RunResponse)

def update_run(
    run_id: int,
    run_update: schemas.RunUpdate,
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

    update_data = run_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(run, field, value)

    db.commit()
    db.refresh(run)

    return run



@router.delete("/runs/{run_id}", status_code=status.HTTP_204_NO_CONTENT)

def delete_run(
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

    db.delete(run)
    db.commit()