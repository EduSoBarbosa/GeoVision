# GeoVision

## Estrutura do Trabalho
O geoVision é uma junção de preditor de ilhas de calor urbana em são paulo para educação e aula com a versão profissional com a opção de demarcação de área para visita de um gestor urbano e com  disponibilização de rotas apis para desenvolvedores tambem.

## Estrutura de API´s
* Desenvolva as principais rotas que possibilitem o sistema enviar e receber informações cruciais para: Opção de demarcação de área para visita posterior do gestor, Mapa 2d de são paulo disponibilizado de forma pouco detalhada para muito detalhada(para profissionais), Um sobre nós com texto profissional sem aparenter ter texto de ia, rotas apis para a versão desenvolvedor com envio de informçaões fundamentais para desenvolvimento de software e opções de limite por plano (Free, plus, pro, team), Inicialmente deixe o cors aberto para toas as redes para teste

* Crie testes para cada rota e função que a rota usar(unitários e gerais)

* Use FastApi no backend

* Forneça rotas para o sistema de machine learning que havera posteriormente ele vai prever a LST de são paulo (leia machine learning antes disso)

## Machine Learning
* Desenvolva o ambiente que permita o treinamento e normalização de dados para um modelo que será treinado em XGBoost (mesmo sem ter os dados ainda) ele deve ser desenvolvido na pasta models e tambem devera ter teste

## MongoDb
* O principal banco a ser utilizado neste trabalho é o mongoDb use ele para tudo (login, registre-se, armazenar lst, armazenar areas demarcadas para revisão, e etc) coloque a opção de demarcar na .env o link para o mongo db(crie .env)

# Front-End
O front é desenvolvido em react native para desenvolvimento mobile junto com web use a paleta de cores Verde Escuro, Azul Petroleo, cinza, branco e verde claro(que combine com o resto) 

* O front deve conter todos os elementos necessesários para atender aos requisitos anterior (mapa simples para educacional explicanado oq é lst e componentes de temperatura e clima junto a uma explicação tecnica simples do mapa, eum mapa avançado com explicações avançados sobres os mesmos temas, pagina de rotas api e documentação para devs com opções de planos e limites e valores, login, registre-se com verificação de email e senha simples)

* O site deve seguir os principios de INTERAÇÂO HUMANO COMPUTADOR coma criação de personas e seguir um estilo cientifico amigavel de visual.

* Consuma as apis do fastapi (que estão abertas a todas as rotas) e deixe funcional

