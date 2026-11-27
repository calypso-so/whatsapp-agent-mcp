---
name: find-a-customer
description: Use when the user asks about one customer or one WhatsApp chat, by contact name, phone number or what was last said. Finds it with whatsapp-find-chat and opens it with whatsapp-open-chat to show owner, board, follow-ups and the 24-hour reply window.
---

# Find a customer's chat

Use this for questions about a single customer: "find my chat with Maria", "who owns the chat with +56 9 1234 5678", "can we still reply to Daniel", "which chat mentioned the refund".

## Find it

Call `whatsapp-find-chat` with `query`: a contact's name, part of a phone number, or words from the last message. It returns ten chats at most.

- It searches open chats. A full phone number is also looked up directly, so it can find a chat that is closed.
- If nothing comes back, say the chat is not open. Do not say it does not exist. Offer to search by the full phone number.
- If several chats match, list them with contact, phone and board, and ask which one.

## Open it

Call `whatsapp-open-chat` with `chat`: the `chat` id of the card you found. Never pass a name or a guess. It returns:

- the card: contact, phone, board and column, owner, waiting time and unread count;
- `recent_messages`: the last three messages. `agent` marks anything Calypso sent by itself, a reply or an out-of-hours message;
- `follow_ups`: the open follow-ups for this chat;
- `reply_window`: WhatsApp's 24-hour reply window. `applies` says whether this chat's line has one, `open` whether the team can still reply freely, and `closes_at` when it closes.

To read further back than three messages, see the `summarise-a-conversation` skill.

## Cite the chat

Cite the chat you are talking about: the contact name, the board it is on and the time of the message you quote. Say who owns it exactly as returned: a teammate's name, the Calypso Agent, or nobody.

## What WhatsApp Agent does not do

- It does not search every closed chat by name. Closed conversations are listed by period with `whatsapp-list-conversations`.
- It does not reply, even when the reply window is open. The team replies from the boards at https://whatsapp.calypso.so.
- It does not open attachments. A photo, voice note or file is named by its kind only.
