from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from Modules.Service.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


# 1. Schema do Pydantic para validação e documentação automática no Swagger
class UserRegisterSchema(BaseModel):
    username: str
    email: EmailStr  # O Pydantic já pré-valida formato de e-mail básico!
    password: str
    password_confirm: str
    birthdate: date  # Adicionei o campo de data de nascimento para validação


# 2. Rota de Registro
@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Registra um novo usuário",
)
def register(user_data: UserRegisterSchema, auth_service: AuthService = Depends(AuthService)):
    # Chama o método existente
    success, message = auth_service.register_user(
        username=user_data.username,
        password=user_data.password,
        password_confirm=user_data.password_confirm,
        email=str(user_data.email),
        birthdate=str(user_data.birthdate)
    )

    # Se o serviço retornar False, lançamos um erro 400 (Bad Request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    return {"message": message}

