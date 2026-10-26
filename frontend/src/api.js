export const API = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export async function request(
  path,
  { token = "", method = "GET", body, raw = false } = {},
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(`${API}/api/v1${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        typeof error.detail === "string"
          ? error.detail
          : JSON.stringify(error.detail || `HTTP ${response.status}`),
      );
    }
    return raw ? response.blob() : response.json();
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error(
        "A consulta excedeu 45 segundos. Confira a conexão ou acompanhe a tarefa na fila.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
