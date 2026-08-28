from fastapi import FastAPI

app = FastAPI(title="GeoVision API")

# Criando o import após a criação do app para evitar problemas de importação circular
from backend.routes.rotas_autenticacao import auth_router


# Registra as rotas na aplicação
app.include_router(auth_router)

# Para rodar a aplicação use o comando no terminal: uvicorn backend.routes.main:app --reload




