from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

# Configurações do banco de dados durante desenvolvimento usaremos SQLite local mas após a conclusão do projeto
# podemos mudar para PostgreSQL ou MySQL, para isso basta alterar a string de conexão do banco de dados abaixo.
db = create_engine('sqlite:///GeoVision/backend/database/geo_vision.db', echo=True)

# Cria a base declarativa para os modelos do SQLAlchemy
base = declarative_base()

# Cria as tabelas/classes no banco de dados

# Usuários

# Outras tabelas ficarão aqui, como por exemplo: tabelas de imagens, tabelas de resultados de análises, etc.




# Executa a criação das tabelas no banco de dados


