import type { GovernmentContentBlock } from "@/models/letter";

export const MAX_TABLE_ROWS = 20;
export const MAX_TABLE_COLUMNS = 10;

export function contentBlocksOrLegacy(blocks: GovernmentContentBlock[] | undefined, body: string): GovernmentContentBlock[] {
  if (Array.isArray(blocks) && blocks.length > 0) return blocks;
  return [{ id: "legacy-body", type: "text", text: body }];
}

export function bodyTextFromBlocks(blocks: GovernmentContentBlock[]) {
  return blocks
    .filter((block): block is Extract<GovernmentContentBlock, { type: "text" }> => block.type === "text")
    .map((block) => block.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function createTableBlock(id: string, rowCount: number, columnCount: number, headerRow = true): Extract<GovernmentContentBlock, { type: "table" }> {
  const rows = Math.min(MAX_TABLE_ROWS, Math.max(1, Math.trunc(rowCount) || 2));
  const columns = Math.min(MAX_TABLE_COLUMNS, Math.max(1, Math.trunc(columnCount) || 2));
  return {
    id,
    type: "table",
    headerRow,
    cells: Array.from({ length: rows }, () => Array.from({ length: columns }, () => ""))
  };
}
