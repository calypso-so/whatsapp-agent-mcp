import type { ToolArgs } from "@calypsohq/elephant-mcp-server/kit";
import { z } from "zod";
import { board, since } from "./inputs.js";
import { type WhatsAppContext, WhatsAppTool } from "./WhatsAppTool.js";

const inputSchema = {
  board,
  column: z
    .string()
    .max(128)
    .optional()
    .describe("A column of that board, by name."),
  state: z
    .enum(["waiting", "unanswered", "unread", "taken", "agent"])
    .optional()
    .describe(
      "`unanswered`: the customer spoke last, longest wait first. `waiting`: no teammate has taken it. `taken`: a teammate has. `unread`: has unread messages. `agent`: the Calypso Agent is answering it.",
    ),
  owner: z
    .string()
    .max(128)
    .optional()
    .describe(
      "Chats owned by one teammate, by name. `me` is the person who connected; `nobody` is chats no teammate owns.",
    ),
  since,
  olderThanMinutes: z
    .number()
    .int()
    .min(0)
    .max(525_600)
    .optional()
    .describe(
      "Only chats whose customer has waited at least this many minutes for a reply.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(25)
    .optional()
    .describe("How many chats to return, 25 at most."),
  cursor: z
    .string()
    .max(16)
    .optional()
    .describe("`next_cursor` from the previous page, to get the next one."),
};

export class ListChatsTool extends WhatsAppTool<typeof inputSchema> {
  readonly name = "whatsapp-list-chats";
  readonly title = "List chats";
  readonly description =
    "Open WhatsApp chats as the boards show them, filtered the way the question asks: by board or the Inbox, column, state, owner, recency, or how long the customer has waited. Each chat comes with its contact, phone, board and column, owner (a teammate, the Calypso Agent, or nobody), minutes waiting, unread count and a short preview of the last message. `total` counts every match; pages are 25 chats at most. Closed chats are not listed.";
  readonly inputSchema = inputSchema;
  protected readonly failure = "Could not list the chats.";

  protected async run(
    args: ToolArgs<typeof inputSchema>,
    context: WhatsAppContext,
  ) {
    return {
      json: await context.reads.chats({
        board: args.board,
        column: args.column,
        state: args.state,
        owner: args.owner,
        since: args.since,
        older_than_minutes: args.olderThanMinutes,
        limit: args.limit,
        cursor: args.cursor,
      }),
    };
  }
}
