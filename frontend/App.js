import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { DEMO_MODE, DEMO_ACCOUNT, DEMO_TOKEN, resetDemo } from "./src/demo";
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
    [token, setToken] = useState(DEMO_MODE ? DEMO_TOKEN : ""),
    [account, setAccount] = useState(DEMO_MODE ? DEMO_ACCOUNT : null),
    [message, setMessage] = useState(null),
    [busy, setBusy] = useState(0);
  const { width } = useWindowDimensions();
  const desktop = width >= 1180;
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef(null);
  const contentY = useRef(0);
  const [demoRevision, setDemoRevision] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [tour, setTour] = useState(0);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500&family=Manrope:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    const previousTitle = document.title;
    document.title = "GeoVision · Observatório de superfície";
    return () => {
      link.remove();
      document.title = previousTitle;
    };
  }, []);
  function navigate(next) {
    const step = [
      "Explore",
      "Dados",
      "Machine Learning",
      "Analytics",
      "Visitas",
      "Desenvolvedores",
    ].indexOf(next);
    if (DEMO_MODE && step >= 0) setTour(step);
    setTab(next);
    setMenuOpen(false);
    setMessage(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }
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
    navigate,
    demo: DEMO_MODE,
  };
  return (
    <View style={s.app}>
      <ScrollView ref={scrollRef} contentContainerStyle={s.page}>
        <View style={[s.header, !desktop && { borderRadius: 24 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="GeoVision, início"
            onPress={() => navigate("Explore")}
            style={s.brand}
          >
            <Text style={s.brandMark}>◉</Text>
            <Text style={s.brandTitle}>
              GeoVision<Text style={{ color: colors.lime }}>↗</Text>
            </Text>
          </Pressable>
          {desktop ? (
            <View style={s.navigation}>
              {NAV.filter((item) => item !== "Conta").map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: tab === item }}
                  onPress={() => navigate(item)}
                  style={({ hovered }) => [
                    s.nav,
                    hovered && s.navHover,
                    tab === item && s.active,
                  ]}
                >
                  <Text
                    style={[s.navText, tab === item && { color: colors.lime }]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={menuOpen ? "Fechar menu" : "Abrir menu"}
              accessibilityState={{ expanded: menuOpen }}
              onPress={() => setMenuOpen(!menuOpen)}
              style={s.menuButton}
            >
              <Text style={s.navText}>{menuOpen ? "Fechar ×" : "Menu ☰"}</Text>
            </Pressable>
          )}
          {desktop && (
            <Button secondary onPress={() => navigate("Conta")}>
              {account ? "Minha conta ↗" : "Entrar ↗"}
            </Button>
          )}
        </View>
        {DEMO_MODE && (
          <Card style={{ marginTop: 16, marginBottom: 0 }}>
            <Row>
              <Badge>DEMO INTERATIVA · DADOS SIMULADOS</Badge>
              <Paragraph muted>
                Explore livremente. Suas alterações ficam neste navegador.
              </Paragraph>
            </Row>
            <Row>
              {[
                "Explore",
                "Dados",
                "Machine Learning",
                "Analytics",
                "Visitas",
                "Desenvolvedores",
              ].map((item, i) => (
                <Button
                  key={item}
                  secondary={tour !== i}
                  onPress={() => {
                    setTour(i);
                    navigate(item);
                  }}
                >
                  {i + 1}. {item}
                </Button>
              ))}
            </Row>
            <Paragraph>
              {
                [
                  "Clique nos pontos, compare regiões e anos. Use Demarcar visita para desenhar uma área.",
                  "Busque uma cena, simule a coleta e acompanhe a fila. Ou carregue e importe o CSV de exemplo.",
                  "Selecione São Paulo · 2023–2025, treine e acompanhe o progresso. Teste a previsão e altere os índices.",
                  "Alterne LST, NDVI e NDBI. Preveja os pontos para visualizar também a camada de erro.",
                  "Edite as visitas de exemplo ou a área que você desenhou. Defina data, notas e andamento.",
                  "Crie uma chave fictícia e execute uma consulta local para inspecionar o JSON de resposta.",
                ][tour]
              }
            </Paragraph>
            <Row>
              <Button
                onPress={() => {
                  const next = (tour + 1) % 6;
                  setTour(next);
                  navigate(
                    [
                      "Explore",
                      "Dados",
                      "Machine Learning",
                      "Analytics",
                      "Visitas",
                      "Desenvolvedores",
                    ][next],
                  );
                }}
              >
                Próxima etapa →
              </Button>
              <Button secondary onPress={() => setConfirmReset(!confirmReset)}>
                Reiniciar demonstração
              </Button>
            </Row>
            {confirmReset && (
              <Row>
                <Paragraph>
                  Restaurar os exemplos e apagar as alterações locais da demo?
                </Paragraph>
                <Button
                  danger
                  onPress={() => {
                    resetDemo();
                    setDemoRevision((x) => x + 1);
                    setToken(DEMO_TOKEN);
                    setAccount(DEMO_ACCOUNT);
                    setConfirmReset(false);
                    setTour(0);
                    navigate("Explore");
                    notify("Demonstração restaurada.");
                  }}
                >
                  Restaurar exemplos
                </Button>
                <Button secondary onPress={() => setConfirmReset(false)}>
                  Cancelar
                </Button>
              </Row>
            )}
          </Card>
        )}
        {menuOpen && !desktop && (
          <View style={s.mobileMenu}>
            {NAV.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: tab === item }}
                onPress={() => navigate(item)}
                style={[s.nav, tab === item && s.active]}
              >
                <Text
                  style={[s.navText, tab === item && { color: colors.lime }]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <View
          style={[
            s.hero,
            Platform.OS === "web" && {
              backgroundImage:
                "linear-gradient(100deg, #080F0D 0%, #146B49 52%, #080F0D 100%)",
            },
            !desktop && { paddingVertical: 56, paddingHorizontal: 20 },
          ]}
        >
          <Text style={s.eyebrow}>OBSERVATÓRIO DE SUPERFÍCIE / SÃO PAULO</Text>
          <Text
            accessibilityRole="header"
            style={[
              s.title,
              {
                fontSize: width >= 1280 ? 112 : width >= 640 ? 76 : 46,
                lineHeight: width >= 1280 ? 108 : width >= 640 ? 82 : 52,
              },
            ]}
          >
            {tab === "Explore" ? "Uma nova leitura\nda sua cidade." : tab}
          </Text>
          <Text style={s.subtitle}>
            {tab === "Explore"
              ? "Satélites, dados e ciência para entender o calor urbano. Explore a superfície de São Paulo e descubra os padrões por trás da paisagem."
              : DESCRIPTIONS[tab]}
          </Text>
          {tab === "Explore" && (
            <View style={s.heroActions}>
              <Button
                onPress={() =>
                  scrollRef.current?.scrollTo({
                    y: contentY.current,
                    animated: true,
                  })
                }
              >
                Explorar o mapa ↓
              </Button>
              <Button secondary onPress={() => navigate("Sobre")}>
                Conheça o projeto ↗
              </Button>
            </View>
          )}
          <View style={s.heroMeta}>
            <Text style={s.meta}>LANDSAT / LST / MACHINE LEARNING</Text>
            <Text style={s.meta}>23°33′ S · 46°38′ W</Text>
          </View>
        </View>
        <View
          onLayout={(event) => {
            contentY.current = event.nativeEvent.layout.y;
          }}
          style={[s.content, { paddingHorizontal: width >= 640 ? 32 : 0 }]}
        >
          <View style={s.sectionHeading}>
            <View style={{ gap: 8 }}>
              <Text style={s.eyebrow}>GEOVISION / {tab.toUpperCase()}</Text>
              <Text accessibilityRole="header" style={s.sectionTitle}>
                {tab === "Explore"
                  ? "O território, em perspectiva."
                  : DESCRIPTIONS[tab]}
              </Text>
            </View>
            <Text style={s.meta}>
              {busy > 0
                ? "◌ Processando…"
                : account?.email || "◎ Acesso público"}
            </Text>
          </View>
          {message && (
            <View
              accessibilityRole="alert"
              style={[
                s.message,
                {
                  backgroundColor: message.error ? "#3B1F25" : "#182B23",
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
                <Text style={{ color: colors.ink }}>✕</Text>
              </Pressable>
            </View>
          )}
          {(tab === "Explore" || tab === "Analytics") && (
            <MapScreen
              key={`${tab}-${demoRevision}`}
              {...common}
              advanced={tab === "Analytics"}
            />
          )}
          {tab === "Dados" && <DataScreen key={demoRevision} {...common} />}
          {tab === "Machine Learning" && (
            <MLScreen key={demoRevision} {...common} />
          )}
          {tab === "Visitas" && <VisitsScreen key={demoRevision} {...common} />}
          {tab === "Desenvolvedores" && (
            <DeveloperScreen key={demoRevision} {...common} />
          )}
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
                  laboratório de modelos acompanha o caminho entre os dados e
                  uma estimativa de LST.
                </Paragraph>
              </Card>
              <Card title="Compromissos científicos">
                <Paragraph>
                  As observações mantêm fonte e data. Dados sintéticos são
                  identificados. A análise de vegetação, construções e calor
                  descreve associações; explicações de um modelo não comprovam
                  causalidade. SUHI exige referência urbana/rural explícita e
                  não é sinônimo de qualquer ponto quente.
                </Paragraph>
                <Paragraph>
                  Escopo histórico planejado: julho de 2016–2026, sujeito à
                  disponibilidade e qualidade das cenas. O produto ainda requer
                  validação com dados reais e pesquisa com usuários.
                </Paragraph>
              </Card>
            </>
          )}
        </View>
        <View style={s.footer}>
          <View style={s.brand}>
            <Text style={s.brandMark}>◉</Text>
            <Text style={s.brandTitle}>GeoVision</Text>
          </View>
          <Text style={s.meta}>
            Dados com contexto. Decisões com evidências.
          </Text>
          <Text style={s.meta}>SÃO PAULO · BRASIL / 0.2.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
const heading = Platform.OS === "web" ? "Manrope, sans-serif" : undefined;
const mono = Platform.OS === "web" ? '"Geist Mono", monospace' : "monospace";
const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.paper },
  page: { width: "100%", maxWidth: 1512, alignSelf: "center", padding: 16 },
  header: {
    minHeight: 80,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    ...Platform.select({ web: { backdropFilter: "blur(20px)" } }),
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { color: colors.lime, fontSize: 32 },
  brandTitle: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: "600",
    fontFamily: heading,
    letterSpacing: -1,
  },
  navigation: { flexDirection: "row", gap: 2, alignItems: "center" },
  nav: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    minHeight: 44,
    borderRadius: 20,
  },
  navHover: { backgroundColor: "rgba(255,255,255,0.05)" },
  active: { backgroundColor: "rgba(57,229,140,0.08)" },
  navText: { color: colors.ink, fontSize: 13, fontFamily: heading },
  menuButton: { padding: 14, minHeight: 44 },
  mobileMenu: {
    backgroundColor: "#06100B",
    padding: 24,
    borderRadius: 24,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: {
    backgroundColor: "#123C2D",
    borderRadius: 32,
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 24,
    marginTop: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  eyebrow: {
    fontFamily: mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.lime,
    lineHeight: 20,
  },
  title: {
    fontFamily: heading,
    fontWeight: "500",
    color: colors.ink,
    letterSpacing: -2.2,
    textAlign: "center",
    marginTop: 28,
    maxWidth: "100%",
  },
  subtitle: {
    fontFamily: mono,
    fontSize: 14,
    lineHeight: 25,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    maxWidth: 640,
    marginTop: 28,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginTop: 32,
    marginBottom: 40,
  },
  heroMeta: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  meta: { fontFamily: mono, fontSize: 11, lineHeight: 20, color: colors.muted },
  content: { paddingTop: 64 },
  sectionHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: heading,
    fontSize: 30,
    lineHeight: 40,
    fontWeight: "500",
    color: colors.ink,
    maxWidth: 720,
  },
  message: {
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    gap: 15,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    marginTop: 64,
    paddingVertical: 32,
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
  },
});
