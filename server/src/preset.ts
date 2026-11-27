import { ToolPreset } from "@calypsohq/elephant-mcp-server/kit";
import { READ } from "./groups.js";
import { AgentActivityTool } from "./tools/AgentActivityTool.js";
import { FindChatTool } from "./tools/FindChatTool.js";
import { ListBoardsTool } from "./tools/ListBoardsTool.js";
import { ListChatsTool } from "./tools/ListChatsTool.js";
import { ListConversationsTool } from "./tools/ListConversationsTool.js";
import { ListFollowUpsTool } from "./tools/ListFollowUpsTool.js";
import { OpenChatTool } from "./tools/OpenChatTool.js";
import { OverviewTool } from "./tools/OverviewTool.js";
import { ReadMessagesTool } from "./tools/ReadMessagesTool.js";
import type { WhatsAppTool } from "./tools/WhatsAppTool.js";

/** Said to every caller. The promise comes before anything it can do. */
export const INSTRUCTIONS = [
  "WhatsApp Agent by Calypso reads this team's WhatsApp boards: the chats waiting for a reply, who owns each one, what the Calypso Agent handled, and the follow-ups that are due.",
  "It never messages your customers, and it never moves, assigns or closes a chat: it only reads. When the user asks to reply, move or assign, say this connection cannot and that they do it on the boards at https://whatsapp.calypso.so.",
  "Start with whatsapp-overview. Open a chat only when the user asks about one, and read its messages only when the question needs what was actually said.",
  "Quote waiting times, counts and owners exactly as returned; do not estimate them.",
  'For what a teammate did over a day or a week, use whatsapp-agent-activity (its by_member rows) and whatsapp-list-conversations, which include closed conversations; whatsapp-list-chats only shows what is open now. Per-teammate figures are by the conversation\'s current owner, and replies are counted per conversation, so say "in the conversations she owns", never "she sent".',
].join(" ");

/**
 * WhatsApp Agent by Calypso: one endpoint, one scope, nine tools that read.
 *
 * The path names the product, as Elephant's does, because Calypso's
 * authorization server tells products apart by the path of the resource.
 */
export const WHATSAPP_AGENT = new ToolPreset<WhatsAppTool>({
  id: "whatsapp-agent",
  path: "/whatsapp/mcp",
  serverName: "whatsapp-agent",
  displayName: "WhatsApp Agent by Calypso",
  scope: READ.scope,
  instructions: INSTRUCTIONS,
  documentationUrl: "https://www.calypso.so/whatsapp",
  // Every connection reads and nothing else, so there is nothing to add per caller.
  composeInstructions: (about) => about,
  tools: [
    new OverviewTool(),
    new ListBoardsTool(),
    new ListChatsTool(),
    new FindChatTool(),
    new OpenChatTool(),
    new ReadMessagesTool(),
    new ListFollowUpsTool(),
    new AgentActivityTool(),
    new ListConversationsTool(),
  ],
});
