import React, { useState } from "react";
import { Button, Card, Field, Paragraph, Row } from "../components/ui";
export default function AccountScreen({
  api,
  run,
  account,
  onLogin,
  onLogout,
  notify,
}) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [code, setCode] = useState("");
  const credentials = {
    email,
    password,
  };
  return (
    <Card title={account ? "Sua conta" : "Acesse seu espaço de pesquisa"}>
      {account ? (
        <>
          <Paragraph>
            {account.email} · {account.plan} ·{" "}
            {account.admin ? "Administrador" : "Pesquisador"}
          </Paragraph>
          <Button onPress={onLogout}>Sair</Button>
        </>
      ) : (
        <>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            label="Senha (mínimo 8 caracteres)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Row>
            <Button
              onPress={() =>
                run(async () => {
                  const r = await api("/auth/login", "POST", credentials);
                  await onLogin(r.access_token);
                })
              }
            >
              Entrar
            </Button>
            <Button
              secondary
              onPress={() =>
                run(async () => {
                  const r = await api("/auth/register", "POST", credentials);
                  if (r.development_verification_token)
                    setCode(r.development_verification_token);
                  notify(r.message);
                })
              }
            >
              Criar conta
            </Button>
          </Row>
          <Paragraph>
            Na instalação Docker local, o email chega ao Mailpit em
            localhost:8025. Copie o código abaixo.
          </Paragraph>
          <Field
            label="Código recebido por email"
            value={code}
            onChangeText={setCode}
          />
          <Row>
            <Button
              onPress={() =>
                run(async () => {
                  await api("/auth/verify", "POST", {
                    token: code,
                  });
                  notify("Email verificado. Agora entre.");
                })
              }
            >
              Verificar email
            </Button>
            <Button
              secondary
              onPress={() =>
                run(async () => {
                  const r = await api("/auth/resend", "POST", credentials);
                  if (r.development_verification_token)
                    setCode(r.development_verification_token);
                  notify(r.message);
                })
              }
            >
              Reenviar código
            </Button>
          </Row>
        </>
      )}
    </Card>
  );
}
