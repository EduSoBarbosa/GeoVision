from fastapi import FastAPI
from Modules.Routes.routes_auth_service import router as auth_router

app = FastAPI(title="GeoVision API")

# Registra as rotas de autenticação na aplicação
app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "API rodando com sucesso!"}