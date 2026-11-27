import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

export class ListBoardsTool extends WhatsAppTool {
  readonly name = "whatsapp-list-boards";
  readonly title = "List boards";
  readonly description =
    "The team's boards with their columns, in order, and for each board whether the Calypso Agent answers on it and whether follow-ups are on. Use it to learn the board and column names the other tools take.";
  readonly inputSchema = {};
  protected readonly failure = "Could not list the boards.";

  protected async run(_args: Record<string, never>, context: WhatsAppContext) {
    return { json: await context.reads.boards() };
  }
}
