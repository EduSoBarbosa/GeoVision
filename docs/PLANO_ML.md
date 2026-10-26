# Plano de machine learning e dados

## Pergunta operacional

Com vegetação, ocupação espectral e localização contemporâneas, qual é o erro de
reconstrução da LST em anos ou regiões não usados no ajuste? A versão urban investiga
se altura e fração construída acrescentam sinal quando essas bases estiverem disponíveis.

## Etapas e critérios de aceite

| Etapa | Entrega | Critério |
| --- | --- | --- |
| Catálogo | Inventário de cenas por julho/ano | Data, plataforma, nuvens e disponibilidade L2SP |
| QA | Raster LST com NoData e metadados | Checar máscara visualmente e registrar fração válida |
| Features | NDVI/NDBI e localização | Escalas aplicadas uma vez, mesma cena, alinhamento espacial |
| Dados urbanos | Altura/impermeabilização | Fonte, licença, data e resolução compatíveis |
| Dataset | CSV validado e versionado | Sem duplicatas, alvo separado, unidades corretas |
| Experimento | Baseline/RF/XGBoost | Split definido antes de comparar modelos |
| Avaliação | Erros em °C, mapas e estratos | Avaliar ano, região, faixa térmica e cobertura |
| Explicação | SHAP e permutação | Associação, sem interpretação causal automática |
| Publicação | Versão ativa revisada | Modelo real, artefato íntegro e aceite científico humano |
| Operação | Acompanhamento de entradas | Drift, faltantes, latência e falhas documentadas |

## O que já está automatizado

Coleta por cena/recorte, amostragem espectral, validação do contrato, divisão
train/validation/test, comparação, normalização, refit, métricas, relatório de
erros, registro, publicação manual, inferência e SHAP.

## Experimentos recomendados para a pesquisa

1. Baseline global versus modelos espectrais, usando exatamente as mesmas partições.
2. Ablar localização: verificar se a performance depende excessivamente de latitude/longitude.
3. Comparar spectral e urban apenas após compatibilizar os dados de edificações.
4. Repetir spatial com blocos maiores e buffer, além de holdout temporal externo.
5. Estratificar erros por densidade urbana, NDVI e temperatura; avaliar resíduos em mapa.
6. Testar estabilidade entre sementes e registrar tempo/memória de treinamento.

Não foi estabelecido um MAE aceitável sem dados reais. O aceite deve comparar o
modelo com baseline, variabilidade e finalidade de uso, evitando um limiar arbitrário.

## Lacunas científicas explícitas

QA_RADSAT e ST_QA não são filtros operacionais ainda. Temperatura pode ter lacunas
persistentes por emissividade/ASTER. NDVI/NDBI não substituem uso do solo validado.
A resolução térmica nativa não passa a ser 30 m por reamostragem. Amostras próximas
não são independentes. A anomalia relativa ao mapa não define SUHI sem referência rural.

Não há modelo de previsão climática, análise causal de intervenções, intervalo de
incerteza calibrado, monitoramento automático de drift nem teste externo aprovado.
