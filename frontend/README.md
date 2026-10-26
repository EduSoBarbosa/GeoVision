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
