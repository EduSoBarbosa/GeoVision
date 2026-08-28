from fastapi import APIRouter

# Cria um roteador para as rotas de autenticação usando APIRouter
# passando o caminho base para as rotas de autenticação com "/autenticacao" 
# Depois você pode criar tags para facilitar na documentação automática da API passando a lista de tags após "tags="
auth_router = APIRouter(prefix='/autenticacao', tags=['Autenticação'])

# após o nome do roteador (nesse caso auth_router) você pode criar as rotas de autenticação usando os decoradores do FastAPI,
# como @auth_router.post(), @auth_router.get(), etc. Sendo o valor após o . o método HTTP que você deseja usar para a rota.
# podendo ser: Get, Post Put, Delete, Patch.

# Lembrando que a comunicação web é feita via json então você pode retornar um dicionário python
# que será convertido para json automaticamente pelo FastAPI, ou você pode retornar um objeto do tipo Response do FastAPI,
# caso queira retornar algo diferente de json.

# O FastAPI usa async/await para lidar com requisições assíncronas
@auth_router.get('/')
async def raiz_autenticacao():
    """
    Retorna uma mensagem de boas-vindas para a rota de autenticação.
    """
    return {"message": "Bem vindo à rota de autenticação!"}

