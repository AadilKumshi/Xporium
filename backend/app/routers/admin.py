from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import database, models, schemas
from app.security.Oauth2 import get_admin_user, get_current_user


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview", response_model=schemas.AdminOverviewResponse, status_code=status.HTTP_200_OK)
def get_admin_overview(
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(database.get_db),
):
    return {
        "total_users": db.query(models.User).count(),
        "total_experiments": db.query(models.Experiment).count(),
        "total_data_configurations": db.query(
            models.DataConfiguration
        ).count(),
        "total_runs": db.query(models.Run).count(),
        "total_artifacts": db.query(models.Artifact).count(),
    }



@router.get("/users", response_model=list[schemas.AdminUserResponse], status_code=status.HTTP_200_OK)
def get_all_users(
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(database.get_db),
):
    return db.query(models.User).order_by(
        models.User.created_at.desc()
    ).all()




@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(database.get_db),
):
    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot delete their own account",
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }




@router.get("/experiments", response_model=list[schemas.ExperimentResponse], status_code=status.HTTP_200_OK)
def get_all_experiments(
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(database.get_db),
):
    return db.query(models.Experiment).order_by(
        models.Experiment.created_at.desc()
    ).all()



@router.delete("/experiments/{experiment_id}", status_code=status.HTTP_200_OK)
def delete_experiment(
    experiment_id: int,
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(database.get_db),
):
    experiment = db.query(models.Experiment).filter(
        models.Experiment.id == experiment_id
    ).first()

    if experiment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experiment not found",
        )

    db.delete(experiment)
    db.commit()

    return {
        "message": "Experiment deleted successfully"
    }



@router.get("/runs", response_model=list[schemas.RunResponse], status_code=status.HTTP_200_OK)
def get_all_runs(
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(database.get_db),
):
    return db.query(models.Run).order_by(
        models.Run.created_at.desc()
    ).all()



@router.delete("/runs/{run_id}", status_code=status.HTTP_200_OK)
def delete_run(
    run_id: int,
    current_user: models.User = Depends(get_admin_user),
    db: Session = Depends(database.get_db),
):
    run = db.query(models.Run).filter(
        models.Run.id == run_id
    ).first()

    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found",
        )

    db.delete(run)
    db.commit()

    return {
        "message": "Run deleted successfully"
    }