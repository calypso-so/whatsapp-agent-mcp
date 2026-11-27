import type { ToolArgs } from "@calypsohq/elephant-mcp-server/kit";
import { since } from "./inputs.js";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

const inputSchema = { since };

export class AgentActivityTool extends WhatsAppTool<typeof inputSchema> {
  readonly name = "whatsapp-agent-activity";
  readonly title = "Agent and team activity";
  readonly description =
    "How the whole team's conversations were handled over a period, the last seven days unless `since` says otherwise: how many there were, how many the Calypso Agent handled, how many the team handled, how many a person took over after the agent had answered (`handed_over`), how many nobody answered, and how many replies each sent. If `scanned_limit_reached` is true the period held more conversations than were counted, so say the figures are a floor. The figures are for the team, not for one board.";
  readonly inputSchema = inputSchema;
  protected readonly failure = "Could not read the activity.";

  protected async run(
    args: ToolArgs<typeof inputSchema>,
    context: WhatsAppContext,
  ) {
    return {
      json: await context.reads.activity({ since: args.since }),
    };
  }
}
