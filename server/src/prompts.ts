import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const MORNING_BRIEF_PROMPT = "whatsapp-morning-brief";
export const GET_STARTED_PROMPT = "whatsapp-get-started";

const PROMPTS = [
  {
    name: MORNING_BRIEF_PROMPT,
    title: "Morning brief",
    description:
      "Where the boards stand: who has waited longest, what came in while the team was closed, and the follow-ups due today.",
    text: [
      "Give me this morning's WhatsApp brief.",
      "Call whatsapp-overview first. Then whatsapp-list-chats with state `unanswered` for the five customers who have waited longest, and whatsapp-list-follow-ups with within `today`.",
      "Answer in three short parts: how the boards stand, who needs a reply first (name, board, minutes waiting, last message), and what goes out today. Use the numbers exactly as returned.",
    ].join(" "),
  },
  {
    name: GET_STARTED_PROMPT,
    title: "Get started with WhatsApp Agent",
    description:
      "What WhatsApp Agent can tell you about your boards right now, and three questions to try.",
    text: [
      "Call whatsapp-overview and tell me in two sentences how my WhatsApp boards stand.",
      "If it returns a `next_step`, tell me that instead and stop.",
      "Otherwise offer three questions I could ask next, drawn from what you saw: the longest-waiting chat, a board by name, and today's follow-ups.",
    ].join(" "),
  },
] as const;

/** The two starters a client shows as slash commands or suggestions. */
export function registerPrompts(server: McpServer): void {
  for (const prompt of PROMPTS) {
    server.registerPrompt(
      prompt.name,
      { title: prompt.title, description: prompt.description },
      async () => ({
        messages: [
          {
            role: "user" as const,
            content: { type: "text" as const, text: prompt.text },
          },
        ],
      }),
    );
  }
}
