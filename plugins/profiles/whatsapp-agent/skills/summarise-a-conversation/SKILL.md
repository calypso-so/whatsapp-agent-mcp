---
name: summarise-a-conversation
description: Use when the user wants to know what was said in a WhatsApp chat, a summary of a conversation, what the customer asked, or what the AI agent or a teammate answered. Reads the thread with whatsapp-read-messages.
---

# Summarise a WhatsApp conversation

Use this when the question needs the actual words: "summarise my chat with Maria", "what did the customer ask", "what did our agent tell him", "catch me up before I reply".

Read messages only when the question needs what was said. Counts, owners and waiting times come from the other tools without reading anyone's messages.

## Get the chat id

`whatsapp-read-messages` takes a `chat` id, never a name. Get it from `whatsapp-find-chat` or `whatsapp-list-chats`, or from a row of `whatsapp-list-conversations` for a conversation that is closed. For "the chat that has waited longest", call `whatsapp-list-chats` with `state: "unanswered"` and take the first one.

## Read the thread

Call `whatsapp-read-messages` with:

- `chat` (required): the chat id.
- `limit` (optional): how many messages, 30 at most.
- `before` (optional): `next_before` from the previous page, exactly as returned, to read further back.

Messages come newest first. Each has:

- `sender`: `customer`, `teammate` for a person on the team, or `agent` for anything Calypso sent by itself: the Calypso Agent's reply or an automatic out-of-hours message.
- `at`: when it was sent.
- `text`: what it said.
- `attachment`: the kind of attachment, when there is one. The file itself is not available, so say "a photo" or "a voice note" and nothing about its content.

Read further back with `before` when the first page does not reach the start of the matter. Stop when you have what the question needs.

## Write the summary

- Put it in order, oldest first: what the customer asked, what was answered and by whom, and what is still open.
- Keep the customer's and the team's words apart. Do not put words in anyone's mouth.
- Say when the newest message arrived and who sent it, so the user knows whether the customer is waiting.

## Cite the messages

Cite what you report: name the contact and give the time of each message you rely on. Quote a message as returned when the exact wording matters. If the thread does not say something, say so. Do not fill the gap.

## What WhatsApp Agent does not do

- It does not send the reply. Offer to draft one for the user to send from the boards at https://whatsapp.calypso.so.
- It does not read images, voice notes, videos or documents.
- It does not read chats from another workspace than the one the user connected.
