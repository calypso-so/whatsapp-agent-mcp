import type { ToolArgs } from "@calypsohq/elephant-mcp-server/kit";
import { z } from "zod";
import { board } from "./inputs.js";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

const inputSchema = {
  state: z
    .enum([
      "scheduled",
      "awaiting_owner",
      "due",
      "leased",
      "sent",
      "skipped",
      "cancelled",
      "expired",
      "failed",
    ])
    .optional()
    .describe(
      "One state only. Left out, the open ones are returned: what is still owed. `awaiting_owner` is waiting on a person's answer before it can go out.",
    ),
  within: z
    .enum(["today", "24h", "7d"])
    .optional()
    .describe("Only follow-ups due by then."),
  board,
};

export class ListFollowUpsTool extends WhatsAppTool<typeof inputSchema> {
  readonly name = "whatsapp-list-follow-ups";
  readonly title = "List follow-ups";
  readonly description =
    "The follow-ups the Calypso Agent has planned: which chat, on which board, what kind (`follow_up`, or `ask_owner` when the agent needs a person's answer first), its state and when it is due. Use it for what goes out today, and for what is waiting on someone to approve. If `scanned_limit_reached` is true the team has more follow-ups than one answer covers, so say the list may be incomplete.";
  readonly inputSchema = inputSchema;
  protected readonly failure = "Could not list the follow-ups.";

  protected async run(
    args: ToolArgs<typeof inputSchema>,
    context: WhatsAppContext,
  ) {
    return {
      json: await context.reads.followUps({
        state: args.state,
        within: args.within,
        board: args.board,
      }),
    };
  }
}
