import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { request } from "./src/api";
import {
  Badge,
  Button,
  Card,
  Paragraph,
  Row,
  colors,
} from "./src/components/ui";
import MapScreen from "./src/screens/MapScreen";
import AccountScreen from "./src/screens/AccountScreen";
import DataScreen from "./src/screens/DataScreen";
import MLScreen from "./src/screens/MLScreen";
import VisitsScreen from "./src/screens/VisitsScreen";
import DeveloperScreen from "./src/screens/DeveloperScreen";
const NAV = [
  "Explore",
  "Analytics",
  "Dados",
  "Machine Learning",
  "Visitas",
  "Desenvolvedores",
  "Sobre",
  "Conta",
];
const DESCRIPTIONS = {
  Explore: "Conheça a superfície da cidade.",
  Analytics: "Explore padrões, índices e áreas de interesse.",
  Dados: "Da cena de satélite ao dataset rastreável.",
  "Machine Learning": "Planeje, compare e consuma seus modelos.",
  Visitas: "Transforme áreas de interesse em visitas de campo.",
  Desenvolvedores: "Integre dados térmicos ao seu projeto.",
  Sobre: "Ciência urbana acessível e transparente.",
  Conta: "Seu espaço de pesquisa.",
};
export default function App() {
  const [tab, setTab] = useState("Explore"),
    [token, setToken] = useState(""),
    [account, setAccount] = useState(null),
    [message, setMessage] = useState(null),
    [busy, setBusy] = useState(0);
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  const api = useCallback(
    (path, method = "GET", body) =>
      request(path, {
        token,
        method,
        body,
      }),
    [token],
  );
  const notify = useCallback(
    (text) =>
      setMessage({
        text,
        error: false,
      }),
    [],
  );
  const run = useCallback(async (fn) => {
    setBusy((x) => x + 1);
    try {
      return await fn();
    } catch (error) {
      setMessage({
        text: error.message,
        error: true,
      });
    } finally {
      setBusy((x) => x - 1);
    }
  }, []);
  async function login(value) {
    const me = await request("/auth/me", {
      token: value,
    });
    setToken(value);
    setAccount(me);
    notify("Sessão iniciada.");
  }
  async function download(path, name, method = "GET", body) {
    if (Platform.OS !== "web")
      throw new Error(
        "Exportação de arquivos disponível na versão web; no mobile use a API documentada.",
      );
    const blob = await request(path, {
      token,
      method,
      body,
      raw: true,
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const common = {
    api,
    run,
    token,
    account,
    notify,
    download,
  };
  return (
    <View
      style={[
        s.app,
        {
          flexDirection: desktop ? "row" : "column",
        },
      ]}
    >
      <View style={[s.sidebar, !desktop && s.mobileNav]}>
        <View style={s.brand}>
          <Text style={s.brandTitle}>◉ GeoVision</Text>
          <Text style={s.brandSub}>OBSERVATÓRIO DE SUPERFÍCIE</Text>
        </View>
        <ScrollView
          horizontal={!desktop}
          style={{
            flex: desktop ? 1 : undefined,
          }}
          contentContainerStyle={
            !desktop
              ? {
                  gap: 4,
                }
              : {
                  gap: 6,
                  paddingTop: 24,
                }
          }
        >
          {NAV.map((item, index) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{
                selected: tab === item,
              }}
              onPress={() => {
                setTab(item);
                setMessage(null);
              }}
              style={[s.nav, tab === item && s.active]}
            >
              <Text
                style={[
                  s.navText,
                  tab === item && {
                    color: colors.forest,
                  },
                ]}
              >
                {String(index + 1).padStart(2, "0")} {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {desktop && (
          <View
            style={{
              gap: 10,
              paddingTop: 20,
            }}
          >
            <Text style={s.brandSub}>SÃO PAULO · BRASIL</Text>
            <Text style={s.brandSub}>
              Landsat / LST / aprendizado de máquina
            </Text>
            <Text style={s.brandSub}>MVP de pesquisa · 0.2.0</Text>
          </View>
        )}
      </View>
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          padding: desktop ? 36 : 18,
          maxWidth: 1450,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <Row>
          <Badge>GEOVISION / {tab.toUpperCase()}</Badge>
          <Text
            style={{
              color: colors.muted,
              fontSize: 12,
            }}
          >
            {account?.email || "Visitante"}
            {busy > 0 ? " · Processando…" : ""}
          </Text>
        </Row>
        <Text style={s.title}>{tab}</Text>
        <Text style={s.subtitle}>{DESCRIPTIONS[tab]}</Text>
        {message && (
          <View
            accessibilityRole="alert"
            style={[
              s.message,
              {
                backgroundColor: message.error ? "#F9E4DD" : "#E4EFD9",
              },
            ]}
          >
            <Text
              selectable
              style={{
                color: colors.ink,
                flex: 1,
                lineHeight: 22,
              }}
            >
              {message.text}
            </Text>
            <Pressable
              accessibilityLabel="Fechar aviso"
              onPress={() => setMessage(null)}
            >
              <Text>✕</Text>
            </Pressable>
          </View>
        )}
        {(tab === "Explore" || tab === "Analytics") && (
          <MapScreen key={tab} {...common} advanced={tab === "Analytics"} />
        )}
        {tab === "Dados" && <DataScreen {...common} />}
        {tab === "Machine Learning" && <MLScreen {...common} />}
        {tab === "Visitas" && <VisitsScreen {...common} />}
        {tab === "Desenvolvedores" && <DeveloperScreen {...common} />}
        {tab === "Conta" && (
          <AccountScreen
            {...common}
            onLogin={login}
            onLogout={() => {
              setToken("");
              setAccount(null);
              notify("Sessão encerrada.");
            }}
          />
        )}
        {tab === "Sobre" && (
          <>
            <Card title="Uma leitura ambiental de São Paulo">
              <Paragraph>
                O GeoVision reúne observações de satélite e ferramentas de
                análise para estudar a temperatura da superfície na Grande São
                Paulo. O projeto nasceu para aproximar pesquisa, ensino e
                planejamento urbano.
              </Paragraph>
              <Paragraph>
                Explore apresenta conceitos e mapas. Analytics permite
                inspecionar índices e registrar áreas para visitas. O
                laboratório de modelos acompanha o caminho entre os dados e uma
                estimativa de LST.
              </Paragraph>
            </Card>
            <Card title="Compromissos científicos">
              <Paragraph>
                As observações mantêm fonte e data. Dados sintéticos são
                identificados. A análise de vegetação, construções e calor
                descreve associações; explicações de um modelo não comprovam
                causalidade. SUHI exige referência urbana/rural explícita e não
                é sinônimo de qualquer ponto quente.
              </Paragraph>
              <Paragraph>
                Escopo histórico planejado: julho de 2016–2026, sujeito à
                disponibilidade e qualidade das cenas. O produto ainda requer
                validação com dados reais e pesquisa com usuários.
              </Paragraph>
            </Card>
          </>
        )}
        <Text style={s.footer}>
          GeoVision · Dados com contexto. Decisões com evidências.
        </Text>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  app: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.paper,
  },
  sidebar: {
    width: 240,
    padding: 22,
    backgroundColor: colors.forest,
  },
  mobileNav: {
    width: "100%",
    padding: 12,
    maxHeight: 145,
  },
  brand: {
    gap: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
  },
  brandSub: {
    fontSize: 10,
    letterSpacing: 1,
    color: "#B9CFC1",
    lineHeight: 17,
  },
  nav: {
    padding: 13,
    borderRadius: 9,
    minHeight: 44,
  },
  active: {
    backgroundColor: colors.lime,
  },
  navText: {
    color: "#DCE8DD",
    fontSize: 13,
    fontWeight: "500",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 18,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 7,
    marginBottom: 26,
  },
  message: {
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    gap: 15,
    marginBottom: 18,
  },
  footer: {
    fontSize: 12,
    color: colors.muted,
    paddingVertical: 30,
  },
});
