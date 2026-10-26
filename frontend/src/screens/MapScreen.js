import React, { useEffect, useState } from "react";
import GeoMap from "../components/GeoMap";
import {
  Badge,
  Button,
  Card,
  Field,
  Metric,
  Paragraph,
  Row,
} from "../components/ui";

export default function MapScreen({ api, run, token, advanced, notify }) {
  const [features, setFeatures] = useState([]),
    [datasets, setDatasets] = useState([]),
    [models, setModels] = useState([]),
    [modelId, setModelId] = useState(null),
    [predictionSource, setPredictionSource] = useState(null),
    [source, setSource] = useState("demo"),
    [layer, setLayer] = useState("lst"),
    [selected, select] = useState(null),
    [synthetic, setSynthetic] = useState(true),
    [total, setTotal] = useState(0);
  const [drawing, draw] = useState(false),
    [vertices, setVertices] = useState([]),
    [name, setName] = useState("Nova visita"),
    [mapKey, resetMap] = useState(0);
  async function load(id) {
    const result = await api(
      id === "demo" ? "/demo/map" : `/map?dataset_id=${id}`,
    );
    setFeatures(result.features);
    setTotal(result.total || result.features.length);
    setSynthetic(result.synthetic);
    setSource(id);
    setLayer("lst");
    setPredictionSource(null);
    select(null);
  }
  useEffect(() => {
    run(() => load("demo"));
    if (token)
      run(async () => {
        setDatasets(await api("/datasets"));
        setModels(await api("/ml/models"));
      });
  }, [token]);
  const values = features.map((f) => f.properties.lst).filter(Number.isFinite);
  const average = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : null;
  function event(message) {
    if (message.type === "pixel") select(message);
    else setVertices(message.coordinates);
  }
  async function save() {
    await api("/areas", "POST", {
      name,
      coordinates: vertices,
      notes: "Área selecionada no mapa",
    });
    notify("Área salva em Visitas.");
    draw(false);
    setVertices([]);
    resetMap((k) => k + 1);
  }
  async function predictMap() {
    const rows = features.map((f) => ({
      ...f.properties,
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
    }));
    const numericRows = rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).filter(
          ([key, value]) =>
            [
              "ndvi",
              "ndbi",
              "latitude",
              "longitude",
              "building_height",
              "built_fraction",
            ].includes(key) && typeof value === "number",
        ),
      ),
    );
    const result = await api("/ml/predict", "POST", {
      rows: numericRows,
      model_id: modelId,
    });
    setFeatures(
      features.map((feature, index) => ({
        ...feature,
        properties: {
          ...feature.properties,
          predicted_lst: result.lst_celsius[index],
          error: result.lst_celsius[index] - feature.properties.lst,
        },
      })),
    );
    setPredictionSource(
      result.synthetic
        ? "Modelo sintético"
        : "Modelo treinado em dados importados",
    );
    setLayer("predicted_lst");
    if (result.warnings.length) notify(result.warnings.join("; "));
  }
  return (
    <>
      <Row>
        <Badge>
          {synthetic ? "DEMONSTRAÇÃO SINTÉTICA" : "OBSERVAÇÕES IMPORTADAS"}
        </Badge>
        <Paragraph muted>
          {advanced
            ? "Analytics / leitura técnica"
            : "Explore / leitura educacional"}
        </Paragraph>
      </Row>
      <Paragraph>
        Observe padrões térmicos e consulte os pontos do mapa. A cor representa
        a variável selecionada.
      </Paragraph>
      <Row>
        <Metric
          label="LST média da amostra exibida"
          value={average === null ? "—" : `${average.toFixed(1)} °C`}
        />
        <Metric
          label="Pontos exibidos / disponíveis"
          value={`${features.length} / ${total}`}
        />
        <Metric
          label="Origem"
          value={synthetic ? "Sintética" : "Dataset"}
          note="Consulte procedência e datas na aba Dados."
        />
      </Row>
      <Card title="Mapa de superfície">
        <Row>
          <Button
            secondary={source !== "demo"}
            onPress={() => run(() => load("demo"))}
          >
            Demonstração
          </Button>
          {datasets.map((d) => (
            <Button
              key={d.id}
              secondary={source !== d.id}
              onPress={() => run(() => load(d.id))}
            >
              {d.name.slice(0, 24)}
            </Button>
          ))}
        </Row>
        <Row>
          {(advanced
            ? [
                "lst",
                "ndvi",
                "ndbi",
                ...(predictionSource ? ["predicted_lst", "error"] : []),
              ]
            : ["lst"]
          ).map((x) => (
            <Button key={x} secondary={layer !== x} onPress={() => setLayer(x)}>
              {x.toUpperCase()}
            </Button>
          ))}
          <Button
            secondary
            onPress={() => {
              draw(!drawing);
              setVertices([]);
              resetMap((k) => k + 1);
            }}
          >
            {drawing ? "Cancelar desenho" : "Demarcar visita"}
          </Button>
        </Row>
        {advanced && (
          <Card title="Estimar a LST dos pontos exibidos">
            <Row>
              <Button
                secondary={modelId !== null}
                onPress={() => setModelId(null)}
              >
                Modelo ativo
              </Button>
              {models.map((m) => (
                <Button
                  key={m.id}
                  secondary={modelId !== m.id}
                  onPress={() => setModelId(m.id)}
                >
                  {m.winner} {m.synthetic ? "[sintético]" : ""}
                </Button>
              ))}
            </Row>
            <Button
              disabled={!token || features.length === 0}
              onPress={() => run(predictMap)}
            >
              Prever pontos exibidos
            </Button>
            {predictionSource && <Badge>{predictionSource}</Badge>}
            <Paragraph muted>
              O erro é previsão menos LST de referência. Esta camada é uma
              inspeção; não substitui o conjunto de teste reservado.
            </Paragraph>
          </Card>
        )}
        <GeoMap
          key={mapKey}
          features={features}
          layer={layer}
          drawing={drawing}
          onEvent={event}
        />
        <Paragraph muted>
          {["lst", "predicted_lst"].includes(layer)
            ? "Escala fixa: azul ≤18 °C → verde → amarelo → vermelho ≥40 °C."
            : layer === "error"
              ? "Erro: azul ≤−5 °C → verde 0 → vermelho ≥+5 °C."
              : "Índices: azul −1 → verde → vermelho +1."}{" "}
          Pontos são amostras, não um raster contínuo. Mapa-base ©
          OpenStreetMap.
        </Paragraph>
        {drawing && (
          <>
            <Paragraph>{vertices.length} vértices selecionados</Paragraph>
            <Field label="Nome da visita" value={name} onChangeText={setName} />
            <Row>
              <Button
                disabled={!token || vertices.length < 3}
                onPress={() => run(save)}
              >
                Salvar área
              </Button>
              <Button
                secondary
                onPress={() => {
                  setVertices([]);
                  resetMap((k) => k + 1);
                }}
              >
                Limpar desenho
              </Button>
            </Row>
            {!token && <Paragraph>Entre na sua conta para salvar.</Paragraph>}
          </>
        )}
      </Card>
      {selected && (
        <Card title="Ponto selecionado">
          <Paragraph>
            Latitude {selected.coordinates[1].toFixed(5)} · Longitude{" "}
            {selected.coordinates[0].toFixed(5)}
          </Paragraph>
          <Row>
            {["lst", "ndvi", "ndbi", "year"].map((k) => (
              <Badge key={k}>
                {k.toUpperCase()}:{" "}
                {Number(selected.properties[k]).toFixed(k === "year" ? 0 : 2)}
              </Badge>
            ))}
          </Row>
        </Card>
      )}
      <Card
        title={
          advanced
            ? "Como interpretar os resultados"
            : "Por que o asfalto e as árvores têm temperaturas diferentes?"
        }
      >
        <Paragraph>
          A LST mede a superfície de telhados, solo e vegetação. Materiais,
          umidade e sombra influenciam o aquecimento. Ela não é a temperatura do
          ar da previsão do tempo.
        </Paragraph>
        <Paragraph>
          {advanced
            ? "NDVI e NDBI são covariáveis, não causas isoladas. A máscara QA remove pixels sinalizados; nuvens residuais podem persistir. Comparar anos requer consistência sazonal e espacial. A grade de 30 m não aumenta a resolução térmica nativa do sensor."
            : "Use as cores para explorar diferenças, depois clique em um ponto. Os valores do modo demonstração são inventados para aprender a usar a ferramenta."}
        </Paragraph>
      </Card>
    </>
  );
}
