import type { ToolArgs } from "@calypsohq/elephant-mcp-server/kit";
import { chat } from "./inputs.js";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

const inputSchema = { chat };

export class OpenChatTool extends WhatsAppTool<typeof inputSchema> {
  readonly name = "whatsapp-open-chat";
  readonly title = "Open a chat";
  readonly description =
    "One chat in full: its card, the last three messages, its open follow-ups, and WhatsApp's 24-hour reply window (`reply_window`: whether it applies to this chat's line, whether it is still open, and when it closes). Use it for questions about a single customer, and to say whether the team can still reply freely.";
  readonly inputSchema = inputSchema;
  protected readonly failure = "Could not open the chat.";

  protected async run(
    args: ToolArgs<typeof inputSchema>,
    context: WhatsAppContext,
  ) {
    return { json: await context.reads.chat(args.chat) };
  }
}
