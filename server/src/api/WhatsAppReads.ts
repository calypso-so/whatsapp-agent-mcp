import {
  CalypsoApiClient,
  type CalypsoApiConfig,
} from "@calypsohq/elephant-mcp-server/kit";

type Query = Readonly<Record<string, string | number | undefined>>;

export type ChatFilters = {
  readonly board?: string;
  readonly column?: string;
  readonly state?: string;
  readonly owner?: string;
  readonly since?: string;
  readonly older_than_minutes?: number;
  readonly limit?: number;
  readonly cursor?: string;
};

export type ConversationFilters = {
  readonly since?: string;
  readonly until?: string;
  readonly status?: string;
  readonly owner?: string;
  readonly handled_by?: string;
  readonly limit?: number;
  readonly cursor?: string;
};

/**
 * The Calypso API's read-only WhatsApp routes (`/v1/whatsapp/*`), as one
 * caller.
 *
 * The API decides everything: which team the key belongs to, what the key may
 * read, and which fields an answer carries. This class only says which route
 * a question goes to, so what it returns is passed on as it arrived.
 */
export class WhatsAppReads {
  private readonly client: CalypsoApiClient;

  constructor(config: CalypsoApiConfig) {
    this.client = new CalypsoApiClient(config);
  }

  overview(): Promise<unknown> {
    return this.get("/whatsapp/overview");
  }

  boards(): Promise<unknown> {
    return this.get("/whatsapp/boards");
  }

  chats(filters: ChatFilters): Promise<unknown> {
    return this.get("/whatsapp/chats", filters);
  }

  findChats(query: string): Promise<unknown> {
    return this.get("/whatsapp/chats/search", { query });
  }

  chat(chatId: string): Promise<unknown> {
    return this.get(`/whatsapp/chats/${encodeURIComponent(chatId)}`);
  }

  messages(
    chatId: string,
    page: { readonly before?: string; readonly limit?: number },
  ): Promise<unknown> {
    return this.get(
      `/whatsapp/chats/${encodeURIComponent(chatId)}/messages`,
      page,
    );
  }

  followUps(filters: {
    readonly state?: string;
    readonly within?: string;
    readonly board?: string;
  }): Promise<unknown> {
    return this.get("/whatsapp/follow-ups", filters);
  }

  /** A period's conversations, open and closed. */
  conversations(filters: ConversationFilters): Promise<unknown> {
    return this.get("/whatsapp/conversations", filters);
  }

  /** Team-wide: the API offers no board filter for activity. */
  activity(filters: { readonly since?: string }): Promise<unknown> {
    return this.get("/whatsapp/activity", filters);
  }

  private get(path: string, query: Query = {}): Promise<unknown> {
    const params = new URLSearchParams();
    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") params.set(name, String(value));
    }
    const suffix = params.size > 0 ? `?${params}` : "";
    return this.client.request<unknown>(`${path}${suffix}`, { method: "GET" });
  }
}
