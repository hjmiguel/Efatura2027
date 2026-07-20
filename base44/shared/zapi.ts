function getInstanceConfig() {
  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  if (!instanceId || !token) throw new Error("Z-API credentials not configured");
  return { instanceId, token };
}

function getBaseUrl() {
  const { instanceId, token } = getInstanceConfig();
  return `https://api.z-api.io/instances/${instanceId}/token/${token}`;
}

async function sendText(phone, message) {
  const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");
  if (!clientToken) throw new Error("ZAPI_CLIENT_TOKEN não configurado");
  const res = await fetch(`${getBaseUrl()}/send-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Client-Token": clientToken },
    body: JSON.stringify({ phone, message }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Z-API send-text: ${res.status} ${text}`);
  }
  return await res.json();
}

export { sendText, getInstanceConfig, getBaseUrl };