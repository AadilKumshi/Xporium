from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import database, models
from app.security import JWT
from app.security.hashing import Hash 

router = APIRouter(tags=["Authentication"])


@router.post("/create_user", status_code=status.HTTP_201_CREATED)
def register(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):

    user = db.query(models.User).filter(models.User.username == request.username).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
    
    hashed_password = Hash.pbkdf2_sha256(request.password)
    new_user = models.User(username=request.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"Message": "User created successfully"}


@router.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):

    user = db.query(models.User).filter(models.User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Username not found")
        
    if not Hash.verify(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Password")
    
    access_token = JWT.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer",
}


from app.security import Oauth2

@router.get("/users/me", response_model=None)
def read_users_me(user: models.User = Depends(Oauth2.get_current_user)):
    return {"Username": user.username, "Role": user.role}


@router.delete("/delete_user", status_code=status.HTTP_200_OK)
def delete_user(user: models.User = Depends(Oauth2.get_current_user), db: Session = Depends(database.get_db)):
    db.delete(user)
    db.commit()
    return {"Message": "User deleted successfully"}