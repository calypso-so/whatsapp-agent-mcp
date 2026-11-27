import { ToolGroup } from "@calypsohq/elephant-mcp-server/kit";

/** OAuth scope a connection must carry: boards, chats, messages, follow-ups. */
export const WHATSAPP_READ_SCOPE = "whatsapp:read";

/**
 * Reading is all there is. Every tool belongs to this group, so every
 * connection is offered every tool, and none of them changes anything.
 */
export const READ = ToolGroup.define({
  id: "read",
  scope: WHATSAPP_READ_SCOPE,
  can: "read boards, chats, their messages, follow-ups and agent activity",
  cannot: "",
});
