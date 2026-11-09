import React, { useEffect, useState } from "react";
import { Linking, Text } from "react-native";
import { API } from "../api";
import {
  Button,
  Card,
  Paragraph,
  Row,
  Metric,
  colors,
  Badge,
} from "../components/ui";
export default function DeveloperScreen({ api, run, token, notify, demo }) {
  const [plans, setPlans] = useState([]),
    [keys, setKeys] = useState([]),
    [usage, setUsage] = useState(null),
    [secret, setSecret] = useState("");
  const [response, setResponse] = useState(null);
  const [consulting, setConsulting] = useState(false);
  async function refresh() {
    setPlans(await api("/plans"));
    if (token) {
      setKeys(await api("/keys"));
      setUsage(await api("/usage"));
    }
  }
  useEffect(() => {
    run(refresh);
  }, [token]);
  return (
    <>
      <Card title="API para seus projetos">
        <Paragraph>
          JSON/GeoJSON com procedência, paginação e cota mensal por conta.
          Chaves acessam somente datasets do proprietário.
        </Paragraph>
        {demo ? (
          <>
            <Badge>API LOCAL SIMULADA</Badge>
            <Paragraph>
              Chaves fictícias, sem acesso externo. Execute uma consulta para
              ver um exemplo GeoJSON e atualizar o contador de uso.
            </Paragraph>
            <Button
              disabled={consulting || !keys.some((k) => !k.revoked)}
              onPress={() =>
                run(async () => {
                  setConsulting(true);
                  try {
                    setResponse(await api("/developer/lst"));
                    await refresh();
                  } finally {
                    setConsulting(false);
                  }
                })
              }
            >
              Executar GET /developer/lst
            </Button>
            {!keys.some((k) => !k.revoked) && (
              <Paragraph muted>
                Crie uma chave na seção abaixo para liberar a consulta de
                exemplo.
              </Paragraph>
            )}
            {response && (
              <>
                <Text
                  selectable
                  style={{
                    color: colors.petrol,
                    fontFamily: "monospace",
                    fontSize: 12,
                    lineHeight: 20,
                  }}
                >
                  {JSON.stringify(response, null, 2)}
                </Text>
                <Button secondary onPress={() => setResponse(null)}>
                  Limpar resposta
                </Button>
              </>
            )}
          </>
        ) : (
          <Row>
            <Button onPress={() => Linking.openURL(API + "/docs")}>
              Abrir Swagger
            </Button>
            <Button
              secondary
              onPress={() => Linking.openURL(API + "/openapi.json")}
            >
              Contrato OpenAPI
            </Button>
          </Row>
        )}
        <Text
          selectable
          style={{
            fontFamily: "monospace",
            color: colors.petrol,
            fontSize: 12,
            lineHeight: 22,
          }}
        >
          GET /api/v1/developer/lst?dataset_id=ID&limit=1000&amp;offset=0{"\n"}
          X-API-Key: SUA_CHAVE
        </Text>
      </Card>
      {usage && (
        <Metric
          label={`Consumo · ${usage.period}`}
          value={`${usage.requests} / ${usage.limit}`}
          note={usage.plan}
        />
      )}
      <Card title="Chaves de acesso">
        <Button
          disabled={!token}
          onPress={() =>
            run(async () => {
              const r = await api("/keys", "POST");
              setSecret(r.key);
              await refresh();
            })
          }
        >
          Criar chave
        </Button>
        {secret && (
          <>
            <Paragraph>
              Copie agora. A chave não será exibida novamente.
            </Paragraph>
            <Text selectable style={{ color: colors.petrol }}>
              {secret}
            </Text>
            <Button secondary onPress={() => setSecret("")}>
              Ocultar chave
            </Button>
          </>
        )}
        {keys.map((k) => (
          <Row key={k.id}>
            <Paragraph>
              {k.prefix}… · {k.revoked ? "Revogada" : "Ativa"}
            </Paragraph>
            {!k.revoked && (
              <Button
                danger
                onPress={() =>
                  run(async () => {
                    await api("/keys/" + k.id, "DELETE");
                    notify("Chave revogada.");
                    await refresh();
                  })
                }
              >
                Revogar
              </Button>
            )}
          </Row>
        ))}
      </Card>
      <Paragraph>
        Valores ilustrativos para discussão do produto. Sem pagamento ou
        contratação.
      </Paragraph>
      <Row>
        {plans.map((p) => (
          <Card
            key={p.name}
            title={p.name}
            style={{
              flexGrow: 1,
              minWidth: 180,
            }}
          >
            <Paragraph>R$ {p.price_brl}/mês</Paragraph>
            <Paragraph>
              {p.monthly_requests.toLocaleString("pt-BR")} requisições/mês
            </Paragraph>
          </Card>
        ))}
      </Row>
    </>
  );
}
