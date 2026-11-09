// Local demonstration store. No request in this module is sent to a server.
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE !== "false";
export const DEMO_TOKEN = "geovision-local-demo";
export const DEMO_ACCOUNT = {
  email: "pesquisador@demo.geovision",
  plan: "Pesquisa · demo",
  admin: true,
};
const STORAGE_KEY = "geovision-demo-v1";
export const REGIONS = [
  { name: "Centro", latitude: -23.55, longitude: -46.635, vegetation: 0.18 },
  {
    name: "Ibirapuera",
    latitude: -23.587,
    longitude: -46.658,
    vegetation: 0.8,
  },
  {
    name: "Zona Leste",
    latitude: -23.545,
    longitude: -46.49,
    vegetation: 0.32,
  },
];
const round = (n) => Math.round(n * 1000) / 1000;
let sequence = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${++sequence}`;
export function generateFeatures(year = 2025, region = "Todas", cooling = 0) {
  return REGIONS.filter((r) => region === "Todas" || r.name === region).flatMap(
    (r, ri) =>
      Array.from({ length: 100 }, (_, i) => {
        const latitude = round(
          r.latitude + (Math.floor(i / 10) - 4.5) * 0.0018,
        );
        const longitude = round(r.longitude + ((i % 10) - 4.5) * 0.0018);
        const wave = Math.sin(i * 2.31 + REGIONS.indexOf(r)) * 0.12;
        const ndvi = round(
          Math.max(0, Math.min(1, r.vegetation + wave + cooling / 100)),
        );
        const ndbi = round(Math.max(-1, 0.65 - ndvi + Math.cos(i) * 0.1));
        const lst = round(
          34 -
            10 * ndvi +
            5 * ndbi +
            (year - 2023) * 0.35 +
            Math.sin(i * 1.7) * 1.2,
        );
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [longitude, latitude] },
          properties: {
            ndvi,
            ndbi,
            lst,
            year,
            region: r.name,
            building_height: round(5 + (1 - ndvi) * 35),
            built_fraction: round(1 - ndvi),
            synthetic: true,
          },
        };
      }),
  );
}
function dataset(name, features = generateFeatures(), id = uid("dataset")) {
  const values = features.map((f) => f.properties.lst);
  return {
    id,
    name,
    synthetic: true,
    rows: features.length,
    years: [...new Set(features.map((f) => f.properties.year))].sort(),
    lst: { mean: values.reduce((a, b) => a + b, 0) / values.length },
    source: "Simulação local · não representa observações de satélite",
    has_raster: false,
    features,
  };
}
function model(
  id,
  winner = "XGBoost",
  strategy = "temporal",
  features = "spectral",
  count = 900,
) {
  return {
    id,
    winner,
    strategy,
    synthetic: true,
    features: [
      "ndvi",
      "ndbi",
      "latitude",
      "longitude",
      ...(features === "urban" ? ["building_height", "built_fraction"] : []),
    ],
    test:
      winner === "XGBoost"
        ? { mae: 0.84, rmse: 1.12, r2: 0.93 }
        : { mae: 1.02, rmse: 1.3, r2: 0.9 },
    validation: {
      Baseline: { mae: 3.28 },
      "Random Forest": { mae: winner === "Random Forest" ? 0.76 : 1.06 },
      XGBoost: { mae: 0.81 },
    },
    split_sizes: {
      train: Math.floor(count * 0.6),
      validation: Math.floor(count * 0.2),
      test: count - Math.floor(count * 0.6) - Math.floor(count * 0.2),
    },
  };
}
function initialState() {
  return {
    datasets: [
      dataset(
        "São Paulo · 2023–2025",
        [2023, 2024, 2025].flatMap((y) => generateFeatures(y)),
        "sp-demo",
      ),
      dataset(
        "Parque Ibirapuera · 2025",
        generateFeatures(2025, "Ibirapuera"),
        "parque-demo",
      ),
    ],
    models: [model("xgb-demo"), model("rf-demo", "Random Forest", "spatial")],
    active: "xgb-demo",
    areas: [
      {
        id: "visita-centro",
        name: "Centro · corredor de calor",
        coordinates: [
          [-46.64, -23.55],
          [-46.63, -23.55],
          [-46.63, -23.56],
          [-46.64, -23.56],
        ],
        status: "planejada",
        visit_date: "2026-11-16",
        notes:
          "Comparar trechos com asfalto exposto e arborização. Visita fictícia.",
      },
      {
        id: "visita-parque",
        name: "Ibirapuera · percurso sombreado",
        coordinates: [
          [-46.66, -23.58],
          [-46.65, -23.58],
          [-46.65, -23.59],
        ],
        status: "concluida",
        visit_date: "2026-11-05",
        notes: "Exemplo preenchido para demonstrar o registro de campo.",
      },
    ],
    jobs: [],
    keys: [],
    requests: 128,
  };
}
function restore() {
  try {
    const parsed = JSON.parse(
      globalThis.localStorage?.getItem(STORAGE_KEY) || "null",
    );
    if (
      parsed?.datasets?.length &&
      Array.isArray(parsed.models) &&
      Array.isArray(parsed.jobs)
    )
      return parsed;
  } catch {}
  return initialState();
}
let state = restore();
function persist() {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
export function resetDemo() {
  state = initialState();
  persist();
}
const clone = (value) => JSON.parse(JSON.stringify(value));
function requireValue(condition, text) {
  if (!condition) throw new Error(text);
}
function enqueue(kind, payload) {
  const job = {
    id: uid("tarefa"),
    kind,
    status: "na fila",
    progress: 0,
    attempts: 1,
    started: Date.now(),
    payload,
  };
  state.jobs.unshift(job);
  return job;
}
function updateJobs() {
  for (const j of state.jobs) {
    if (j.status === "concluida") continue;
    j.progress = Math.min(100, Math.floor((Date.now() - j.started) / 90));
    j.status =
      j.progress === 100
        ? "concluida"
        : j.progress < 12
          ? "na fila"
          : "processando";
    if (j.progress === 100) {
      if (j.kind === "treinamento") {
        const m = model(
          uid("modelo"),
          j.payload.feature_set === "urban" ? "Random Forest" : "XGBoost",
          j.payload.strategy,
          j.payload.feature_set,
          j.payload.count,
        );
        state.models.unshift(m);
        j.result = { message: "Comparação simulada concluída", model_id: m.id };
      } else {
        const d = dataset(
          j.kind === "coleta"
            ? `Coleta demo · ${j.payload.scene_id}`
            : "Novo dataset sintético",
          j.kind === "coleta"
            ? j.payload.features
            : [2023, 2024, 2025].flatMap((y) => generateFeatures(y)),
        );
        state.datasets.unshift(d);
        j.result = {
          message: "Dataset disponível no mapa e no laboratório",
          dataset_id: d.id,
        };
      }
    }
  }
}
export function csvFor(features) {
  return (
    "ndvi,ndbi,latitude,longitude,lst,year\n" +
    features
      .map((f) =>
        [
          f.properties.ndvi,
          f.properties.ndbi,
          f.geometry.coordinates[1],
          f.geometry.coordinates[0],
          f.properties.lst,
          f.properties.year,
        ].join(","),
      )
      .join("\n")
  );
}
export const SAMPLE_CSV = csvFor(
  [2023, 2024, 2025].flatMap((y) => generateFeatures(y, "Centro").slice(0, 12)),
);
function parseCsv(csv) {
  requireValue(
    typeof csv === "string" && csv.length < 2 * 1024 * 1024,
    "Cole um CSV de até 2 MB.",
  );
  const lines = csv.trim().split(/\r?\n/),
    header = lines
      .shift()
      .split(",")
      .map((v) => v.trim());
  for (const key of ["ndvi", "ndbi", "latitude", "longitude", "lst", "year"])
    requireValue(header.includes(key), `Coluna obrigatória: ${key}.`);
  requireValue(lines.length > 0, "O CSV precisa conter observações.");
  return lines.map((line, i) => {
    const values = line.split(","),
      row = Object.fromEntries(header.map((k, j) => [k, Number(values[j])]));
    requireValue(
      ["ndvi", "ndbi", "latitude", "longitude", "lst", "year"].every(
        (k) => values[header.indexOf(k)]?.trim() && Number.isFinite(row[k]),
      ),
      `Linha ${i + 2}: preencha todos os campos numéricos.`,
    );
    requireValue(
      Math.abs(row.latitude) <= 90 &&
        Math.abs(row.longitude) <= 180 &&
        Math.abs(row.ndvi) <= 1 &&
        Math.abs(row.ndbi) <= 1 &&
        Number.isInteger(row.year),
      `Linha ${i + 2}: coordenadas, índices ou ano inválidos.`,
    );
    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [row.longitude, row.latitude] },
      properties: { ...row, synthetic: true },
    };
  });
}
function contributions(row, m) {
  requireValue(
    row &&
      ["ndvi", "ndbi", "latitude", "longitude"].every(
        (k) => typeof row[k] === "number" && Number.isFinite(row[k]),
      ),
    "Informe NDVI, NDBI, latitude e longitude numéricos.",
  );
  requireValue(
    Math.abs(row.ndvi) <= 1 &&
      Math.abs(row.ndbi) <= 1 &&
      Math.abs(row.latitude) <= 90 &&
      Math.abs(row.longitude) <= 180,
    "Índices ou coordenadas fora do intervalo permitido.",
  );
  const c = {
    ndvi: (m?.winner === "Random Forest" ? -9 : -10) * row.ndvi,
    ndbi: (m?.winner === "Random Forest" ? 4.5 : 5) * row.ndbi,
  };
  if (m?.features.includes("building_height")) {
    requireValue(
      Number.isFinite(row.building_height) &&
        Number.isFinite(row.built_fraction),
      "O modelo urbano requer altura e fração construída.",
    );
    c.building_height = row.building_height * 0.01;
    c.built_fraction = row.built_fraction * 0.2;
  }
  return c;
}
export async function demoRequest(
  path,
  { method = "GET", body = {}, raw = false } = {},
) {
  await new Promise((resolve) => setTimeout(resolve, 180));
  updateJobs();
  const url = new URL(path, "https://demo.local"),
    route = url.pathname,
    q = url.searchParams;
  let result;
  const findDataset = (id) => {
    const d = state.datasets.find((d) => d.id === id);
    requireValue(d, "Dataset não encontrado.");
    return d;
  };
  const findModel = (id) => {
    const m = state.models.find((m) => m.id === (id || state.active));
    requireValue(m, "Modelo não encontrado.");
    return m;
  };
  if (route === "/auth/me") result = DEMO_ACCOUNT;
  else if (route === "/auth/login") {
    requireValue(
      body.email && body.password?.length >= 8,
      "Informe email e senha com ao menos 8 caracteres fictícios.",
    );
    result = { access_token: DEMO_TOKEN };
  } else if (["/auth/register", "/auth/resend"].includes(route))
    result = {
      message: "Email simulado. Use o código DEMO-2026 para verificar.",
      development_verification_token: "DEMO-2026",
    };
  else if (route === "/auth/verify") {
    requireValue(body.token === "DEMO-2026", "Na demo, o código é DEMO-2026.");
    result = { ok: true };
  } else if (route === "/demo/map" || route === "/map") {
    const features =
      route === "/map"
        ? findDataset(q.get("dataset_id")).features
        : generateFeatures(
            Number(q.get("year") || 2025),
            q.get("region") || "Todas",
            Number(q.get("cooling") || 0),
          );
    result = { features, total: features.length, synthetic: true };
  } else if (route === "/datasets")
    result = state.datasets.map(({ features, ...d }) => d);
  else if (route === "/datasets/import") {
    const d = dataset(body.name || "CSV de demonstração", parseCsv(body.csv));
    state.datasets.unshift(d);
    result = { id: d.id };
  } else if (route === "/datasets/demo")
    result = enqueue("geração sintética", {});
  else if (/^\/datasets\/[^/]+\/download$/.test(route))
    result = csvFor(findDataset(route.split("/")[2]).features);
  else if (route === "/jobs")
    result = state.jobs.map(({ payload, started, ...j }) => j);
  else if (route === "/landsat/scenes") {
    const year = Number(q.get("year")),
      cloud = Number(q.get("cloud_cover"));
    requireValue(
      Number.isInteger(year) &&
        year >= 2016 &&
        year <= 2026 &&
        Number.isFinite(cloud) &&
        cloud >= 0 &&
        cloud <= 100,
      "Use ano de 2016 a 2026 e nuvens de 0 a 100%.",
    );
    result = {
      scenes: [4, 11, 18, 25]
        .map((day, i) => ({
          id: `DEMO_LC09_SP_${year}07${day}`,
          datetime: `${year}-07-${String(day).padStart(2, "0")}T13:10:00Z`,
          cloud_cover: [2, 8, 15, 32][i],
        }))
        .filter((s) => s.cloud_cover <= cloud),
      has_more: false,
    };
  } else if (route === "/landsat/collect" || route === "/landsat/download") {
    requireValue(
      Array.isArray(body.bbox) &&
        body.bbox.length === 4 &&
        body.bbox.every(Number.isFinite) &&
        body.bbox[0] < body.bbox[2] &&
        body.bbox[1] < body.bbox[3] &&
        Math.abs(body.bbox[0]) <= 180 &&
        Math.abs(body.bbox[2]) <= 180 &&
        Math.abs(body.bbox[1]) <= 90 &&
        Math.abs(body.bbox[3]) <= 90,
      "Recorte inválido. Informe oeste, sul, leste e norte.",
    );
    const sceneYear = Number(body.scene_id?.match(/_(\d{4})07/)?.[1] || 2025);
    const features = generateFeatures(sceneYear).filter(
      (f) =>
        f.geometry.coordinates[0] >= body.bbox[0] &&
        f.geometry.coordinates[0] <= body.bbox[2] &&
        f.geometry.coordinates[1] >= body.bbox[1] &&
        f.geometry.coordinates[1] <= body.bbox[3],
    );
    requireValue(
      features.length > 0,
      "Este recorte não contém amostras da demo. Use -46.65,-23.56,-46.64,-23.55 para explorar o centro.",
    );
    result = route.endsWith("collect")
      ? enqueue("coleta", { ...body, features })
      : JSON.stringify(
          { type: "FeatureCollection", synthetic: true, features },
          null,
          2,
        );
  } else if (route === "/ml/status") result = { active_model: findModel() };
  else if (route === "/ml/models") result = state.models;
  else if (route === "/ml/train") {
    requireValue(body.dataset_ids?.length, "Selecione um dataset.");
    const ds = body.dataset_ids.map(findDataset),
      years = new Set(ds.flatMap((d) => d.years));
    requireValue(
      body.strategy !== "spatial" ||
        ds.reduce((sum, d) => sum + d.rows, 0) >= 100,
      "Selecione ao menos 100 amostras para a avaliação espacial da demo.",
    );
    requireValue(
      body.strategy !== "temporal" || years.size >= 3,
      "A avaliação temporal precisa de ao menos 3 anos. Selecione São Paulo · 2023–2025.",
    );
    requireValue(
      body.feature_set !== "urban" ||
        ds.every((d) =>
          d.features.every(
            (f) =>
              Number.isFinite(f.properties.building_height) &&
              Number.isFinite(f.properties.built_fraction),
          ),
        ),
      "Esses datasets não possuem altura e fração construída.",
    );
    result = enqueue("treinamento", {
      ...body,
      count: ds.reduce((sum, d) => sum + d.rows, 0),
    });
  } else if (/^\/ml\/models\/[^/]+\/activate$/.test(route)) {
    state.active = findModel(route.split("/")[3]).id;
    result = { ok: true };
  } else if (/^\/ml\/models\/[^/]+\/report$/.test(route)) {
    const m = findModel(route.split("/")[3]);
    result =
      "synthetic,model_id,observed_lst,predicted_lst,error\n" +
      generateFeatures(2025)
        .slice(0, 60)
        .map((f) => {
          const row = {
            ...f.properties,
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
          };
          const predicted = round(
            34 +
              Object.values(contributions(row, m)).reduce(
                (sum, v) => sum + v,
                0,
              ),
          );
          return [
            true,
            m.id,
            row.lst,
            predicted,
            round(predicted - row.lst),
          ].join(",");
        })
        .join("\n");
  } else if (["/ml/predict", "/ml/explain"].includes(route)) {
    const m = findModel(body.model_id);
    requireValue(
      Array.isArray(body.rows) && body.rows.length > 0,
      "Envie uma lista de observações.",
    );
    const cs = body.rows.map((r) => contributions(r, m)),
      predictions = cs.map((c) =>
        round(34 + Object.values(c).reduce((a, b) => a + b, 0)),
      );
    result = route.endsWith("predict")
      ? {
          lst_celsius: predictions,
          synthetic: true,
          warnings: [
            "Simulação por fórmula ilustrativa; nenhum modelo é treinado ou executado de verdade.",
          ],
        }
      : {
          base_value: 34,
          prediction: predictions[0],
          contributions: cs[0],
          synthetic: true,
        };
  } else if (route === "/areas" && method === "GET") result = state.areas;
  else if (route === "/areas" || route.startsWith("/areas/")) {
    const id = route.split("/")[2];
    if (method === "DELETE") {
      requireValue(
        state.areas.some((a) => a.id === id),
        "Visita não encontrada.",
      );
      state.areas = state.areas.filter((a) => a.id !== id);
      result = { ok: true };
    } else {
      requireValue(
        body.name?.trim() && body.coordinates?.length >= 3,
        "Dê um nome à área e marque ao menos 3 vértices.",
      );
      requireValue(
        !body.visit_date ||
          (/^\d{4}-\d{2}-\d{2}$/.test(body.visit_date) &&
            !isNaN(Date.parse(body.visit_date)) &&
            new Date(body.visit_date).toISOString().slice(0, 10) ===
              body.visit_date),
        "Use uma data válida no formato AAAA-MM-DD.",
      );
      requireValue(
        !body.status ||
          ["planejada", "em_andamento", "concluida"].includes(body.status),
        "Status inválido.",
      );
      const area = {
        ...body,
        id: id || uid("visita"),
        status: body.status || "planejada",
      };
      if (id) {
        requireValue(
          state.areas.some((a) => a.id === id),
          "Visita não encontrada.",
        );
        state.areas = state.areas.map((a) => (a.id === id ? area : a));
      } else state.areas.unshift(area);
      result = area;
    }
  } else if (route === "/plans")
    result = [
      { name: "Explorador", price_brl: 0, monthly_requests: 1000 },
      { name: "Pesquisa", price_brl: 99, monthly_requests: 25000 },
      { name: "Laboratório", price_brl: 299, monthly_requests: 100000 },
    ];
  else if (route === "/usage")
    result = {
      period: "sessão de demonstração",
      requests: state.requests,
      limit: 25000,
      plan: "Pesquisa · simulado",
    };
  else if (route === "/keys" && method === "GET") result = state.keys;
  else if (route === "/keys" && method === "POST") {
    const id = uid("key");
    state.keys.unshift({
      id,
      prefix: "gv_demo_" + id.slice(-6),
      revoked: false,
    });
    result = { key: "gv_demo_local_" + id };
  } else if (route.startsWith("/keys/") && method === "DELETE") {
    const key = state.keys.find((k) => k.id === route.split("/")[2]);
    requireValue(key, "Chave não encontrada.");
    key.revoked = true;
    result = { ok: true };
  } else if (route === "/developer/lst") {
    requireValue(
      state.keys.some((k) => !k.revoked),
      "Crie uma chave fictícia ativa para consultar a API da demo.",
    );
    state.requests++;
    result = {
      synthetic: true,
      total: 300,
      features: generateFeatures().slice(0, 3),
    };
  } else throw new Error(`Operação indisponível na demo: ${method} ${route}`);
  persist();
  if (raw)
    return new Blob(
      [typeof result === "string" ? result : JSON.stringify(result)],
      {
        type: route.includes("landsat")
          ? "application/geo+json"
          : "text/csv;charset=utf-8",
      },
    );
  return clone(result);
}
