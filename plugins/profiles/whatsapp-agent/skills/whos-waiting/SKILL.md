---
name: whos-waiting
description: Use when the user asks which customers are waiting for a reply on WhatsApp, how long they have waited, how the WhatsApp inbox or a board stands, or what is unanswered or unread. Reads the boards with whatsapp-overview and whatsapp-list-chats.
---

# Who is waiting on WhatsApp

Use this for the state of the inbox right now: "who is waiting", "what is unanswered", "how is the Support board doing", "anything waiting more than an hour".

## Start with the overview

Call `whatsapp-overview` first, with no arguments. For each board it returns:

- `open_chats`: chats open on the board.
- `unanswered`: chats waiting on the team. The customer spoke last, so their message is the newest one in the chat.
- `unread`: chats with unread messages.
- `taken`: chats a teammate has taken.

It also returns the `inbox` (chats on no board yet), `longest_wait_minutes`, whether the team is inside its opening hours (`open_now`), and the connected WhatsApp `line`. If the answer carries a `next_step`, tell the user that step: nothing is connected or no chat is open yet.

## List the chats

Call `whatsapp-list-chats` to name the customers.

- `state: "unanswered"`: the customer is waiting on the team, longest wait first. This is the one for "who is waiting for a reply".
- `state: "waiting"`: no teammate has taken the chat. `taken`: a teammate has. `unread`: it has unread messages. `agent`: the Calypso Agent is answering it.
- `board`: a board by name or id, or `inbox` for chats on no board yet. `column`: a column of that board, by name. Learn the names with `whatsapp-list-boards`.
- `owner`: one teammate by name. `me` is the person who connected. `nobody` is chats no teammate owns.
- `olderThanMinutes`: only chats whose customer has waited at least this long. Use 60 for "more than an hour".
- `since`: only chats active from this moment on, as an ISO 8601 date-time with its offset.
- `limit`: 25 at most. When the answer has a `next_cursor`, pass it as `cursor` for the next page.

Each chat comes with its contact, phone, board and column, owner, `waiting_minutes`, unread count and a preview of the last message. `total` counts every match, also the ones on later pages.

## Reading it right

- `waiting_minutes` is counted from the customer's last message, and it is only present while the customer spoke last.
- An automatic out-of-hours message counts as Calypso speaking last, so that chat is not listed as unanswered.
- Closed chats are not listed here. For anything closed, see the `team-performance` skill.

## Cite the board and the contact

Cite each chat by its contact name, its board and its waiting time, as returned. Give totals from `total`, not from the length of one page. Turn minutes into hours only when it reads better, and keep the figure exact.

## What WhatsApp Agent does not do

- It does not reply to the customers it lists. The team replies from the boards at https://whatsapp.calypso.so.
- It does not take, assign or move a waiting chat.
- It does not list closed chats in `whatsapp-list-chats`.
