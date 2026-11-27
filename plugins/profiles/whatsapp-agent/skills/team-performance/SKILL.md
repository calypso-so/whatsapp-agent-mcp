---
name: team-performance
description: Use when the user asks how the team or one teammate did on WhatsApp over a day or a week, who handled or closed the most conversations, response times, what the AI agent handled, or which conversations were closed. Uses whatsapp-agent-activity and whatsapp-list-conversations.
---

# Team and AI agent performance

Use this for a period, not for right now: "who handled the most chats this week", "what did Ana close today", "how much did our AI agent answer", "which conversations did nobody answer", "how fast do we take a chat".

`whatsapp-list-chats` only shows what is open now. Anything already closed comes from the two tools below.

## The figures

Call `whatsapp-agent-activity`. It covers the last seven days unless `since` says otherwise (an ISO 8601 date-time with its offset). It returns, for the whole team:

- `conversations`, `handled_by_agent`, `handled_by_team`, `unhandled` (nobody answered);
- `handed_over`: conversations a person took over after the Calypso Agent had answered;
- `agent_replies` and `team_replies`.

`by_member` breaks the same conversations down by teammate, busiest first: how many each one owns, how many of those are closed or still open, how many they took over from the agent, the replies sent in them, and the median minutes until a person first took a conversation and until it closed.

## The list

Call `whatsapp-list-conversations` to name the conversations behind a figure.

- `since`, `until`: the period, by when a conversation started.
- `status`: `closed` or `open`.
- `owner`: one teammate by name. `me` is the person who connected. `nobody` is conversations no teammate owns.
- `handledBy`: who answered last: `agent`, `team` or `nobody`.
- `limit`: 25 at most. Pass `next_cursor` as `cursor` for the next page.

Each row has the chat id, the contact, its owner, when it started, was first taken by a person and closed, who answered last, the replies each side sent, whether a person took over from the agent, and the customer's rating. Pass the chat id to `whatsapp-open-chat` or `whatsapp-read-messages`, closed or not.

A conversation belongs to the period it started in, whenever it closed. For "closed today", start `since` a few days back, ask for `status: "closed"`, and keep the rows whose `closed_at` is today.

## Limits to say out loud

- A conversation counts for its current owner only. A transferred one is credited to whoever holds it last.
- Replies are counted per conversation, not per person. Say "in the conversations she owns", never "she sent".
- `no owner recorded` is conversations a person answered that no teammate holds.
- `replies`, `team_replies`, `handed_over` and `taken_over_from_agent` are null on WhatsApp Business lines, which do not record them. Say unknown, not zero.
- If `scanned_limit_reached` is true, the period held more conversations than were read. Say the figures are a floor and the list may be incomplete.
- The figures are for the whole team, not for one board.

## Cite the period

Cite the period every figure covers, from `since`, and name each teammate as returned. Give the numbers exactly. Do not round them or turn them into a ranking the data does not support.

## What WhatsApp Agent does not do

- It does not score or rate people. It reports what the boards recorded.
- It does not count the messages one person typed. Replies are per conversation.
- It does not change who owns a conversation, and it does not reopen or close one.
