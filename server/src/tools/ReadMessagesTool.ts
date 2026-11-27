import type { ToolArgs } from "@calypsohq/elephant-mcp-server/kit";
import { z } from "zod";
import { chat } from "./inputs.js";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

const inputSchema = {
  chat,
  before: z
    .string()
    .max(2048)
    .optional()
    .describe(
      "`next_before` from the previous page, exactly as returned, to read further back in the thread.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(30)
    .optional()
    .describe("How many messages to return, 30 at most."),
};

export class ReadMessagesTool extends WhatsAppTool<typeof inputSchema> {
  readonly name = "whatsapp-read-messages";
  readonly title = "Read a chat's messages";
  readonly description =
    "The messages of one chat, newest first, each with who sent it (`customer`, `agent` for the Calypso Agent, `teammate` for a person on the team), when, and its text. An attachment is named by its kind only; the file itself is not available. Call it only when the question needs what was actually said, such as summarising a conversation or checking what the agent told a customer.";
  readonly inputSchema = inputSchema;
  protected readonly failure = "Could not read the messages.";

  protected async run(
    args: ToolArgs<typeof inputSchema>,
    context: WhatsAppContext,
  ) {
    return {
      json: await context.reads.messages(args.chat, {
        before: args.before,
        limit: args.limit,
      }),
    };
  }
}
