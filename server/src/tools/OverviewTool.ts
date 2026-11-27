import { firstMinuteHint } from "../firstMinute.js";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

export class OverviewTool extends WhatsAppTool {
  readonly name = "whatsapp-overview";
  readonly title = "Boards at a glance";
  readonly description =
    "How the team's WhatsApp stands right now: for each board, how many chats are open, how many are waiting on a reply, how many are unread and how many a teammate has taken; how many chats sit in the Inbox on no board yet; the longest anyone has been waiting, in minutes; and whether the team is inside its opening hours. Start here for any question about the state of the boards.";
  readonly inputSchema = {};
  protected readonly failure = "Could not read the boards.";

  protected async run(_args: Record<string, never>, context: WhatsAppContext) {
    const overview = await context.reads.overview();
    const hint = firstMinuteHint(overview);
    return {
      json: hint ? { ...(overview as object), next_step: hint } : overview,
    };
  }
}
