import {
  type BearerAuthenticator,
  type Credential,
  type RateLimiter,
  StatelessMcpEndpoint,
  type ToolPreset,
} from "@calypsohq/elephant-mcp-server/kit";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WhatsAppTool } from "./tools/WhatsAppTool.js";
import {
  createWhatsAppMcpServer,
  type PackageInfo,
} from "./WhatsAppMcpServer.js";

export type WhatsAppEndpointOptions = {
  readonly preset: ToolPreset<WhatsAppTool>;
  readonly authenticator: BearerAuthenticator;
  readonly limiter: RateLimiter;
  readonly apiBaseUrl: string;
  readonly packageInfo: PackageInfo;
};

/**
 * WhatsApp Agent served over stateless Streamable HTTP.
 *
 * Authentication, the request budget and the transport are the kit's. This
 * class adds the one step that is ours: a server bound to the caller's key.
 */
export class WhatsAppEndpoint extends StatelessMcpEndpoint<
  ToolPreset<WhatsAppTool>
> {
  constructor(private readonly options: WhatsAppEndpointOptions) {
    super(options);
  }

  protected async serverFor(credential: Credential): Promise<McpServer> {
    return createWhatsAppMcpServer({
      preset: this.preset,
      api: { apiKey: credential.apiKey, apiBaseUrl: this.options.apiBaseUrl },
      packageInfo: this.options.packageInfo,
      principal: credential.principal,
      scopes: credential.scopes,
    });
  }
}
