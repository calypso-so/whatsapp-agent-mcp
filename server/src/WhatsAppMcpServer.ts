import {
  type CalypsoApiConfig,
  GrantScopes,
  ToolLogger,
  type ToolPreset,
  ToolRegistrar,
} from "@calypsohq/elephant-mcp-server/kit";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WhatsAppReads } from "./api/WhatsAppReads.js";
import { registerPrompts } from "./prompts.js";
import type { WhatsAppContext, WhatsAppTool } from "./tools/WhatsAppTool.js";

export type PackageInfo = { readonly name: string; readonly version: string };

export type WhatsAppMcpServerOptions = {
  readonly preset: ToolPreset<WhatsAppTool>;
  /** The caller's Calypso API key and the API base URL. */
  readonly api: CalypsoApiConfig;
  readonly packageInfo: PackageInfo;
  /** Safe-to-log label for the caller, e.g. `grant:<id>`. */
  readonly principal: string;
  /** The OAuth scopes the caller's grant carries; absent for a raw API key. */
  readonly scopes?: readonly string[];
};

/**
 * Builds the MCP server for one caller.
 *
 * Built per request and thrown away after it: the tools close over this
 * caller's API key only, so nothing one caller reads can reach another.
 */
export function createWhatsAppMcpServer(
  options: WhatsAppMcpServerOptions,
): McpServer {
  const { preset, packageInfo } = options;
  const grant = GrantScopes.of(options.scopes);
  const server = new McpServer(
    {
      name: preset.serverName,
      title: preset.displayName,
      version: packageInfo.version,
    },
    {
      capabilities: { logging: {} },
      instructions: preset.instructionsFor(grant),
    },
  );
  const context: WhatsAppContext = {
    log: new ToolLogger(server, options.principal),
    reads: new WhatsAppReads(options.api),
  };
  for (const tool of preset.toolsFor(grant)) {
    ToolRegistrar.register(server, tool, context);
  }
  registerPrompts(server);
  return server;
}
