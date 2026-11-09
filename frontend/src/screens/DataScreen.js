import React, { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { SAMPLE_CSV } from "../demo";
import {
  Badge,
  Button,
  Card,
  Field,
  Paragraph,
  Row,
  colors,
} from "../components/ui";
export default function DataScreen({
  api,
  run,
  token,
  notify,
  download,
  demo,
  navigate,
}) {
  const [year, setYear] = useState("2025"),
    [cloud, setCloudCover] = useState("20"),
    [bbox, setBbox] = useState("-46.65,-23.56,-46.64,-23.55"),
    [scenes, setScenes] = useState([]),
    [datasets, setDatasets] = useState([]),
    [jobs, setJobs] = useState([]),
    [csv, setCsv] = useState("");
  async function refresh() {
    if (token) {
      const [d, j] = await Promise.all([api("/datasets"), api("/jobs")]);
      setDatasets(d);
      setJobs(j);
    }
  }
  useEffect(() => {
    run(refresh);
    const timer = setInterval(
      () => {
        if (token) refresh().catch(() => {});
      },
      demo ? 1000 : 5000,
    );
    return () => clearInterval(timer);
  }, [token]);
  const bounds = () => bbox.split(",").map(Number);
  return (
    <>
      {demo && (
        <Card title="Do satélite ao dataset, sem espera real">
          <Badge>CATÁLOGO E PROCESSAMENTO SIMULADOS</Badge>
          <Paragraph>
            Busque cenas, escolha uma e simule a coleta. A fila avança por cerca
            de 9 segundos e cria um dataset para explorar no mapa e treinar
            modelos. Os arquivos de demonstração são CSV ou GeoJSON.
          </Paragraph>
        </Card>
      )}
      <Card title="Catálogo Landsat · julho">
        <Paragraph>
          Busque cenas L2SP com temperatura de superfície. O percentual de
          nuvens é da cena inteira; a coleta aplica também QA_PIXEL no recorte.
        </Paragraph>
        <Row>
          <Field
            label="Ano"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />
          <Field
            label="Nuvens máximas (%)"
            value={cloud}
            onChangeText={setCloudCover}
            keyboardType="numeric"
          />
        </Row>
        <Field
          label="Recorte: oeste, sul, leste, norte"
          value={bbox}
          onChangeText={setBbox}
        />
        <Button
          onPress={() =>
            run(async () => {
              const r = await api(
                `/landsat/scenes?year=${encodeURIComponent(year)}&cloud_cover=${encodeURIComponent(cloud)}`,
              );
              setScenes(r.scenes);
              if (r.has_more)
                notify(
                  "Primeira página de cenas. Há mais resultados no catálogo.",
                );
            })
          }
        >
          Buscar cenas
        </Button>
        {scenes.map((s) => (
          <Card key={s.id}>
            <Paragraph>{s.id}</Paragraph>
            <Paragraph muted>
              {s.datetime} · {s.cloud_cover}% nuvens
            </Paragraph>
            <Row>
              <Button
                disabled={!token}
                onPress={() =>
                  run(async () => {
                    await api("/landsat/collect", "POST", {
                      scene_id: s.id,
                      bbox: bounds(),
                    });
                    notify("Coleta adicionada à fila.");
                    await refresh();
                  })
                }
              >
                Coletar LST + índices
              </Button>
              <Button
                secondary
                disabled={!token}
                onPress={() =>
                  run(() =>
                    download(
                      "/landsat/download",
                      demo ? "amostras-demo.geojson" : "lst_celsius.tif",
                      "POST",
                      {
                        scene_id: s.id,
                        bbox: bounds(),
                      },
                    ),
                  )
                }
              >
                {demo ? "Baixar GeoJSON simulado" : "Baixar GeoTIFF"}
              </Button>
            </Row>
          </Card>
        ))}
      </Card>
      <Card title="Importar dados ou explorar o laboratório">
        <Paragraph>
          CSV: ndvi, ndbi, latitude, longitude, lst, year; scene_id opcional.
          Para treino temporal, use ao menos três anos.
        </Paragraph>
        {demo && (
          <Button secondary onPress={() => setCsv(SAMPLE_CSV)}>
            Preencher CSV de exemplo · 36 amostras / 3 anos
          </Button>
        )}
        <Field
          label="Cole um CSV (até 2 MB nesta interface)"
          value={csv}
          onChangeText={setCsv}
          multiline
        />
        <Row>
          <Button
            disabled={!token || !csv}
            onPress={() =>
              run(async () => {
                await api("/datasets/import", "POST", {
                  name: "Dataset importado",
                  csv,
                });
                notify("Dataset importado.");
                setCsv("");
                await refresh();
              })
            }
          >
            Importar CSV
          </Button>
          <Button
            secondary
            disabled={!token}
            onPress={() =>
              run(async () => {
                await api("/datasets/demo", "POST", {
                  confirm_synthetic: true,
                });
                notify("Geração sintética na fila.");
                await refresh();
              })
            }
          >
            Criar dataset sintético
          </Button>
          <Button secondary onPress={() => run(refresh)}>
            Atualizar
          </Button>
        </Row>
        {!token && (
          <Paragraph>
            Entre na conta para importar, coletar e acompanhar tarefas.
          </Paragraph>
        )}
      </Card>
      <Card title="Tarefas de processamento">
        {jobs.length === 0 && (
          <Paragraph muted>Nenhuma tarefa iniciada.</Paragraph>
        )}
        {jobs.map((j) => (
          <Card key={j.id}>
            <Row>
              <Badge>{j.kind}</Badge>
              <Badge>{j.status}</Badge>
              <Paragraph>
                {j.progress}% · tentativa {j.attempts}
              </Paragraph>
            </Row>
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: j.progress }}
              style={{
                height: 8,
                backgroundColor: colors.elevated,
                borderRadius: 4,
              }}
            >
              <View
                style={{
                  width: `${j.progress}%`,
                  height: 8,
                  backgroundColor: colors.lime,
                  borderRadius: 4,
                }}
              />
            </View>
            <Paragraph muted>{j.id}</Paragraph>
            {j.error && <Paragraph>{j.error}</Paragraph>}
            {j.result && <Paragraph>{JSON.stringify(j.result)}</Paragraph>}
          </Card>
        ))}
      </Card>
      {demo && (
        <Row>
          <Button secondary onPress={() => navigate("Explore")}>
            Explorar datasets no mapa ↗
          </Button>
          <Button secondary onPress={() => navigate("Machine Learning")}>
            Treinar com estes dados ↗
          </Button>
        </Row>
      )}
      <Card title="Seus datasets">
        {datasets.length === 0 && (
          <Paragraph muted>
            Os dados aparecerão aqui após uma importação ou coleta concluída.
          </Paragraph>
        )}
        {datasets.map((d) => (
          <Card key={d.id} title={d.name}>
            <Badge>{d.synthetic ? "SINTÉTICO" : "DADOS IMPORTADOS"}</Badge>
            <Paragraph>
              {d.rows} amostras · anos {d.years.join(", ")} · LST média{" "}
              {d.lst.mean.toFixed(2)} °C
            </Paragraph>
            <Paragraph muted>{d.source}</Paragraph>
            <Row>
              <Button
                secondary
                onPress={() =>
                  run(() =>
                    download(`/datasets/${d.id}/download`, "dataset.csv"),
                  )
                }
              >
                Exportar CSV
              </Button>
              {d.has_raster && (
                <Button
                  secondary
                  onPress={() =>
                    run(() =>
                      download(
                        `/datasets/${d.id}/download?kind=tif`,
                        "lst.tif",
                      ),
                    )
                  }
                >
                  Exportar GeoTIFF
                </Button>
              )}
            </Row>
          </Card>
        ))}
      </Card>
    </>
  );
}
