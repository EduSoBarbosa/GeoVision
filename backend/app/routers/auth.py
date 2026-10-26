import hashlib
import secrets
from datetime import timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError
from fastapi import APIRouter, Depends, HTTPException, Request
from pymongo.errors import DuplicateKeyError

from backend.app.core import consume_quota, current_user, get_db, now, settings
from backend.app.schemas import Credentials, Verification
from backend.app.services.mail import send_verification

router = APIRouter(prefix="/api/v1/auth", tags=["Conta"])
password_hasher = PasswordHasher()


def throttle(request):
    ip = request.client.host if request.client else "unknown"
    consume_quota(
        "auth:"
        + hashlib.sha256(ip.encode()).hexdigest()
        + now().strftime("%Y%m%d%H%M"),
        20,
    )


@router.post("/register", status_code=201)
def register(body: Credentials, request: Request):
    throttle(request)
    email = str(body.email).lower()
    token = secrets.token_urlsafe(32)
    try:
        get_db().users.insert_one(
            {
                "email": email,
                "password": password_hasher.hash(body.password),
                "verified": False,
                "verification": hashlib.sha256(token.encode()).hexdigest(),
                "expires": now() + timedelta(hours=1),
                "plan": "Free",
                "created_at": now(),
            }
        )
    except DuplicateKeyError:
        raise HTTPException(409, "Email já cadastrado; entre ou reenvie a verificação")
    try:
        dev_token = send_verification(email, token)
    except Exception as exc:
        # Conta permanece para reenvio, sem revelar detalhes do servidor SMTP.
        raise HTTPException(
            503, "Cadastro salvo, mas o email falhou. Use reenviar verificação."
        ) from exc
    result = {"message": "Confira o email de verificação (Mailpit no ambiente local)."}
    if dev_token:
        result["development_verification_token"] = dev_token
    return result


@router.post("/resend")
def resend(body: Credentials, request: Request):
    throttle(request)
    account = get_db().users.find_one(
        {"email": str(body.email).lower(), "verified": False}
    )
    try:
        if not account:
            raise ValueError()
        password_hasher.verify(account["password"], body.password)
    except (VerificationError, ValueError):
        raise HTTPException(400, "Conta ou credenciais inválidas")
    token = secrets.token_urlsafe(32)
    get_db().users.update_one(
        {"_id": account["_id"]},
        {
            "$set": {
                "verification": hashlib.sha256(token.encode()).hexdigest(),
                "expires": now() + timedelta(hours=1),
            }
        },
    )
    try:
        dev_token = send_verification(account["email"], token)
    except Exception as exc:
        raise HTTPException(503, "Falha no envio do email") from exc
    return {
        "message": "Verificação reenviada",
        **({"development_verification_token": dev_token} if dev_token else {}),
    }


@router.post("/verify")
def verify(body: Verification, request: Request):
    throttle(request)
    result = get_db().users.update_one(
        {
            "verification": hashlib.sha256(body.token.encode()).hexdigest(),
            "expires": {"$gt": now()},
        },
        {"$set": {"verified": True}, "$unset": {"verification": "", "expires": ""}},
    )
    if not result.modified_count:
        raise HTTPException(400, "Token inválido ou expirado")
    return {"verified": True}


@router.post("/login")
def login(body: Credentials, request: Request):
    throttle(request)
    account = get_db().users.find_one({"email": str(body.email).lower()})
    try:
        if not account:
            raise ValueError()
        password_hasher.verify(account["password"], body.password)
    except (VerificationError, ValueError):
        raise HTTPException(401, "Credenciais inválidas")
    if not account["verified"]:
        raise HTTPException(403, "Verifique seu email")
    token = jwt.encode(
        {
            "sub": account["email"],
            "iss": "geovision",
            "exp": now() + timedelta(hours=8),
            "iat": now(),
        },
        settings.jwt_secret,
        algorithm="HS256",
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def me(account=Depends(current_user)):
    return {
        "email": account["email"],
        "plan": account["plan"],
        "admin": account["email"] == settings.admin_email.lower(),
    }
