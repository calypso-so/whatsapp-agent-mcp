# WhatsApp Agent for the ChatGPT plugin directory

This folder holds what the directory listing is made of: the name and descriptions, the skills ChatGPT reads, the review cases and the owl. It holds no code. The package is built and validated by Elephant's packaging tool (`calypso-so/elephant-mcp`, `plugins/`), run against this folder with `--root`.

| Package | Product name | Listing title | Subtitle | Endpoint |
|---|---|---|---|---|
| `whatsapp-agent` | WhatsApp Agent by Calypso | WhatsApp Agent: Team Inbox | WhatsApp Business CRM insights | `https://whatsapp-mcp.calypso.so/whatsapp/mcp` |

## Commands

They expect the Elephant repository checked out next to this one (`../elephant`). Set `ELEPHANT_PLUGINS` to its `plugins/` folder when it lives elsewhere. Run `npm ci` there once.

```bash
npm run build            # validate, then write out/whatsapp-agent/openai/ and out/whatsapp-agent-openai-<version>.zip
npm run validate         # validate only, writes nothing
npm run validate:online  # also fetches every URL in the manifest and the skills
```

A build fails on any error. The ZIP is reproducible: the same files always give the same bytes and SHA-256.

## Layout

```
slugs.json                              the binding names: package, product name, listing title, endpoint, scope, tools
profiles/whatsapp-agent/
  plugin.config.json                    listing copy, tools, review cases, forbidden wording
  skills/<name>/SKILL.md                what ChatGPT reads to decide when and how to use each tool
shared/assets -> ../../assets           the owl (icon.png 512, logo.png 1024), one copy for the repo
out/                                    build output, not committed
```

`plugin.config.json` and `slugs.json` must agree. A name changes in both or the build fails.

## How the listing was written

It follows what ranks for "whatsapp" in the directory (surveyed 2026-11-27):

- **The title starts with "WhatsApp".** Every top result does. Ours is the product name, as the sign-in screen shows it, then what it is: `WhatsApp Agent: Team Inbox` (26 of 30 characters).
- **The subtitle carries the other searched words**: `WhatsApp Business CRM insights` (30 of 30). "Insights" says it reads.
- **Three starter prompts, each naming WhatsApp**, each answerable on any connected workspace without a contact's name.
- **The description opens with the keywords in a sentence** (WhatsApp Business, team inbox, ChatGPT), then says in the second paragraph that it is read-only, then lists what to ask, how it connects (QR-linked number or the WhatsApp Business Platform), and who it is for (sales and customer support teams on a shared inbox).
- **It ends with the independence line**: not made by, affiliated with or endorsed by WhatsApp or Meta.
- **Category `Communication`**, where the other read-only WhatsApp inbox plugins sit.

What sets it apart from the rest of the page is said first everywhere: it never sends a message, it shows who is waiting and for how long, and it breaks the work down per teammate with closed conversations included.

## Before submitting

- **Review workspace.** It exists: "Larkspur Home (WhatsApp demo)", a made-up shop with two boards (Support and Sales), four people, ten open chats and fourteen conversations closed in the last few days, on a connected personal line. Every contact uses a `+1 415 555 01xx` number, a range reserved for fiction. The five positive cases say what each prompt returns there.
- **Keep it fresh.** The chats are stored relative to the moment they were seeded, so the "last 7 days" answers thin out after about two days. Refresh the workspace right before recording the demo and submitting, and once a day while the listing is in review.
- **Review sign-in.** The account's email and password go in the submission form only. They are not in this repository or in the package.
- **Checked.** All eight cases were run against the review workspace through the live server: each positive prompt called its expected tool and returned the figures in its case, and no negative prompt called a tool. Run them once more in ChatGPT itself before submitting.
- `review.demo_recording_url` is empty; the build warns until it is set.
- Set `listing.releaseState` to `ready-for-review` when the recording is in.
