# Landsat: consulta, pixels, nuvens e dataset

## Fluxos

- `GET /api/v1/landsat/scenes`: catálogo de julho/ano, nuvens e primeira página.
- `POST /api/v1/landsat/download`: download síncrono de recorte LST em GeoTIFF.
- `POST /api/v1/landsat/collect`: fila assíncrona, recorte + índices + dataset.
- `GET /api/v1/jobs/{id}`: progresso e falhas.
- `GET /api/v1/datasets/{id}/download?kind=tif`: raster após coleta.
- `GET /api/v1/datasets/{id}/download?kind=csv`: amostras para ML.

As rotas de processamento exigem conta verificada. Corpo:

```json
{
  "scene_id": "LC09_L2SP_219076_20250724_02_T1",
  "bbox": [-46.65, -23.56, -46.64, -23.55]
}
```

O ID acima foi retornado pelo catálogo em teste anterior; existência não garante
pixels válidos ou condições adequadas. Prefira um ID da busca atual.
A bbox é oeste, sul, leste, norte em WGS84, limitada à caixa regional suportada.
A caixa não substitui o polígono administrativo de São Paulo.

## Tratamento implementado

1. Resolver item STAC da coleção landsat-c2-l2, Landsat 8/9 L2SP.
2. Assinar assets temporariamente com Planetary Computer.
3. Ler janela remota com Rasterio, respeitando CRS e alinhamento.
4. Rejeitar DN zero, máscaras nativas e bits QA_PIXEL 0–5 (fill, nuvem dilatada,
   cirrus, nuvem, sombra, neve). Água permanece.
5. Converter `LST °C = DN × 0.00341802 + 149 − 273.15`.
6. GeoTIFF float32: NoData −9999, metadados, contagem válida e CRS original.
7. Coleta: amostrar até 10 mil pontos válidos e ler red, nir08 e swir16 nos centros.
8. Reflectância: `DN × 0.0000275 − 0.2`; NDVI=(NIR−Red)/(NIR+Red),
   NDBI=(SWIR−NIR)/(SWIR+NIR). Denominador zero, faltantes e índices fora de faixa são removidos.
9. CSV no volume; amostras GeoJSON e metadados no MongoDB.

Máximo 4 milhões de pixels por recorte. Janela arredondada à grade e limitada à
interseção da cena; não há reprojeção arbitrária ou interpolação de nuvens.
O raster contém a resolução original do produto entregue, não super-resolução térmica.

## Limitações

Primeira página do catálogo com has_more; paginação automática histórica não implementada.
Coleta só de julho no frontend. Máscara QA não elimina toda contaminação residual.
QA_RADSAT, ST_QA, distância de nuvens e buffers não estão ativos. Resultados exigem
inspeção científica antes de treinar um modelo destinado a uso real.
No modo de teste desta entrega, o processamento é validado com rasters locais;
a validação remota ponta a ponta não foi concluída por restrição TLS do ambiente anterior.

## Fontes técnicas

- https://planetarycomputer.microsoft.com/dataset/landsat-c2-l2
- https://stacspec.org/en/tutorials/reading-stac-planetary-computer/
- https://www.usgs.gov/landsat-missions/landsat-collection-2-surface-temperature
- https://www.usgs.gov/landsat-missions/landsat-collection-2-quality-assessment-bands
- https://rasterio.readthedocs.io/en/stable/topics/windowed-rw.html
