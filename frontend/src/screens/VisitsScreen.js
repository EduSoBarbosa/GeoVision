import React, { useEffect, useState } from "react";
import { Button, Card, Field, Paragraph, Row, Badge } from "../components/ui";
export default function VisitsScreen({ api, run, token, notify }) {
  const [areas, setAreas] = useState([]),
    [editing, setEditing] = useState(null),
    [confirm, setConfirmation] = useState(null);
  async function refresh() {
    if (token) setAreas(await api("/areas"));
  }
  useEffect(() => {
    run(refresh);
  }, [token]);
  return (
    <>
      <Card title="Agenda de campo">
        <Paragraph>
          Desenhe uma área no mapa para planejar a visita. Aqui você pode
          registrar data, notas e andamento.
        </Paragraph>
        <Button secondary onPress={() => run(refresh)}>
          Atualizar visitas
        </Button>
        {!token && (
          <Paragraph>Entre na conta para acessar suas áreas.</Paragraph>
        )}
      </Card>
      {areas.map((a) => (
        <Card key={a.id} title={a.name}>
          <Row>
            <Badge>{a.status}</Badge>
            <Paragraph>{a.visit_date || "Sem data definida"}</Paragraph>
          </Row>
          <Paragraph>{a.notes || "Sem observações"}</Paragraph>
          <Paragraph muted>{a.coordinates.length} vértices</Paragraph>
          <Row>
            <Button
              secondary
              onPress={() =>
                setEditing({
                  ...a,
                })
              }
            >
              Editar
            </Button>
            <Button danger onPress={() => setConfirmation(a.id)}>
              Excluir
            </Button>
          </Row>
          {confirm === a.id && (
            <Row>
              <Paragraph>Excluir esta visita?</Paragraph>
              <Button
                danger
                onPress={() =>
                  run(async () => {
                    await api("/areas/" + a.id, "DELETE");
                    setConfirmation(null);
                    await refresh();
                  })
                }
              >
                Confirmar exclusão
              </Button>
              <Button secondary onPress={() => setConfirmation(null)}>
                Cancelar
              </Button>
            </Row>
          )}
        </Card>
      ))}
      {editing && (
        <Card title="Editar visita">
          <Field
            label="Nome"
            value={editing.name}
            onChangeText={(name) =>
              setEditing({
                ...editing,
                name,
              })
            }
          />
          <Field
            label="Data (AAAA-MM-DD)"
            value={editing.visit_date || ""}
            onChangeText={(visit_date) =>
              setEditing({
                ...editing,
                visit_date,
              })
            }
          />
          <Field
            label="Notas de campo"
            value={editing.notes}
            onChangeText={(notes) =>
              setEditing({
                ...editing,
                notes,
              })
            }
            multiline
          />
          <Row>
            {["planejada", "em_andamento", "concluida"].map((status) => (
              <Button
                key={status}
                secondary={editing.status !== status}
                onPress={() =>
                  setEditing({
                    ...editing,
                    status,
                  })
                }
              >
                {status}
              </Button>
            ))}
          </Row>
          <Row>
            <Button
              onPress={() =>
                run(async () => {
                  const { name, coordinates, notes, status, visit_date } =
                    editing;
                  await api("/areas/" + editing.id, "PUT", {
                    name,
                    coordinates,
                    notes,
                    status,
                    visit_date: visit_date || null,
                  });
                  setEditing(null);
                  notify("Visita atualizada.");
                  await refresh();
                })
              }
            >
              Salvar alterações
            </Button>
            <Button secondary onPress={() => setEditing(null)}>
              Cancelar
            </Button>
          </Row>
        </Card>
      )}
    </>
  );
}
