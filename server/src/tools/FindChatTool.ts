import type { ToolArgs } from "@calypsohq/elephant-mcp-server/kit";
import { z } from "zod";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

const inputSchema = {
  query: z
    .string()
    .min(2)
    .max(128)
    .describe(
      "A contact's name, part of a phone number, or words from the last message.",
    ),
};

export class FindChatTool extends WhatsAppTool<typeof inputSchema> {
  readonly name = "whatsapp-find-chat";
  readonly title = "Find a chat";
  readonly description =
    "Finds open chats by contact name, phone digits, or words in the last message, ten at most. A full phone number is also looked up directly, so it can find a chat that is closed. Other closed chats are not searched: if nothing comes back, say the chat is not open rather than that it does not exist.";
  readonly inputSchema = inputSchema;
  protected readonly failure = "Could not search the chats.";

  protected async run(
    args: ToolArgs<typeof inputSchema>,
    context: WhatsAppContext,
  ) {
    return { json: await context.reads.findChats(args.query) };
  }
}
