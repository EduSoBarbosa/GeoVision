# Models

`python models/train.py dados.csv --out models/artifacts`
CSV: ndvi,ndbi,building_height,built_fraction,latitude,longitude,lst,year.
LST em °C; fração construída entre 0 e 1; altura em metros; WGS84.
Teste no último ano, imputação e padronização ajustadas somente no treino.
Saídas pipeline.joblib e metrics.json (MAE, RMSE, R²). Carregar somente artefatos confiáveis.
Normalização não é necessária ao XGBoost, mas está preparada conforme requisito.
Ainda faltam validação espacial, tuning, SHAP e integração da inferência à API.
Não inclua LST ou transformações dela nos atributos de entrada: vazamento do alvo.
