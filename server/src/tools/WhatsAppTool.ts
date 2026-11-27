import {
  type InputShape,
  McpTool,
  type ToolLogger,
} from "@calypsohq/elephant-mcp-server/kit";
import type { WhatsAppReads } from "../api/WhatsAppReads.js";
import { READ } from "../groups.js";

/** What every tool is handed for one request: a logger and the caller's reads. */
export type WhatsAppContext = {
  readonly log: ToolLogger;
  readonly reads: WhatsAppReads;
};

/**
 * One WhatsApp Agent tool.
 *
 * That it only reads is said once, here: the group every tool belongs to and
 * the three hints a client and a directory review look at. A subclass names
 * itself, words its inputs and says which read answers it.
 */
export abstract class WhatsAppTool<
  Shape extends InputShape = InputShape,
> extends McpTool<WhatsAppContext, Shape> {
  readonly group = READ;
  readonly annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  };
}
