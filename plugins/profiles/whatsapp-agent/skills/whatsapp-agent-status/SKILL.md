---
name: whatsapp-agent-status
description: Use when the user asks whether WhatsApp Agent by Calypso is connected, which workspace or WhatsApp number it reads, or why nothing shows up. Checks the connection with whatsapp-overview and explains what to do when no line or no chat is there.
---

# Is WhatsApp Agent connected

## Check it

Call `whatsapp-overview` with no arguments. A successful answer means the connection works. Read:

- `line`: the connected WhatsApp line. `personal_qr` is a phone paired by QR code. `business_app` and `api` are WhatsApp Business lines. `lines` lists every connected one. Null means none is connected.
- `boards`, `inbox`: where the open chats are.
- `next_step`: present when there is nothing to read yet. Tell the user that step as written.

To name the boards and their columns, call `whatsapp-list-boards`.

## Report it

Say that WhatsApp Agent is connected, which kind of line it reads, and how many chats are open across the boards and the Inbox. Cite the overview as the source of the status ("according to the boards right now").

## When something is off

- An authorization error means the connection to Calypso expired or was removed. The user reconnects WhatsApp Agent from ChatGPT's settings and signs in to Calypso again.
- No line connected: the user connects a WhatsApp number at https://whatsapp.calypso.so/channels. Chats show up as they arrive.
- A line but no chats: nothing is open right now. New messages show up as they arrive.
- The wrong workspace: the user chose the workspace when connecting. They reconnect to choose another.
- A permission error means the workspace does not include WhatsApp boards. Point the user to their Calypso workspace admin.

## What WhatsApp Agent does not do

- It does not connect, pair or disconnect a WhatsApp number.
- It does not switch workspace inside a chat. Reconnect to switch.
- It does not change anything it reads.
