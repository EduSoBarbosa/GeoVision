import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
const API = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
export default function App() {
  const [tab, T] = useState("Explore"),
    [email, E] = useState(""),
    [password, P] = useState(""),
    [token, S] = useState(""),
    [verification, V] = useState(""),
    [message, M] = useState(""),
    [data, D] = useState(null),
    [name, N] = useState("Visita de campo"),
    [coords, C] = useState("[[-46.64,-23.55],[-46.63,-23.55],[-46.63,-23.54]]");
  async function call(path, method = "GET", body) {
    try {
      let r = await fetch(API + "/api/v1/" + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      let j = await r.json();
      if (!r.ok)
        throw Error(
          typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail),
        );
      return j;
    } catch (e) {
      M(e.message);
      return null;
    }
  }
  useEffect(() => {
    D(null);
    let path = {
      Explore: "map",
      Analytics: "map",
      Áreas: "areas",
      Desenvolvedores: "plans",
      Sobre: "about",
    }[tab];
    if (path) call(path).then(D);
  }, [tab, token]);
  const button = (label, fn) => (
    <Pressable accessibilityRole="button" style={s.button} onPress={fn}>
      <Text style={{ color: "white", fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
  const input = (label, value, set, secure = false) => (
    <View>
      <Text style={s.text}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={s.input}
        value={value}
        onChangeText={set}
        secureTextEntry={secure}
        autoCapitalize="none"
      />
    </View>
  );
  return (
    <ScrollView style={s.page}>
      <View style={s.header}>
        <Text style={s.logo}>GeoVision / São Paulo</Text>
        <Text style={{ color: "#c4e6bc" }}>
          A cidade pela perspectiva da superfície.
        </Text>
      </View>
      <View style={s.nav}>
        {[
          "Explore",
          "Analytics",
          "Áreas",
          "Desenvolvedores",
          "Sobre",
          "Conta",
        ].map((x) => (
          <Pressable
            key={x}
            onPress={() => {
              M("");
              T(x);
            }}
            style={[s.chip, tab === x && { backgroundColor: "#c4e6bc" }]}
          >
            <Text>{x}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.content}>
        <Text style={s.title}>{tab}</Text>
        {!!message && (
          <Text accessibilityRole="alert" style={s.notice}>
            {message}
          </Text>
        )}
        {["Explore", "Analytics"].includes(tab) && (
          <>
            <Text style={s.text}>Temperatura da superfície • LST</Text>
            <View style={s.panel}>
              <Text style={s.title}>São Paulo</Text>
              <Text style={s.text}>
                {data?.empty
                  ? "Aguardando cenas geográficas."
                  : "Carregando dados…"}
              </Text>
              {button("Abrir mapa de referência", () =>
                Linking.openURL(
                  "https://www.openstreetmap.org/#map=11/-23.5505/-46.6333",
                ),
              )}
            </View>
            <Text style={s.text}>
              A LST representa o aquecimento de telhados, solo e vegetação. Ela
              é diferente da temperatura do ar medida em uma estação
              meteorológica.
            </Text>
            {tab === "Analytics" && (
              <Text style={s.text}>
                Análise planejada: Landsat, NDVI, NDBI, impermeabilização e
                altura de edificações. Comparações exigem cenas com condições
                equivalentes. A resolução da grade não aumenta a resolução
                térmica original. Previsão e SHAP aguardam dados e treinamento.
              </Text>
            )}
            <Text style={s.notice}>
              Visualização cartográfica integrada ainda pendente nesta versão
              inicial.
            </Text>
          </>
        )}
        {tab === "Conta" && (
          <>
            {input("Email", email, E)}
            {input("Senha (mínimo 8 caracteres)", password, P, true)}
            {button("Cadastrar", async () => {
              let j = await call("auth/register", "POST", { email, password });
              if (j) {
                V(j.development_verification_token);
                M(j.message);
              }
            })}
            {input("Token de verificação local", verification, V)}
            {button("Verificar cadastro", async () => {
              let j = await call("auth/verify", "POST", {
                token: verification,
              });
              if (j) M("Cadastro verificado");
            })}
            {button("Entrar", async () => {
              let j = await call("auth/login", "POST", { email, password });
              if (j) {
                S(j.access_token);
                M("Sessão iniciada");
              }
            })}
            {button("Sair", () => {
              S("");
              M("Sessão encerrada");
            })}
          </>
        )}
        {tab === "Áreas" && (
          <>
            {input("Nome da área", name, N)}
            {input("Vértices [longitude, latitude]", coords, C)}
            {button("Salvar área", async () => {
              try {
                let j = await call("areas", "POST", {
                  name,
                  coordinates: JSON.parse(coords),
                });
                if (j) {
                  M("Área salva");
                  D(await call("areas"));
                }
              } catch {
                M("Coordenadas devem ser JSON válido");
              }
            })}
            {Array.isArray(data) &&
              data.map((a) => (
                <View key={a.id} style={s.panel}>
                  <Text>
                    {a.name} • {a.status}
                  </Text>
                  {button("Excluir", async () => {
                    await call("areas/" + a.id, "DELETE");
                    D(await call("areas"));
                  })}
                </View>
              ))}
          </>
        )}
        {tab === "Desenvolvedores" && (
          <>
            <Text style={s.text}>
              Planos propostos para avaliação acadêmica. Nenhuma cobrança é
              realizada.
            </Text>
            {Array.isArray(data) &&
              data.map((p) => (
                <View key={p.name} style={s.panel}>
                  <Text style={s.title}>
                    {p.name} • R$ {p.price_brl}/mês
                  </Text>
                  <Text>{p.monthly_requests} consultas mensais</Text>
                </View>
              ))}
            {button("Gerar chave de API", async () => {
              let j = await call("keys", "POST");
              if (j) M("Guarde sua chave: " + j.key);
            })}
            {button("Documentação interativa", () =>
              Linking.openURL(API + "/docs"),
            )}
          </>
        )}
        {tab === "Sobre" && (
          <>
            <Text style={s.text}>{data?.text}</Text>
            <Text style={s.text}>{data?.methodology}</Text>
          </>
        )}
        <Text style={s.footer}>GeoVision • Pesquisa urbana • MVP 0.1</Text>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { backgroundColor: "#f1f5f3" },
  header: { backgroundColor: "#123d32", padding: 30, gap: 10 },
  logo: { color: "white", fontSize: 27, fontWeight: "700" },
  nav: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 18 },
  chip: { padding: 14, backgroundColor: "white", borderRadius: 22 },
  content: { padding: 24, maxWidth: 1100, width: "100%", alignSelf: "center" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#164653",
    marginBottom: 16,
  },
  text: { color: "#334a46", fontSize: 16, lineHeight: 25, marginVertical: 10 },
  button: {
    backgroundColor: "#164653",
    padding: 15,
    borderRadius: 9,
    marginVertical: 8,
    alignSelf: "flex-start",
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#9cafaa",
    padding: 14,
    borderRadius: 8,
  },
  panel: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    marginVertical: 12,
  },
  notice: { backgroundColor: "#e5efd8", padding: 16, lineHeight: 22 },
  footer: { marginVertical: 35, color: "#5b7069" },
});
