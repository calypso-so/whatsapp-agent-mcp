---
name: whatsapp-agent-get-started
description: Start here when the user first connects WhatsApp Agent by Calypso or asks what it can do. Explains the WhatsApp team inbox questions it answers, that it only reads, and what to try first.
---

# Get started with WhatsApp Agent

WhatsApp Agent by Calypso is the team's WhatsApp inbox inside ChatGPT. It reads the team's WhatsApp boards in Calypso: which customers are waiting for a reply, who owns each chat, what each teammate handled, what the Calypso Agent (the team's AI agent) answered by itself, and the follow-ups that are due.

It only reads. It never sends a message to a customer, and it never moves, assigns or closes a chat.

## First steps

1. Call `whatsapp-overview`. It shows every board with its open, unanswered and unread chats, the Inbox, the longest wait and the connected WhatsApp line.
2. For the customers who are waiting, call `whatsapp-list-chats` with `state: "unanswered"`. See the `whos-waiting` skill.
3. For one customer, find the chat with `whatsapp-find-chat`, then open it with `whatsapp-open-chat`. See the `find-a-customer` skill.
4. Read what was said with `whatsapp-read-messages` only when the question needs it. See the `summarise-a-conversation` skill.
5. For how the team did over a day or a week, use `whatsapp-agent-activity` and `whatsapp-list-conversations`. See the `team-performance` skill.

## The tools

- `whatsapp-overview` (Boards at a glance): how the team's WhatsApp stands right now.
- `whatsapp-list-boards` (List boards): the boards and their columns, by name.
- `whatsapp-list-chats` (List chats): open chats by board, column, state, owner or waiting time.
- `whatsapp-find-chat` (Find a chat): a chat by contact name, phone number or words in the last message.
- `whatsapp-open-chat` (Open a chat): one chat in full, with its follow-ups and reply window.
- `whatsapp-read-messages` (Read a chat's messages): the messages of one chat, newest first.
- `whatsapp-list-follow-ups` (List follow-ups): the follow-ups that are planned and when each is due.
- `whatsapp-agent-activity` (Agent and team activity): how conversations were handled over a period, per teammate too.
- `whatsapp-list-conversations` (List conversations): conversations over a period, closed ones included.

## Things to ask

- "Which customers are waiting for a reply on WhatsApp, and for how long?"
- "Who on my team handled the most WhatsApp conversations this week?"
- "Summarise the WhatsApp chat that has been waiting the longest."
- "What did our AI agent answer by itself in the last 7 days?"
- "Which follow-ups go out today?"

## Cite what you report

Cite where each fact comes from: name the board and the contact, and give the time of the message or the period the figures cover. Quote counts, waiting minutes and owners exactly as returned. Never estimate them.

## What WhatsApp Agent does not do

- It does not send or reply. The team replies from the boards at https://whatsapp.calypso.so. See the `whatsapp-agent-is-read-only` skill.
- It does not move, assign, take or close a chat, and it does not change a board, a column or a setting.
- It does not send campaigns or templates.
- It does not answer general questions about the world. It reads this team's WhatsApp boards only.
