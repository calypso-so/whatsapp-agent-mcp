# WhatsApp Agent by Calypso

**An MCP server that lets Claude, ChatGPT and Cursor read your team's WhatsApp boards.**
Ask which chats are waiting, who owns each one, what the Calypso Agent handled, and which
follow-ups are due.

*It never messages your customers. It only reads.*

```text
https://whatsapp-mcp.calypso.so/whatsapp/mcp
```

Needs a [Calypso WhatsApp](https://www.calypso.so/whatsapp) workspace.

> **Status: launching.** The hosted endpoint above is not serving yet. This page will say when it is.

## What people ask it

| You ask | It answers from |
|---|---|
| "How are my boards this morning?" | each board's open, unanswered, unread and taken chats; the Inbox; the longest wait |
| "Who has been waiting longest?" | open chats where the customer spoke last, longest wait first |
| "What came in overnight?" | chats with activity since the time you name |
| "What's in the Inbox?" | chats that are on no board yet |
| "What's on Ana's plate?" | the chats one teammate owns |
| "Did the agent handle the Pérez chat? What did it say?" | the chat, who answers it, and its messages |
| "Can we still reply to her for free?" | WhatsApp's 24-hour reply window for that chat |
| "Which follow-ups go out today?" | the Calypso Agent's planned follow-ups, by due time |
| "How much did the agent handle this week?" | conversations handled by the agent, by the team, by nobody |

## Connect

Give your client the URL above. It opens Calypso's sign-in; you pick the WhatsApp workspace
and press Allow. No key to paste.

| Client | How |
|---|---|
| **Claude Code** | `claude mcp add --scope user --transport http whatsapp-agent https://whatsapp-mcp.calypso.so/whatsapp/mcp`, then open the sign-in link it prints |
| **Claude Desktop, Cursor, and others** | Add a remote (Streamable HTTP) server with the URL; the client finds sign-in on its own |
| **Any MCP client** | Streamable HTTP + OAuth 2.1 with dynamic registration and PKCE |

Disconnect any time from **API Keys** in Calypso. The connection ends with the key.

## Tools

One scope, `whatsapp:read`, and eight tools. Every one is marked read-only.

| Tool | What it returns |
|---|---|
| `whatsapp-overview` | Every board at a glance, the Inbox, the longest wait, and whether the team is open now |
| `whatsapp-list-boards` | Boards with their columns, and whether the agent and follow-ups are on |
| `whatsapp-list-chats` | Open chats, filtered by board, column, state, owner, recency or minutes waiting |
| `whatsapp-find-chat` | Open chats by name, phone digits or last message; a full phone number is looked up directly |
| `whatsapp-open-chat` | One chat: its card, last messages, open follow-ups and reply window |
| `whatsapp-read-messages` | A chat's messages, newest first, a page at a time |
| `whatsapp-list-follow-ups` | Planned follow-ups, by state, due time and board |
| `whatsapp-agent-activity` | How many conversations the agent, the team, or nobody handled over a period |

Two prompts ship with it: `whatsapp-morning-brief` and `whatsapp-get-started`.

## What it does not do

- It does not send, reply, move, assign or close. There is no tool for any of them.
- It does not return media. An attachment is named by its kind (`image`, `audio`, `video`, `document`).
- It does not search closed chats, beyond looking a full phone number up directly.
- It lists what the board shows: the newest 500 waiting and 500 taken chats.

## How it works

```text
your AI client ──POST──▶ whatsapp-mcp.calypso.so/whatsapp/mcp        server/  (this repo)
   │                401 + WWW-Authenticate ─▶ /.well-known/oauth-protected-resource/whatsapp/mcp
   └──OAuth 2.1 (PKCE, dynamic registration)──▶ login.calypso.so/oauth/*     Calypso sign-in
                                                 consent mints a read-only Calypso API key
server verifies the token, unseals the key ──▶ api.calypso.so/v1/whatsapp/*   Calypso API
```

| Rule | What it means |
|---|---|
| **No state** | No database, no sessions. Every `POST` builds a fresh server for its caller |
| **The API decides** | Which team the key belongs to, what it may read, and which fields an answer carries are the Calypso API's. This server passes answers on as they arrive |
| **One key per connection** | Allowing access mints a Calypso key that can read WhatsApp boards and nothing else |
| **Short, bound tokens** | ES256 JWT, 15 minutes, audience = this endpoint's URL |
| **Revocation is real** | Disconnect revokes the key. Calls fail within a minute |
| **Fair use** | 120 requests per minute per caller. Over that: `429` with `Retry-After` |

Authentication, the stateless endpoint, the rate limiter and the tool base classes come from
[`@calypsohq/elephant-mcp-server/kit`](https://github.com/calypso-so/elephant-mcp/tree/main/server#kit),
the kit Calypso's MCP servers share. This repo adds the eight tools and their wording.

## Build

Node 20 or later.

```bash
cd server && npm ci && npm run lint && npm run typecheck && npm test && npm run smoke
```

| Path | What it is |
|---|---|
| [`server/src/tools/`](server/src/tools/) | One class per tool; `WhatsAppTool` says once that every tool only reads |
| [`server/src/api/WhatsAppReads.ts`](server/src/api/WhatsAppReads.ts) | Which Calypso API route answers each question |
| [`server/src/preset.ts`](server/src/preset.ts) | The endpoint, its scope, its tools and what every caller is told |
| [`server/src/server.ts`](server/src/server.ts) | Wiring: who may call, the endpoint, the HTTP router |

## Deploy

[`render.yaml`](render.yaml) describes the service: `whatsapp-agent-mcp`, root `server/`, health
check `/healthz`, manual deploys.

| Env | Default | Purpose |
|---|---|---|
| `WHATSAPP_PUBLIC_BASE_URL` | `https://whatsapp-mcp.calypso.so` | Public origin; the token audience is this plus `/whatsapp/mcp` |
| `CALYPSO_OAUTH_ISSUER` | `https://login.calypso.so` | Authorization server |
| `CALYPSO_API_BASE_URL` | `https://api.calypso.so/v1` | Calypso API |
| `WHATSAPP_TOKEN_ENC_KEY` | none | 32-byte base64 key shared with the authorization server. Unset: sign-in off, API keys only |
| `WHATSAPP_JWKS_URL` | `<issuer>/.well-known/jwks.json` | Token signing keys |
| `WHATSAPP_REQUESTS_PER_MINUTE` | `120` | Per-caller request budget |
| `PORT` | `8080` | Listen port |

## License

[MIT](LICENSE).
