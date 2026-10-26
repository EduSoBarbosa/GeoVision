import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import {
  Badge,
  Button,
  Card,
  Field,
  Metric,
  Paragraph,
  Row,
  colors,
} from "../components/ui";
const SAMPLE = JSON.stringify(
  [
    {
      ndvi: 0.5,
      ndbi: 0.1,
      latitude: -23.55,
      longitude: -46.63,
    },
  ],
  null,
  2,
);
export default function MLScreen({
  api,
  run,
  token,
  account,
  notify,
  download,
}) {
  const [datasets, setDatasets] = useState([]),
    [selected, setSelected] = useState([]),
    [models, setModels] = useState([]),
    [model, setModel] = useState(null),
    [strategy, setStrategy] = useState("temporal"),
    [featureSet, setFeatureSet] = useState("spectral"),
    [rows, setRows] = useState(SAMPLE),
    [prediction, setPrediction] = useState(null),
    [explanation, setExplanation] = useState(null),
    [active, setActive] = useState(null);
  async function refresh() {
    const status = await api("/ml/status");
    setActive(status.active_model);
    if (token) {
      const [ds, ms] = await Promise.all([api("/datasets"), api("/ml/models")]);
      setDatasets(ds);
      setModels(ms);
    }
  }
  useEffect(() => {
    run(refresh);
  }, [token]);
  return (
    <>
      <Row>
        <Metric
          label="Modelo ativo"
          value={active?.winner || "Nenhum"}
          note={active?.id || "Previsões públicas aguardam publicação."}
        />
        <Metric
          label="Experimentos disponíveis"
          value={String(models.length)}
        />
      </Row>
      <Card title="Planejar um experimento">
        <Paragraph>
          1. Selecione datasets compatíveis. 2. Escolha o recorte de avaliação.
          3. Treine. O worker compara baseline, Random Forest e XGBoost; escolhe
          pela validação e avalia uma única vez no teste reservado.
        </Paragraph>
        <Row>
          {datasets.map((d) => (
            <Button
              key={d.id}
              secondary={!selected.includes(d.id)}
              onPress={() =>
                setSelected(
                  selected.includes(d.id)
                    ? selected.filter((x) => x !== d.id)
                    : [...selected, d.id],
                )
              }
            >
              {d.name.slice(0, 25)} {d.synthetic ? "[sintético]" : ""}
            </Button>
          ))}
        </Row>
        <Paragraph>Estratégia de avaliação</Paragraph>
        <Row>
          {["temporal", "spatial"].map((x) => (
            <Button
              key={x}
              secondary={strategy !== x}
              onPress={() => setStrategy(x)}
            >
              {x === "temporal" ? "Outro ano" : "Outros blocos espaciais"}
            </Button>
          ))}
        </Row>
        <Paragraph muted>
          {strategy === "temporal"
            ? "Requer 3 anos: anteriores para treino, penúltimo para validação, último para teste."
            : "Blocos geográficos aproximados de 1 km; ao menos 10 blocos. Não inclui buffer entre blocos."}
        </Paragraph>
        <Row>
          {["spectral", "urban"].map((x) => (
            <Button
              key={x}
              secondary={featureSet !== x}
              onPress={() => setFeatureSet(x)}
            >
              {x === "spectral"
                ? "NDVI + NDBI + localização"
                : "+ altura e fração construída"}
            </Button>
          ))}
        </Row>
        <Paragraph muted>
          Altura predial e fração construída precisam de fonte externa; não são
          inventadas a partir do satélite.
        </Paragraph>
        <Row>
          <Button
            disabled={!account?.admin || selected.length === 0}
            onPress={() =>
              run(async () => {
                await api("/ml/train", "POST", {
                  dataset_ids: selected,
                  feature_set: featureSet,
                  strategy,
                });
                notify(
                  "Treino enfileirado. Acompanhe em Dados e atualize os experimentos ao concluir.",
                );
              })
            }
          >
            Iniciar treinamento
          </Button>
          <Button secondary onPress={() => run(refresh)}>
            Atualizar experimentos
          </Button>
        </Row>
        {!account?.admin && (
          <Paragraph>
            Treinamento e publicação exigem a conta administradora configurada.
          </Paragraph>
        )}
      </Card>
      <Card title="Registro de modelos">
        {models.length === 0 && (
          <Paragraph muted>
            Crie um dataset sintético em Dados para testar o fluxo, ou importe
            suas observações reais.
          </Paragraph>
        )}
        {models.map((m) => (
          <Card key={m.id} title={`${m.winner} · ${m.id.slice(0, 8)}`}>
            <Row>
              <Badge>{m.synthetic ? "SINTÉTICO" : "DADOS IMPORTADOS"}</Badge>
              <Badge>{m.strategy}</Badge>
            </Row>
            <Paragraph>
              Teste: MAE {m.test.mae.toFixed(3)} °C · RMSE{" "}
              {m.test.rmse.toFixed(3)} °C · R²{" "}
              {m.test.r2?.toFixed(3) ?? "indefinido"}
            </Paragraph>
            <Paragraph muted>
              Treino / validação / teste: {m.split_sizes.train} /{" "}
              {m.split_sizes.validation} / {m.split_sizes.test}
            </Paragraph>
            {Object.entries(m.validation).map(([name, v]) => (
              <View key={name}>
                <Paragraph>
                  {name} · MAE validação {v.mae.toFixed(3)} °C
                </Paragraph>
                <View
                  style={{
                    height: 7,
                    backgroundColor: "#E8EEE5",
                    borderRadius: 5,
                  }}
                >
                  <View
                    style={{
                      height: 7,
                      width: `${Math.min(100, (v.mae / Math.max(...Object.values(m.validation).map((x) => x.mae))) * 100)}%`,
                      backgroundColor: colors.petrol,
                      borderRadius: 5,
                    }}
                  />
                </View>
              </View>
            ))}
            <Row>
              <Button
                secondary={model?.id !== m.id}
                onPress={() => {
                  setModel(m);
                  setPrediction(null);
                  setExplanation(null);
                }}
              >
                Usar no laboratório
              </Button>
              <Button
                secondary
                onPress={() =>
                  run(() =>
                    download(
                      `/ml/models/${m.id}/report`,
                      "test_predictions.csv",
                    ),
                  )
                }
              >
                Exportar erros de teste
              </Button>
              {account?.admin && !m.synthetic && (
                <Button
                  secondary
                  onPress={() =>
                    run(async () => {
                      await api(`/ml/models/${m.id}/activate`, "POST");
                      notify("Modelo publicado.");
                      await refresh();
                    })
                  }
                >
                  Publicar como ativo
                </Button>
              )}
            </Row>
          </Card>
        ))}
      </Card>
      <Card title="Consumir previsões e explicar o modelo">
        <Paragraph>
          {model
            ? `Modelo selecionado: ${model.id}`
            : "Será usado o modelo ativo, se disponível."}
        </Paragraph>
        {model?.synthetic && (
          <Badge>RESULTADOS SINTÉTICOS — USO DIDÁTICO</Badge>
        )}
        <Paragraph>
          Envie uma lista JSON com as features:{" "}
          {(model?.features || ["ndvi", "ndbi", "latitude", "longitude"]).join(
            ", ",
          )}
          .
        </Paragraph>
        <Field
          label="Observações para inferência"
          value={rows}
          onChangeText={setRows}
          multiline
        />
        <Row>
          <Button
            disabled={!token}
            onPress={() =>
              run(async () => {
                const r = await api("/ml/predict", "POST", {
                  rows: JSON.parse(rows),
                  model_id: model?.id || null,
                });
                setPrediction(r);
              })
            }
          >
            Prever LST
          </Button>
          <Button
            secondary
            disabled={!token}
            onPress={() =>
              run(async () => {
                const r = await api("/ml/explain", "POST", {
                  rows: [JSON.parse(rows)[0]],
                  model_id: model?.id || null,
                });
                setExplanation(r);
              })
            }
          >
            Explicar primeiro ponto
          </Button>
        </Row>
        {prediction && (
          <>
            <Paragraph>
              Previsões (°C):{" "}
              {prediction.lst_celsius.map((x) => x.toFixed(2)).join(", ")}
            </Paragraph>
            {prediction.warnings.map((w) => (
              <Paragraph key={w}>{w}</Paragraph>
            ))}
          </>
        )}
        {explanation && (
          <>
            <Paragraph>
              Base: {explanation.base_value.toFixed(2)} °C → previsão:{" "}
              {explanation.prediction.toFixed(2)} °C
            </Paragraph>
            {Object.entries(explanation.contributions).map(([k, v]) => (
              <Paragraph key={k}>
                {k}: {v >= 0 ? "+" : ""}
                {v.toFixed(3)} °C
              </Paragraph>
            ))}
            <Paragraph muted>
              SHAP explica associações aprendidas. Alterar uma feature aqui não
              simula um efeito causal na cidade.
            </Paragraph>
          </>
        )}
      </Card>
    </>
  );
}
