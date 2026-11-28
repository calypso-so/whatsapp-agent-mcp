import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { after, before, test } from "node:test";
import { HttpConfig } from "@calypsohq/elephant-mcp-server/kit";
import { WHATSAPP_AGENT } from "../dist/preset.js";
import { composeWhatsAppServer, PRODUCT } from "../dist/server.js";

const PUBLIC = "https://whatsapp-mcp.calypso.so";
const METADATA_PATH = "/.well-known/oauth-protected-resource/whatsapp/mcp";
const INITIALIZE = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "http-test", version: "0" },
  },
};

const CHALLENGE_PATH = "/.well-known/openai-apps-challenge";
const CHALLENGE_TOKEN = "test-challenge-token";

let node;
let base;
const logged = [];
let realLog;

before(async () => {
  const config = HttpConfig.fromEnv(
    {
      WHATSAPP_TOKEN_ENC_KEY: randomBytes(32).toString("base64"),
      WHATSAPP_OPENAI_CHALLENGE_TOKEN: CHALLENGE_TOKEN,
    },
    PRODUCT,
  );
  realLog = console.log;
  console.log = (line) => logged.push(line);
  node = composeWhatsAppServer(config, {
    name: "whatsapp-agent-test",
    version: "0.0.0-test",
  }).createNodeServer();
  await new Promise((resolve) => node.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${node.address().port}`;
});

after(async () => {
  console.log = realLog;
  await new Promise((resolve) => node.close(resolve));
});

const post = (headers = {}) =>
  fetch(`${base}${WHATSAPP_AGENT.path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...headers,
    },
    body: JSON.stringify(INITIALIZE),
  });

test("the config reads this product's env names and its own address", () => {
  const config = HttpConfig.fromEnv(
    {
      WHATSAPP_REQUESTS_PER_MINUTE: "30",
      ELEPHANT_PUBLIC_BASE_URL: "https://mcp.calypso.so",
    },
    PRODUCT,
  );
  assert.equal(config.publicBaseUrl, PUBLIC);
  assert.equal(config.requestsPerMinute, 30);
  assert.equal(config.oauthEnabled, false);
  assert.equal(WHATSAPP_AGENT.resourceUrl(PUBLIC), `${PUBLIC}/whatsapp/mcp`);
});

test("it answers the health check", async () => {
  const response = await fetch(`${base}/healthz`);
  assert.equal(response.status, 200);
});

test("it proves the domain to the OpenAI portal with the token alone", async () => {
  const response = await fetch(`${base}${CHALLENGE_PATH}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^text\/plain/);
  assert.equal(await response.text(), CHALLENGE_TOKEN);
});

test("with no token set there is nothing at the challenge address", async () => {
  const bare = composeWhatsAppServer(HttpConfig.fromEnv({}, PRODUCT), {
    name: "whatsapp-agent-test",
    version: "0.0.0-test",
  }).createNodeServer();
  await new Promise((resolve) => bare.listen(0, "127.0.0.1", resolve));
  try {
    const address = `http://127.0.0.1:${bare.address().port}`;
    const response = await fetch(`${address}${CHALLENGE_PATH}`);
    assert.equal(response.status, 404);
  } finally {
    await new Promise((resolve) => bare.close(resolve));
  }
});

test("a call with no credentials is told where to sign in", async () => {
  const response = await post();
  assert.equal(response.status, 401);
  assert.equal(
    response.headers.get("www-authenticate"),
    `Bearer resource_metadata="${PUBLIC}${METADATA_PATH}"`,
  );
  await response.text();
});

test("the resource describes itself for OAuth discovery", async () => {
  const response = await fetch(`${base}${METADATA_PATH}`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    resource: `${PUBLIC}/whatsapp/mcp`,
    authorization_servers: ["https://login.calypso.so"],
    scopes_supported: ["whatsapp:read"],
    bearer_methods_supported: ["header"],
    resource_name: "WhatsApp Agent by Calypso",
    resource_documentation: "https://www.calypso.so/whatsapp",
  });
});

test("a Calypso project key is served", async () => {
  const response = await post({
    authorization: "Bearer sk-0123456789abcdef0123",
  });
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /"name":"whatsapp-agent"/);
  assert.match(body, /never messages your customers/);
});

test("a token that is not one of ours is refused, with the reason logged", async () => {
  const response = await post({ authorization: "Bearer not-a-token" });
  assert.equal(response.status, 401);
  await response.text();
  assert.ok(
    logged.some((line) => String(line).includes("invalid_token")),
    "the request log says why it was refused",
  );
});

test("the endpoint is POST only, and other paths are not found", async () => {
  const get = await fetch(`${base}${WHATSAPP_AGENT.path}`);
  assert.equal(get.status, 405);
  const elsewhere = await fetch(`${base}/elephant/mcp`, { method: "POST" });
  assert.equal(elsewhere.status, 404);
});
