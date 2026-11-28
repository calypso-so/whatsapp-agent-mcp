import {
  ApiKeyStrategy,
  type AuthStrategy,
  BearerAuthenticator,
  type HttpConfig,
  HttpServer,
  JwtGrantStrategy,
  ProtectedResourceMetadata,
  RateLimiter,
  TokenCipher,
} from "@calypsohq/elephant-mcp-server/kit";
import { createRemoteJWKSet } from "jose";
import { WHATSAPP_AGENT } from "./preset.js";
import { WhatsAppEndpoint } from "./WhatsAppEndpoint.js";
import type { PackageInfo } from "./WhatsAppMcpServer.js";

/** The env names this server reads, and where it is served when they do not say. */
export const PRODUCT = {
  prefix: "WHATSAPP",
  publicBaseUrl: "https://whatsapp-mcp.calypso.so",
} as const;

/**
 * Wires the hosted server: who may call (a Calypso project key, or a token
 * Calypso's authorization server issued for this resource), the one endpoint,
 * and the HTTP router. The only place that knows every piece.
 */
export function composeWhatsAppServer(
  config: HttpConfig,
  packageInfo: PackageInfo,
): HttpServer {
  const metadata = new ProtectedResourceMetadata(
    config.publicBaseUrl,
    config.issuer,
  );
  const strategies: AuthStrategy[] = [new ApiKeyStrategy()];
  if (config.tokenEncKey) {
    strategies.push(
      new JwtGrantStrategy({
        issuer: config.issuer,
        keys: createRemoteJWKSet(new URL(config.jwksUrl)),
        cipher: new TokenCipher(config.tokenEncKey),
        publicBaseUrl: config.publicBaseUrl,
        resourceMetadataUrl: (resource) => metadata.urlFor(resource) ?? "",
      }),
    );
  }
  const authenticator = new BearerAuthenticator(strategies, (resource) =>
    config.oauthEnabled ? metadata.urlFor(resource) : undefined,
  );
  return new HttpServer({
    endpoints: [
      new WhatsAppEndpoint({
        preset: WHATSAPP_AGENT,
        authenticator,
        limiter: new RateLimiter(config.requestsPerMinute),
        apiBaseUrl: config.apiBaseUrl,
        packageInfo,
      }),
    ],
    metadata,
    maxBodyBytes: config.maxBodyBytes,
    version: packageInfo.version,
    // Served as plain text at /.well-known/openai-apps-challenge when set.
    openaiChallengeToken: config.openaiChallengeToken,
    log: (line) => console.log(JSON.stringify(line)),
  });
}
