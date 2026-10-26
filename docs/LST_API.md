# LST via API

É possível consultar Landsat Collection 2 Level-2 pelo STAC do Microsoft Planetary Computer.

## Rota adicionada

`GET /api/v1/landsat/scenes?year=2025&cloud_cover=20&limit=20`

Busca cenas de julho, Landsat 8/9, processamento L2SP e assets térmicos.
A caixa geográfica cobre a região de São Paulo e não substitui o limite municipal.
A resposta contém a primeira página e sinaliza `has_more`; paginação automática ainda não implementada.

## Etapas necessárias para obter LST utilizável

1. Consultar cenas e selecionar data/procedência.
2. Assinar os URLs usando `planetary_computer.sign` (SAS temporário).
3. Ler os GeoTIFFs de temperatura e QA com Rasterio, recortando a área de interesse.
4. Mascarar fill, nuvens, cirrus, sombras e neve conforme QA_PIXEL; conferir saturação e qualidade térmica.
5. Converter DN: `LST °C = DN × 0.00341802 + 149 − 273.15`. DN zero é fill.
6. Salvar procedência, data, CRS, resolução e pixels válidos; integrar resultados ao MongoDB e mapa.

O filtro de nuvens da cena inteira não garante pixels válidos no recorte. LST mede a superfície, não temperatura do ar. Não há observação contínua em tempo real. A existência de cena em 2019 deve ser consultada, não presumida.

## Validação nesta entrega

Testes locais com resposta simulada cobrem o contrato da rota, validação e escala numérica. Não houve validação ponta a ponta com download de raster real. A consulta externa no ambiente foi impedida pela configuração de proxy/dependência SOCKS. A integração de ingestão permanece pendente.

## Fontes

- https://stacspec.org/en/tutorials/reading-stac-planetary-computer/
- https://planetarycomputer.microsoft.com/dataset/landsat-c2-l2
- https://www.usgs.gov/landsat-missions/landsat-collection-2-surface-temperature

## Download e tratamento implementados nesta revisão

`POST /api/v1/landsat/download` exige `Authorization: Bearer <token>`.
No Swagger `/docs`, execute cadastro/verificação/login, copie o token para o
campo `authorization` da rota e use:

```json
{
  "scene_id": "IDENTIFICADOR_L2SP_RETORNADO_PELA_BUSCA",
  "bbox": [-46.65, -23.56, -46.64, -23.55]
}
```

A resposta é um GeoTIFF float32 em °C, com CRS e alinhamento nativos,
NoData = -9999 e tags de origem, data e contagem de pixels válidos.
O header `X-Valid-Fraction` informa a fração válida no recorte.
URLs são resolvidos pelo servidor no catálogo e assinados para leitura remota.
Rasterio baixa os blocos necessários à janela (não a cena inteira).

A máscara rejeita bits 0–5 de QA_PIXEL: fill, nuvem dilatada, cirrus,
nuvem, sombra e neve; também rejeita DN zero e NoData dos rasters.
Água é preservada. Pixels rejeitados ficam ausentes, sem interpolação.
QA_RADSAT, ST_QA e limiar de distância de nuvens ainda não são aplicados.
Portanto, a máscara não garante remoção de toda contaminação atmosférica.

Limites: 4 milhões de pixels por chamada, bbox regional, apenas Landsat 8/9
L2SP. A janela é limitada à interseção da cena; as bordas seguem a grade
original. Arquivos temporários são removidos após a resposta.
Ingestão no MongoDB e botão de download no frontend ainda não integrados;
use a rota pelo Swagger ou cliente HTTP.

Os itens anteriores que indicavam ausência de download ficam substituídos
por esta seção. A validação inclui GeoTIFFs locais sintéticos e contrato HTTP;
não equivale à validação de uma cena real processada de ponta a ponta.

Consulta remota confirmada: catálogo retornou HTTP 200 e cena LC09_L2SP_219076_20250724_02_T1. O processamento remoto completo é verificado separadamente.

Tentativa real de leitura do raster bloqueada pelo certificado SSL autoassinado do ambiente (Rasterio/CURL). Verificação TLS mantida ativa. Não foi concluído o teste remoto ponta a ponta.
