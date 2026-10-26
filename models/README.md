# Machine learning · planejamento, treinamento e consumo

## Objetivo

Estimar/reconstruir a LST (°C) de uma observação com covariáveis contemporâneas.
Isso não é previsão meteorológica futura. Para prever uma data futura seriam
necessárias covariáveis disponíveis naquele instante e outra avaliação temporal.

## Contrato de dados

| Campo | Unidade/faixa | Origem |
| --- | --- | --- |
| `ndvi`, `ndbi` | −1 a 1 | Reflectância Landsat corrigida |
| `latitude`, `longitude` | WGS84; região de São Paulo | Centro do pixel |
| `lst` | °C, alvo | Landsat ST_B10/lwir11 |
| `year` | Inteiro | Data da aquisição |
| `scene_id` | Texto, recomendado | Procedência da cena |
| `building_height` | Metros, 0–500, apenas urban | Base externa compatível |
| `built_fraction` | 0–1, apenas urban | Base externa compatível |

`schema.py` valida números, intervalos, duplicatas e presença de features.
As features de entrada excluem LST, erro, anomalia térmica e derivados do alvo.
Valores ausentes são rejeitados: não há preenchimento silencioso de dados urbanos.

## Executar offline

Na raiz do projeto, com dependências instaladas:

```bash
python -m models.demo data/demo.csv
python -m models.train data/demo.csv --out data/experiments/demo --synthetic
python -m models.train meus_dados.csv --out data/experiments/real --strategy spatial --feature-set urban
```

O primeiro comando gera dados fictícios. `--synthetic` marca a procedência;
não omita essa opção para dados simulados. Experimentos CLI não são registrados
automaticamente na API; use `/ml/train` ou a interface para integrar registro e consumo.

## Avaliação

1. Contrato e consistência dos dados são verificados.
2. Divisão temporal: anos anteriores para treino, penúltimo para validação, último para teste.
3. Alternativa spatial: grupos aproximados de 1 km, 60/20/20 por grupos. Não há buffer.
4. StandardScaler é ajustado dentro da pipeline somente no treino. Árvores não exigem essa escala, mas ela mantém o contrato explícito.
5. Baseline médio, Random Forest e XGBoost são comparados pelo MAE da validação.
6. Importância por permutação é calculada na validação, antes do refit.
7. O vencedor é reajustado em treino+validação e avaliado no teste reservado.
8. MAE, RMSE, R², limites de treino, hashes, versões e erros individuais são salvos.

O conjunto de teste não escolhe o modelo. Repetir escolhas humanas após observar
o teste ainda pode produzir sobreajuste: registre decisões e reserve uma avaliação final.
O split temporal pode repetir locais e mede generalização temporal, não espacial.
O split espacial mantém um bloco em apenas uma partição, mas não elimina dependência
entre blocos vizinhos. Não há validação conjunta espaço-temporal nesta versão.

## Artefatos e consumo

- `pipeline.joblib`: pipeline completa (somente artefatos locais confiáveis).
- `metadata.json`: métricas, split, features, procedência e SHA-256.
- `test_predictions.csv`: localização, ano, alvo, previsão e erro do teste.
- `training.csv`: cópia do dataset efetivamente usado pelo worker.

`Predictor` verifica hash antes de desserializar, valida features e emite avisos
para extrapolação em relação aos limites de treino. O hash detecta corrupção;
não torna um arquivo pickle não confiável seguro. A API não aceita upload de modelos.

`POST /ml/predict` recebe de 1 a 2000 linhas; `POST /ml/explain` aceita uma linha.
TreeSHAP fornece contribuições em °C para RF/XGBoost. Baseline constante retorna
contribuições zero. SHAP descreve o modelo e não prova causalidade.

O modelo ativo é escolhido explicitamente pelo administrador. Sintéticos são
bloqueados para publicação, mas podem ser usados por ID no laboratório privado.
O endpoint público de status informa o modelo ativo e suas métricas.

## Critérios de evolução

Veja `../docs/PLANO_ML.md`: QA adicional, validação externa, ablações, versões de
bases urbanas, drift, monitoramento e critérios de publicação científica.
