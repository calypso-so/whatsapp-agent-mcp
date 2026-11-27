import { firstMinuteHint } from "../firstMinute.js";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

export class OverviewTool extends WhatsAppTool {
  readonly name = "whatsapp-overview";
  readonly title = "Boards at a glance";
  readonly description =
    "How the team's WhatsApp stands right now: for each board, how many chats are open, how many are waiting on the team (`unanswered`: the customer wrote and nobody on the team has opened or answered it since, or nobody has answered the conversation at all), how many are unread and how many a teammate has taken; how many chats sit in the Inbox on no board yet; the longest anyone has been waiting, in minutes; whether the team is inside its opening hours; and the connected WhatsApp line (`line`, with every connected one in `lines`: `personal_qr` is a phone paired by QR code, `business_app` and `api` are WhatsApp Business lines; null means none is connected). Start here for any question about the state of the boards.";
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
