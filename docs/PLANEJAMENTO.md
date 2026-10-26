# Planejamento de evolução

## Concluído nesta versão

Modularização; autenticação SMTP/JWT; permissões por proprietário; visitas;
catálogo e recortes Landsat; QA de pixels; features espectrais; datasets;
fila persistente; pipeline ML comparativa; registro e consumo; SHAP; mapa
interativo; planos e cotas; Compose completo; testes, lint, lockfile e CI.

## Próximas entregas priorizadas

| Prioridade | Trabalho | Critério de conclusão |
| --- | --- | --- |
| P0 | Validar Compose em máquina do grupo | Todos os serviços healthy e percurso de laboratório concluído |
| P0 | Validar cena real ponta a ponta | Catálogo→raster→QA→CSV→mapa com revisão visual |
| P0 | Auditar dataset científico | Fontes, resolução, data, filtros e cobertura documentados |
| P1 | Melhorar QA | ST_QA, QA_RADSAT e buffers testados em cenas reais |
| P1 | Trazer bases de edificações | Compatibilidade temporal/espacial e licença verificadas |
| P1 | Avaliação científica externa | Holdout espaço-temporal com buffer e comparação com baseline |
| P1 | Acessibilidade e mobile | Usuários completam os fluxos sem auxílio; testes em aparelhos |
| P2 | Produção | Segurança, backup/restore, monitoramento, retenção e domínio |
| P2 | Escala | Tiles raster próprios, worker distribuído e armazenamento de objetos |

Sem cronograma fictício: responsáveis e estimativas devem ser definidos com a equipe.
Cada decisão deve registrar motivação, evidência e impacto no experimento.
Não publicar modelos pela simples aparência de uma métrica alta em pixels correlacionados.
