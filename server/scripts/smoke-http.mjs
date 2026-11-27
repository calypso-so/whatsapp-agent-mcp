// Starts the built server on a free port and checks what a client meets
// before it has credentials: health, the sign-in challenge, discovery, 405.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { HttpConfig } from "@calypsohq/elephant-mcp-server/kit";
import { WHATSAPP_AGENT } from "../dist/preset.js";
import { composeWhatsAppServer, PRODUCT } from "../dist/server.js";

const config = HttpConfig.fromEnv(
  { WHATSAPP_TOKEN_ENC_KEY: randomBytes(32).toString("base64") },
  PRODUCT,
);
const quiet = console.log;
console.log = () => {};
const node = composeWhatsAppServer(config, {
  name: "smoke",
  version: "0.0.0-smoke",
}).createNodeServer();
await new Promise((resolve) => node.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${node.address().port}`;
const say = (line) => quiet(`ok   ${line}`);

try {
  assert.equal((await fetch(`${base}/healthz`)).status, 200);
  say("health check");

  const refused = await fetch(`${base}${WHATSAPP_AGENT.path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(refused.status, 401);
  const challenge = refused.headers.get("www-authenticate") ?? "";
  const metadataUrl = /resource_metadata="([^"]+)"/.exec(challenge)?.[1];
  assert.ok(metadataUrl, "the 401 names the resource metadata");
  say(`401 challenge → ${metadataUrl}`);

  const metadata = await (
    await fetch(`${base}${new URL(metadataUrl).pathname}`)
  ).json();
  assert.equal(metadata.resource, `${config.publicBaseUrl}/whatsapp/mcp`);
  assert.deepEqual(metadata.scopes_supported, ["whatsapp:read"]);
  say(`discovery: ${metadata.resource} · ${metadata.scopes_supported}`);

  assert.equal((await fetch(`${base}${WHATSAPP_AGENT.path}`)).status, 405);
  say("GET on the endpoint answers 405");

  quiet(
    `ok   tools = ${WHATSAPP_AGENT.toolNames().join(", ")}\n\nsmoke passed.`,
  );
} finally {
  console.log = quiet;
  await new Promise((resolve) => node.close(resolve));
}
