---
name: follow-ups-due
description: Use when the user asks which WhatsApp follow-ups are due today or this week, what the AI agent plans to send, or what is waiting for someone to approve. Lists them with whatsapp-list-follow-ups and the boards with whatsapp-list-boards.
---

# Follow-ups that are due

The Calypso Agent plans follow-ups: a message to send a customer later, or a question it needs a person to answer first. Use this for "what goes out today", "what is waiting on me", "which follow-ups are scheduled for the Sales board".

## List them

Call `whatsapp-list-follow-ups` with:

- `within` (optional): `today`, `24h` or `7d`. Only follow-ups due by then. Today is the team's own day, in its time zone.
- `state` (optional): one state only. Left out, the open ones are returned: what is still owed. `awaiting_owner` is waiting on a person's answer before it can go out. The other states are `scheduled`, `due`, `leased`, `sent`, `skipped`, `cancelled`, `expired` and `failed`.
- `board` (optional): a board by name or id.

Each follow-up has its chat, contact, board, `kind` (`follow_up`, or `ask_owner` when the agent needs a person's answer first), `state`, `due_at` and topic.

If `scanned_limit_reached` is true, the team has more follow-ups than one answer covers. Say the list may be incomplete.

## Which boards have follow-ups

Call `whatsapp-list-boards`. Each board says whether follow-ups are on (`follow_ups_on`) and whether the Calypso Agent answers on it (`agent_on`). An empty list on a board with follow-ups off is expected: say they are off for that board.

## Cite the chat and the due time

Cite each follow-up by its contact, its board and when it is due, as returned. Group them by day when there are many. To show the conversation behind one, pass its chat id to `whatsapp-open-chat`.

## What WhatsApp Agent does not do

- It does not send, approve, skip or cancel a follow-up. The team does that on the boards at https://whatsapp.calypso.so.
- It does not create a follow-up or a reminder.
- It does not turn follow-ups on or off for a board.
