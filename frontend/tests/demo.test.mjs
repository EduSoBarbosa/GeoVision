import test from "node:test";
import { readFile } from "node:fs/promises";
const source = await readFile(
  new URL("../src/demo.js", import.meta.url),
  "utf8",
);
const moduleURL = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
import assert from "node:assert/strict";
const memory = new Map();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k) => memory.get(k) || null,
    setItem: (k, v) => memory.set(k, v),
  },
});
globalThis.fetch = () => {
  throw new Error("A demo não deve acessar a rede");
};
const {
  demoRequest: api,
  resetDemo,
  SAMPLE_CSV,
  generateFeatures,
} = await import(moduleURL);
const post = (body) => ({ method: "POST", body });
const advanceJobs = async () => {
  const now = Date.now;
  Date.now = () => now() + 15000;
  try {
    return await api("/jobs");
  } finally {
    Date.now = now;
  }
};
test("mapa, regiões, anos e hipótese de vegetação alteram dados consistentes", async () => {
  resetDemo();
  const base = await api("/demo/map?year=2023&region=Centro");
  const cooled = await api("/demo/map?year=2023&region=Centro&cooling=25");
  assert.equal(base.total, 100);
  assert.ok(
    cooled.features.every(
      (f, i) => f.properties.lst < base.features[i].properties.lst,
    ),
  );
  assert.equal(generateFeatures(2025).length, 300);
  assert.deepEqual(
    generateFeatures(2025, "Ibirapuera"),
    generateFeatures(2025).filter((f) => f.properties.region === "Ibirapuera"),
  );
  assert.ok(
    base.features.every(
      (f) => f.properties.synthetic && f.properties.year === 2023,
    ),
  );
});
test("CSV importado fica no catálogo, mapa e exportação; erros não criam datasets", async () => {
  resetDemo();
  await assert.rejects(
    api("/datasets/import", post({ csv: "ndvi,ndbi\n0.3,0.1" })),
    /Coluna obrigatória/,
  );
  assert.equal((await api("/datasets")).length, 2);
  const { id } = await api(
    "/datasets/import",
    post({ name: "CSV teste", csv: SAMPLE_CSV }),
  );
  const d = (await api("/datasets")).find((d) => d.id === id);
  assert.deepEqual(d.years, [2023, 2024, 2025]);
  assert.equal(d.rows, 36);
  assert.equal((await api(`/map?dataset_id=${id}`)).features.length, 36);
  const blob = await api(`/datasets/${id}/download`, { raw: true });
  assert.equal((await blob.text()).split("\n").length, 37);
});
test("catálogo filtra nuvens, coleta respeita recorte e tarefa só conclui uma vez", async () => {
  resetDemo();
  const scenes = await api("/landsat/scenes?year=2024&cloud_cover=10");
  assert.equal(scenes.scenes.length, 2);
  await assert.rejects(api("/landsat/scenes?year=oops&cloud_cover=10"), /ano/);
  const body = {
    scene_id: scenes.scenes[0].id,
    bbox: [-46.65, -23.56, -46.64, -23.55],
  };
  await api("/landsat/collect", post(body));
  assert.equal((await api("/datasets")).length, 2);
  assert.equal((await advanceJobs())[0].progress, 100);
  const ds = await api("/datasets");
  assert.equal(ds.length, 3);
  assert.deepEqual(ds[0].years, [2024]);
  const map = await api(`/map?dataset_id=${ds[0].id}`);
  assert.ok(
    map.features.every(
      (f) =>
        f.geometry.coordinates[0] >= -46.65 &&
        f.geometry.coordinates[0] <= -46.64,
    ),
  );
  await advanceJobs();
  assert.equal((await api("/datasets")).length, 3);
  const exported = JSON.parse(
    await (await api("/landsat/download", { ...post(body), raw: true })).text(),
  );
  assert.equal(exported.features.length, map.features.length);
});
test("treinamento valida anos, conclui, ativa modelo e mantém explicação consistente", async () => {
  resetDemo();
  await assert.rejects(
    api(
      "/ml/train",
      post({ dataset_ids: ["parque-demo"], strategy: "temporal" }),
    ),
    /3 anos/,
  );
  await api(
    "/ml/train",
    post({
      dataset_ids: ["sp-demo"],
      strategy: "temporal",
      feature_set: "spectral",
    }),
  );
  await advanceJobs();
  const ms = await api("/ml/models");
  assert.equal(ms.length, 3);
  await api(`/ml/models/${ms[0].id}/activate`, post({}));
  assert.equal((await api("/ml/status")).active_model.id, ms[0].id);
  const body = {
    rows: [{ ndvi: 0.5, ndbi: 0.1, latitude: -23.55, longitude: -46.63 }],
  };
  const prediction = await api("/ml/predict", post(body));
  const explanation = await api("/ml/explain", post(body));
  assert.equal(prediction.lst_celsius[0], 29.5);
  assert.equal(
    explanation.base_value +
      Object.values(explanation.contributions).reduce((a, b) => a + b, 0),
    explanation.prediction,
  );
  await assert.rejects(
    api("/ml/predict", post({ rows: [{ ndvi: 2 }] })),
    /numéricos/,
  );
});
test("área desenhada pode ser editada e excluída com validação de data", async () => {
  resetDemo();
  const area = await api(
    "/areas",
    post({
      name: "Campo",
      coordinates: [
        [-46.6, -23.5],
        [-46.61, -23.5],
        [-46.6, -23.51],
      ],
    }),
  );
  const edited = {
    ...area,
    visit_date: "2026-11-20",
    status: "concluida",
    notes: "Registro fictício",
  };
  await api(`/areas/${area.id}`, { method: "PUT", body: edited });
  assert.equal((await api("/areas"))[0].status, "concluida");
  await assert.rejects(
    api(`/areas/${area.id}`, {
      method: "PUT",
      body: { ...edited, visit_date: "2026-02-31" },
    }),
    /data válida/,
  );
  await api(`/areas/${area.id}`, { method: "DELETE" });
  assert.equal((await api("/areas")).length, 2);
});
test("chaves liberam consulta, contador atualiza, revogação bloqueia e reset restaura", async () => {
  resetDemo();
  await assert.rejects(api("/developer/lst"), /chave fictícia/);
  const key = await api("/keys", post({}));
  assert.ok(key.key.startsWith("gv_demo_"));
  const response = await api("/developer/lst");
  assert.equal(response.synthetic, true);
  assert.equal((await api("/usage")).requests, 129);
  const keys = await api("/keys");
  await api(`/keys/${keys[0].id}`, { method: "DELETE" });
  await assert.rejects(api("/developer/lst"), /chave fictícia/);
  const restored = await import(moduleURL + "#restored");
  assert.equal((await restored.demoRequest("/keys"))[0].revoked, true);
  resetDemo();
  assert.equal((await api("/keys")).length, 0);
  assert.equal((await api("/usage")).requests, 128);
});

test("autenticação fictícia e relatórios funcionam sem serviços externos", async () => {
  resetDemo();
  const account = await api("/auth/me");
  assert.equal(account.admin, true);
  await assert.rejects(
    api("/auth/login", post({ email: "demo@example.com", password: "curta" })),
    /8 caracteres/,
  );
  assert.equal(
    (
      await api(
        "/auth/login",
        post({ email: "demo@example.com", password: "demo12345" }),
      )
    ).access_token,
    "geovision-local-demo",
  );
  await assert.rejects(
    api("/auth/verify", post({ token: "errado" })),
    /DEMO-2026/,
  );
  assert.equal(
    (await api("/auth/verify", post({ token: "DEMO-2026" }))).ok,
    true,
  );
  const report = await (
    await api("/ml/models/xgb-demo/report", { raw: true })
  ).text();
  const [header, first, ...remaining] = report.split("\n");
  assert.equal(header, "synthetic,model_id,observed_lst,predicted_lst,error");
  assert.equal(remaining.length, 59);
  const values = first.split(",");
  assert.ok(
    Math.abs(Number(values[3]) - Number(values[2]) - Number(values[4])) <
      0.0011,
  );
});
