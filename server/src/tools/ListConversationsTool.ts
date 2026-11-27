import type { ToolArgs } from "@calypsohq/elephant-mcp-server/kit";
import { z } from "zod";
import { since } from "./inputs.js";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

const inputSchema = {
  since,
  until: z
    .string()
    .datetime({ offset: true })
    .optional()
    .describe(
      "Only conversations that started up to this moment, as an ISO 8601 date-time with its offset.",
    ),
  status: z
    .enum(["open", "closed"])
    .optional()
    .describe("`closed` for finished conversations, `open` for ongoing ones."),
  owner: z
    .string()
    .max(128)
    .optional()
    .describe(
      "Conversations owned by one teammate, by name. `me` is the person who connected; `nobody` is conversations no teammate owns.",
    ),
  handledBy: z
    .enum(["agent", "team", "nobody"])
    .optional()
    .describe(
      "Who answered last: `agent` (the Calypso Agent), `team` (a person), or `nobody`.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(25)
    .optional()
    .describe("How many conversations to return, 25 at most."),
  cursor: z
    .string()
    .max(16)
    .optional()
    .describe("`next_cursor` from the previous page, to get the next one."),
};

export class ListConversationsTool extends WhatsAppTool<typeof inputSchema> {
  readonly name = "whatsapp-list-conversations";
  readonly title = "List conversations, closed ones included";
  readonly description =
    "Conversations over a period, newest first, open and closed alike: the last seven days unless `since` says otherwise. A conversation belongs to the period it started in, whenever it closed: for what was closed today, start `since` a few days back, ask for `closed`, and read each row's `closed_at`. Use it for what whatsapp-list-chats cannot show, which is anything already closed: what a teammate closed today, which closed conversations nobody answered, how one went. Each row has the chat id (pass it to whatsapp-open-chat or whatsapp-read-messages, closed or not), the contact, its owner, when it started, was first taken by a person and closed, who answered last, the replies each side sent, whether a person took over from the agent, and the customer's rating. `team_replies` and `handed_over` are null on WhatsApp Business lines, which do not record them: say unknown, not zero. `owner` is the teammate who holds it now: a transferred conversation shows its last owner only. `total` counts every match; if `scanned_limit_reached` is true the period held more conversations than were read, so say the list may be incomplete.";
  readonly inputSchema = inputSchema;
  protected readonly failure = "Could not list the conversations.";

  protected async run(
    args: ToolArgs<typeof inputSchema>,
    context: WhatsAppContext,
  ) {
    return {
      json: await context.reads.conversations({
        since: args.since,
        until: args.until,
        status: args.status,
        owner: args.owner,
        handled_by: args.handledBy,
        limit: args.limit,
        cursor: args.cursor,
      }),
    };
  }
}
