# Frontend · React Native + Expo

## Executar

```bash
npm ci
npm run web
# Android/iOS via Expo Go compatível com SDK 54:
npm start
# Bundle estático para Nginx:
npm run build
```

`EXPO_PUBLIC_API_URL` em `.env` configura a API. A URL é embutida no build;
modificá-la em uma instalação estática exige reconstruir a imagem web.

## Telas e interações

- Explore: mapa didático, legenda fixa, seleção de pontos e desenho de visitas.
- Analytics: LST, NDVI, NDBI, inferência sobre pontos exibidos e erro previsto−observado.
- Dados: catálogo Landsat, recorte, download, importação CSV, dataset sintético e fila.
- Machine Learning: seleção de datasets, estratégia, comparação, publicação e SHAP.
- Visitas: data, notas, status e confirmação de exclusão.
- Desenvolvedores: planos ilustrativos, cotas, chaves e OpenAPI.
- Conta: cadastro, verificação de email, login e sessão em memória.

## Mapa e mobile

Leaflet 1.9.4 renderiza numa iframe sandbox no web e WebView no Android/iOS.
O wrapper valida a origem da mensagem pela janela do iframe; conteúdos de
popups usam textContent. Leaflet é incluído no build; apenas os tiles © OpenStreetMap exigem internet.
Não há modo offline ou cache de tiles; respeite a política de uso do provedor.
Para tráfego público elevado, configure um provedor de tiles apropriado.

A UI adapta navegação e cartões à largura. Exportação de arquivos por botão é
web-only; no mobile há mensagem explícita. Importação por texto funciona em ambos.
O mapa mostra até 2 mil amostras da página inicial, com contagem de pontos e total;
clientes API podem paginar. Não representa um raster contínuo nem uma média municipal.

`src/api.js` centraliza chamadas e erros. Tokens ficam em memória: recarregar a
página encerra a sessão local. O botão Sair não revoga JWTs já emitidos no servidor.

## Validação

`npm run check` verifica formatação; `npm run build` exporta a web.
O estado de testes em navegador/dispositivo está em `../ESTADO_ATUAL.md`.

## Identidade visual

A interface segue o `DESIGN.md` da raiz: superfícies escuras, gradiente verde
na abertura, acentos menta, cartões arredondados e navegação superior com menu
compacto nas telas menores. A implementação mantém React Native, Expo e Leaflet.
Na web, Manrope e Geist Mono são carregadas pelo Google Fonts; sem acesso à
rede, a interface usa as fontes alternativas sans-serif e monospace.

O botão “Explorar o mapa” leva à seção de exploração. A legenda acompanha a
camada selecionada, preservando a escala térmica e os fluxos da API existentes.

## Demonstração interativa

A demonstração é o modo padrão. Execute `npm run web` para usá-la sem backend.
A conta fictícia de pesquisador já inicia conectada. O roteiro no topo guia
mapa → dados → treinamento → analytics → visitas → API.

- Mapa: 300 pontos sintéticos, três regiões, quatro anos e cenários de vegetação.
- Dados: catálogo fictício filtrável, coleta com recorte, fila simulada, CSV de exemplo,
  importação validada e exportações CSV/GeoJSON.
- Modelos: experimentos preenchidos, progresso de treinamento simulado, ativação
  local, laboratório de índices, previsão por fórmula e contribuições explicadas.
- Visitas: desenho no mapa, criação, edição, datas, notas, status e exclusão.
- API: chaves fictícias, revogação e consulta local com resposta JSON e contador.

Datasets, visitas, modelos e tarefas ficam no `localStorage` na web. O botão
“Reiniciar demonstração” restaura os exemplos após confirmação. No aplicativo
nativo, a demo mantém o estado apenas enquanto o processo estiver aberto.
Todos os resultados analíticos, métricas e contas são fictícios. O mapa-base
OpenStreetMap e as fontes web ainda exigem internet; os pontos e controles são locais.
Nenhuma senha ou chave real é necessária. Downloads de arquivos continuam web-only.

Para usar a API real, configure `EXPO_PUBLIC_DEMO_MODE=false` antes de iniciar
ou compilar o Expo, junto de `EXPO_PUBLIC_API_URL`. A seleção do modo é incorporada
no bundle. Execute `npm run test:demo` para testar os fluxos locais.
