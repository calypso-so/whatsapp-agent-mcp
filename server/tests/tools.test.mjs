import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { CONNECT_LINE, NO_CHATS } from "../dist/firstMinute.js";
import { WHATSAPP_AGENT } from "../dist/preset.js";
import { createWhatsAppMcpServer } from "../dist/WhatsAppMcpServer.js";

const API_BASE = "https://api.example.test/v1";
const KEY = "sk-0123456789abcdef0123";

/** What the Calypso API answers, by path; a test swaps in what it needs. */
let answers;
/** Every call the tools made to the Calypso API. */
let calls;
let realFetch;

beforeEach(() => {
  answers = {};
  calls = [];
  realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const { pathname, searchParams } = new URL(String(url));
    calls.push({
      path: pathname.replace("/v1", ""),
      query: Object.fromEntries(searchParams),
      method: init.method,
      authorization: init.headers.Authorization,
    });
    const answer = answers[pathname.replace("/v1", "")] ?? {
      status: 200,
      body: {},
    };
    return new Response(JSON.stringify(answer.body), {
      status: answer.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

async function connect(scopes) {
  const server = createWhatsAppMcpServer({
    preset: WHATSAPP_AGENT,
    api: { apiKey: KEY, apiBaseUrl: API_BASE },
    packageInfo: { name: "whatsapp-agent-test", version: "0.0.0-test" },
    principal: "key:test",
    scopes,
  });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "tools-test", version: "0" });
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  return client;
}

const json = (result) => JSON.parse(result.content[0].text);

test("it offers eight tools, and every one only reads", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  assert.deepEqual(
    tools.map((tool) => tool.name),
    [
      "whatsapp-overview",
      "whatsapp-list-boards",
      "whatsapp-list-chats",
      "whatsapp-find-chat",
      "whatsapp-open-chat",
      "whatsapp-read-messages",
      "whatsapp-list-follow-ups",
      "whatsapp-agent-activity",
    ],
  );
  for (const tool of tools) {
    assert.deepEqual(
      tool.annotations,
      { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      tool.name,
    );
    assert.ok(tool.title && tool.description.length > 60, tool.name);
    assert.doesNotMatch(tool.name, /send|reply|move|assign|close|delete/);
  }
  await client.close();
});

test("it tells every caller that it never messages customers", async () => {
  const client = await connect(["whatsapp:read"]);
  const instructions = client.getInstructions();
  assert.match(instructions, /never messages your customers/);
  assert.match(instructions, /it only reads/);
  assert.doesNotMatch(instructions, /Elephant/);
  await client.close();
});

test("each tool asks the one route that answers it, as the caller", async () => {
  const client = await connect();
  const cases = [
    ["whatsapp-overview", {}, "/whatsapp/overview", {}],
    ["whatsapp-list-boards", {}, "/whatsapp/boards", {}],
    [
      "whatsapp-list-chats",
      {
        board: "Sales",
        state: "unanswered",
        owner: "me",
        olderThanMinutes: 60,
        limit: 5,
      },
      "/whatsapp/chats",
      {
        board: "Sales",
        state: "unanswered",
        owner: "me",
        older_than_minutes: "60",
        limit: "5",
      },
    ],
    [
      "whatsapp-find-chat",
      { query: "marta" },
      "/whatsapp/chats/search",
      { query: "marta" },
    ],
    [
      "whatsapp-open-chat",
      { chat: "56911111111" },
      "/whatsapp/chats/56911111111",
      {},
    ],
    [
      "whatsapp-read-messages",
      { chat: "CL.1843012979703264", limit: 10 },
      "/whatsapp/chats/CL.1843012979703264/messages",
      { limit: "10" },
    ],
    [
      "whatsapp-list-follow-ups",
      { within: "today", board: "Support" },
      "/whatsapp/follow-ups",
      { within: "today", board: "Support" },
    ],
    [
      "whatsapp-agent-activity",
      { since: "2026-11-20T09:00:00-03:00" },
      "/whatsapp/activity",
      { since: "2026-11-20T09:00:00-03:00" },
    ],
  ];
  for (const [name, args, path, query] of cases) {
    calls.length = 0;
    const result = await client.callTool({ name, arguments: args });
    assert.notEqual(result.isError, true, `${name}: ${result.content[0].text}`);
    assert.equal(calls.length, 1, name);
    assert.deepEqual(
      calls[0],
      { path, query, method: "GET", authorization: `Bearer ${KEY}` },
      name,
    );
  }
  await client.close();
});

test("a chat id cannot reach another route", async () => {
  const client = await connect();
  await client.callTool({
    name: "whatsapp-open-chat",
    arguments: { chat: "../boards?x=1" },
  });
  assert.equal(calls[0].path, "/whatsapp/chats/..%2Fboards%3Fx%3D1");
  assert.deepEqual(calls[0].query, {});
  await client.close();
});

test("what the API answers is passed on as it arrived", async () => {
  const chats = {
    chats: [
      {
        chat: "56911111111",
        contact: "Marta Pérez",
        board: "Sales",
        owner: "Calypso Agent",
        waiting_minutes: 90,
      },
    ],
    total: 1,
    next_cursor: null,
  };
  answers["/whatsapp/chats"] = { body: chats };
  const client = await connect();
  const result = await client.callTool({
    name: "whatsapp-list-chats",
    arguments: {},
  });
  assert.deepEqual(json(result), chats);
  await client.close();
});

test("activity is asked for the whole team, never for one board", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  const activity = tools.find(
    (tool) => tool.name === "whatsapp-agent-activity",
  );
  assert.deepEqual(Object.keys(activity.inputSchema.properties), ["since"]);
  await client.close();
});

test("an empty workspace is told its next step, not handed zeros", async () => {
  const client = await connect();
  const overview = (body) => {
    answers["/whatsapp/overview"] = { body };
    return client.callTool({ name: "whatsapp-overview", arguments: {} });
  };

  const noLine = json(await overview({ line: null, boards: [], inbox: 0 }));
  assert.equal(noLine.next_step, CONNECT_LINE);

  const noChats = json(
    await overview({
      line: "api",
      boards: [{ name: "Sales", open_chats: 0 }],
      inbox: 0,
      groups: 0,
    }),
  );
  assert.equal(noChats.next_step, NO_CHATS);

  const busy = json(
    await overview({
      line: "api",
      boards: [{ name: "Sales", open_chats: 3 }],
      inbox: 1,
    }),
  );
  assert.equal(busy.next_step, undefined);
  assert.equal(busy.inbox, 1);

  const unbound = json(
    await overview({
      line: null,
      boards: [{ name: "Sales", open_chats: 2 }],
      inbox: 0,
    }),
  );
  assert.equal(unbound.next_step, undefined);
  await client.close();
});

test("a refusal from the API reaches the model as a tool error it can read", async () => {
  answers["/whatsapp/chats"] = {
    status: 403,
    body: {
      error: {
        code: "not_a_whatsapp_team",
        message: "This key's team is not a Calypso WhatsApp workspace.",
      },
    },
  };
  const client = await connect();
  const result = await client.callTool({
    name: "whatsapp-list-chats",
    arguments: {},
  });
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /^Error: Could not list the chats\./);
  assert.match(result.content[0].text, /not a Calypso WhatsApp workspace/);
  await client.close();
});

test("it refuses inputs the API would refuse, before calling it", async () => {
  const client = await connect();
  for (const [name, args] of [
    ["whatsapp-list-chats", { state: "archived" }],
    ["whatsapp-list-chats", { limit: 500 }],
    ["whatsapp-find-chat", { query: "a" }],
    ["whatsapp-read-messages", { chat: "x", limit: 31 }],
    ["whatsapp-list-follow-ups", { within: "soon" }],
  ]) {
    const result = await client
      .callTool({ name, arguments: args })
      .catch((error) => ({ isError: true, error }));
    assert.equal(result.isError, true, `${name} ${JSON.stringify(args)}`);
  }
  assert.equal(calls.length, 0);
  await client.close();
});

test("it publishes two starters", async () => {
  const client = await connect();
  const { prompts } = await client.listPrompts();
  assert.deepEqual(
    prompts.map((prompt) => prompt.name),
    ["whatsapp-morning-brief", "whatsapp-get-started"],
  );
  const brief = await client.getPrompt({ name: "whatsapp-morning-brief" });
  assert.match(brief.messages[0].content.text, /whatsapp-overview/);
  await client.close();
});
