/**
 * What to say when there is nothing to read yet.
 *
 * An empty list tells a person nothing. A team with no WhatsApp line, or a
 * line and no chats, gets the one next step instead, alongside the numbers.
 */
export const CONNECT_LINE =
  "No WhatsApp line is connected to this workspace yet. Connect one at https://whatsapp.calypso.so/channels, and chats will show up here as they arrive.";
export const NO_CHATS =
  "There are no open chats right now. New WhatsApp messages show up here as they arrive.";

type Overview = {
  readonly line?: unknown;
  readonly inbox?: unknown;
  readonly groups?: unknown;
  readonly boards?: unknown;
};

function count(value: unknown): number {
  return typeof value === "number" && value > 0 ? value : 0;
}

export function firstMinuteHint(overview: unknown): string | undefined {
  if (!overview || typeof overview !== "object") return undefined;
  const { line, inbox, groups, boards } = overview as Overview;
  const onBoards = (Array.isArray(boards) ? boards : []).reduce(
    (sum: number, board) =>
      sum + count((board as { open_chats?: unknown })?.open_chats),
    0,
  );
  // Chats on screen mean a line is live, whatever the team's record says:
  // a Personal line can outlive the binding the overview reports.
  if (onBoards + count(inbox) + count(groups) > 0) return undefined;
  return line ? NO_CHATS : CONNECT_LINE;
}
