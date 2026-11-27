import { z } from "zod";

/** The inputs several tools share, worded once. */

export const chat = z
  .string()
  .min(1)
  .max(256)
  .describe(
    "The chat's id: the `chat` value of a card from whatsapp-list-chats or whatsapp-find-chat. Never a name or a guess.",
  );

export const board = z
  .string()
  .max(128)
  .optional()
  .describe(
    "A board, by its name or id as whatsapp-list-boards returns them. `inbox` means chats that are on no board yet.",
  );

export const since = z
  .string()
  .datetime({ offset: true })
  .optional()
  .describe(
    "Only from this moment on, as an ISO 8601 date-time with its offset, e.g. 2026-11-27T09:00:00-03:00.",
  );
