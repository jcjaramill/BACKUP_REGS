from fastapi import Depends, HTTPException, APIRouter
from auth.auth import authenticate_user, create_access_token, get_current_user
from models import LoginRequest



router = APIRouter()

@router.post("/token")
async def login(login_data: LoginRequest):
    user = authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    user["_id"] = str(user["_id"])  # convierte ObjectId a string
    return user