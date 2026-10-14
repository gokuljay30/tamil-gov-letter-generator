"use client";

import { useMemo, useState } from "react";
import TextTransformActions from "@/components/ai/TextTransformActions";
import {
  createTableBlock,
  MAX_TABLE_COLUMNS,
  MAX_TABLE_ROWS
} from "@/lib/letters/governmentContent";
import type { GovernmentContentBlock } from "@/models/letter";
import { withoutTerminalFullStop } from "@/lib/text/punctuation";

interface ActiveCell {
  blockId: string;
  row: number;
  column: number;
}

type ColumnAlignment = "left" | "center" | "right";

function equalColumnWidths(columnCount: number) {
  return Array.from({ length: columnCount }, () => 100 / columnCount);
}

function tableColumnWidths(block: Extract<GovernmentContentBlock, { type: "table" }>) {
  const columnCount = block.cells[0]?.length ?? 1;
  return block.columnWidths?.length === columnCount ? block.columnWidths : equalColumnWidths(columnCount);
}

export default function GovernmentContentEditor({ blocks, onChange, aiConfigured, subject, department }: {
  blocks: GovernmentContentBlock[];
  onChange: (blocks: GovernmentContentBlock[]) => void;
  aiConfigured: boolean;
  subject: string;
  department: string;
}) {
  const [dialogAfter, setDialogAfter] = useState<number | null>(null);
  const [rowCount, setRowCount] = useState(2);
  const [columnCount, setColumnCount] = useState(2);
  const [headerRow, setHeaderRow] = useState(true);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editRowCount, setEditRowCount] = useState(2);
  const [editColumnCount, setEditColumnCount] = useState(2);

  const textNumbers = useMemo(() => {
    let value = 0;
    return blocks.map((block) => block.type === "text" ? ++value : value);
  }, [blocks]);

  function openDialog(afterIndex: number) {
    setDialogAfter(afterIndex);
    setRowCount(2);
    setColumnCount(2);
    setHeaderRow(true);
  }

  function addTable() {
    if (dialogAfter === null) return;
    const table = createTableBlock(crypto.randomUUID(), rowCount, columnCount, headerRow);
    const nextText: GovernmentContentBlock = { id: crypto.randomUUID(), type: "text", text: "" };
    const next = [...blocks];
    next.splice(dialogAfter + 1, 0, table, nextText);
    onChange(next);
    setDialogAfter(null);
    openTableEditor(table.id, table.cells.length, table.cells[0]?.length ?? 1);
  }

  function openTableEditor(blockId: string, rows: number, columns: number) {
    setEditingTableId(blockId);
    setEditRowCount(rows);
    setEditColumnCount(columns);
    setActiveCell(null);
  }

  function resizeEditingTable() {
    if (!editingTableId) return;
    const rows = Math.min(MAX_TABLE_ROWS, Math.max(1, Math.trunc(editRowCount) || 1));
    const columns = Math.min(MAX_TABLE_COLUMNS, Math.max(1, Math.trunc(editColumnCount) || 1));
    onChange(blocks.map((block) => {
      if (block.id !== editingTableId || block.type !== "table") return block;
      const cells = Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: columns }, (_, columnIndex) => block.cells[rowIndex]?.[columnIndex] ?? ""));
      return {
        ...block,
        cells,
        headerAlignments: Array.from({ length: columns }, (_, index) => block.headerAlignments?.[index] ?? "center"),
        columnAlignments: Array.from({ length: columns }, (_, index) => block.columnAlignments?.[index] ?? "left"),
        columnWidths: columns === (block.cells[0]?.length ?? 0) ? tableColumnWidths(block) : equalColumnWidths(columns)
      };
    }));
    setEditRowCount(rows);
    setEditColumnCount(columns);
    setActiveCell(null);
  }

  function setEditingHeaderRow(headerEnabled: boolean) {
    if (!editingTableId) return;
    onChange(blocks.map((block) => block.id === editingTableId && block.type === "table"
      ? { ...block, headerRow: headerEnabled }
      : block));
  }

  function updateEditingTable(changes: Partial<Extract<GovernmentContentBlock, { type: "table" }>>) {
    if (!editingTableId) return;
    onChange(blocks.map((block) => block.id === editingTableId && block.type === "table" ? { ...block, ...changes } : block));
  }

  function setColumnAlignment(column: number, alignment: ColumnAlignment) {
    if (!editingTable || editingTable.type !== "table") return;
    const columnCount = editingTable.cells[0]?.length ?? 1;
    const alignments = Array.from({ length: columnCount }, (_, index) => editingTable.columnAlignments?.[index] ?? "left");
    alignments[column] = alignment;
    updateEditingTable({ columnAlignments: alignments });
  }

  function setHeaderAlignment(column: number, alignment: ColumnAlignment) {
    if (!editingTable || editingTable.type !== "table") return;
    const columnCount = editingTable.cells[0]?.length ?? 1;
    const alignments = Array.from({ length: columnCount }, (_, index) => editingTable.headerAlignments?.[index] ?? "center");
    alignments[column] = alignment;
    updateEditingTable({ headerAlignments: alignments });
  }

  function setColumnWidth(column: number, requestedWidth: number) {
    if (!editingTable || editingTable.type !== "table") return;
    const widths = tableColumnWidths(editingTable);
    if (widths.length === 1) return updateEditingTable({ columnWidths: [100] });
    const width = Math.min(90, Math.max(10, requestedWidth || 10));
    const otherTotal = widths.reduce((sum, value, index) => index === column ? sum : sum + value, 0);
    const remainder = 100 - width;
    const next = widths.map((value, index) => index === column
      ? width
      : otherTotal > 0 ? value / otherTotal * remainder : remainder / (widths.length - 1));
    updateEditingTable({ columnWidths: next });
  }

  function updateText(blockId: string, text: string) {
    onChange(blocks.map((block) => block.id === blockId && block.type === "text" ? { ...block, text } : block));
  }

  function updateCell(target: ActiveCell, text: string) {
    onChange(blocks.map((block) => {
      if (block.id !== target.blockId || block.type !== "table") return block;
      const cells = block.cells.map((row) => [...row]);
      if (!cells[target.row] || target.column >= cells[target.row].length) return block;
      cells[target.row][target.column] = text;
      return { ...block, cells };
    }));
  }

  function removeTable(blockId: string) {
    if (!window.confirm("இந்த அட்டவணையை நீக்கவா?")) return;
    onChange(blocks.filter((block) => block.id !== blockId));
    if (activeCell?.blockId === blockId) setActiveCell(null);
    if (editingTableId === blockId) setEditingTableId(null);
  }

  const editingTable = editingTableId
    ? blocks.find((block) => block.id === editingTableId && block.type === "table")
    : undefined;
  const selectedTable = activeCell?.blockId === editingTableId ? editingTable : undefined;
  const selectedText = selectedTable?.type === "table" && activeCell
    ? selectedTable.cells[activeCell.row]?.[activeCell.column] ?? ""
    : "";
  const selectedTargetId = activeCell
    ? `government-table-${activeCell.blockId}-${activeCell.row}-${activeCell.column}`
    : undefined;
  const selectedColumn = editingTable?.type === "table" ? activeCell?.column ?? 0 : 0;
  const selectedAlignment = editingTable?.type === "table" ? editingTable.columnAlignments?.[selectedColumn] ?? "left" : "left";
  const selectedHeaderAlignment = editingTable?.type === "table" ? editingTable.headerAlignments?.[selectedColumn] ?? "center" : "center";
  const selectedWidth = editingTable?.type === "table" ? tableColumnWidths(editingTable)[selectedColumn] ?? 100 : 100;

  return <div className="government-content-editor">
    {blocks.map((block, blockIndex) => block.type === "text" ? <section className="content-block-editor" key={block.id}>
      <label className="field">
        <span className="field__label">கடித உள்ளடக்கம் {textNumbers[blockIndex]}</span>
        <textarea
          id={`government-content-${block.id}`}
          className="body-editor"
          rows={10}
          value={block.text}
          onChange={(event) => updateText(block.id, event.target.value)}
        />
      </label>
      <TextTransformActions
        field="body"
        currentText={block.text}
        supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil", "grammar_tamil", "shorten", "expand"]}
        aiConfigured={aiConfigured}
        context={{ subject, department }}
        dictationTargetId={`government-content-${block.id}`}
        onAccept={(text) => updateText(block.id, text)}
      />
      <button type="button" className="mini-button add-table-button" onClick={() => openDialog(blockIndex)}>+ அட்டவணை சேர்க்க</button>
    </section> : <section className={`table-block-editor table-block-summary${editingTableId === block.id ? " table-block-expanded" : ""}`} key={block.id}>
      <div className="table-block-heading">
        <div><strong>அட்டவணை</strong><span>{block.cells.length} × {block.cells[0]?.length ?? 0}{block.headerRow ? " · முதல் வரி தலைப்பு" : ""}</span></div>
        <div className="table-summary-actions">
          <button type="button" className="mini-button table-edit-button" onClick={() => editingTableId === block.id ? (setEditingTableId(null), setActiveCell(null)) : openTableEditor(block.id, block.cells.length, block.cells[0]?.length ?? 1)} aria-label="அட்டவணையைத் திருத்து">{editingTableId === block.id ? "மூடு ×" : "✎ திருத்து"}</button>
          <button type="button" className="danger-action" onClick={() => removeTable(block.id)}>நீக்கு</button>
        </div>
      </div>
      {editingTableId === block.id ? <div className="inline-table-editor">
        <p className="inline-table-help">கட்டத்தில் கிளிக் செய்து திருத்தவும். மாற்றங்கள் உடனடியாக A4 முன்னோட்டத்தில் தெரியும்.</p>
        <div className="table-resize-toolbar">
          <label><span>வரிகள்</span><input type="number" min="1" max={MAX_TABLE_ROWS} value={editRowCount} onChange={(event) => setEditRowCount(Number(event.target.value))} /></label>
          <label><span>நெடுவரிசைகள்</span><input type="number" min="1" max={MAX_TABLE_COLUMNS} value={editColumnCount} onChange={(event) => setEditColumnCount(Number(event.target.value))} /></label>
          <button type="button" className="mini-button" onClick={resizeEditingTable}>அளவைப் பயன்படுத்து</button>
          <label className="format-checkbox"><input type="checkbox" checked={block.headerRow} onChange={(event) => setEditingHeaderRow(event.target.checked)} /><span>முதல் வரி தலைப்பு</span></label>
          {block.headerRow ? <label className="format-checkbox"><input type="checkbox" checked={block.headerBold ?? true} onChange={(event) => updateEditingTable({ headerBold: event.target.checked })} /><span>தலைப்பு தடித்த எழுத்து</span></label> : null}
        </div>
        <div className="table-format-toolbar">
          {block.headerRow ? <div className="table-format-group"><span>நெடுவரிசை {selectedColumn + 1} தலைப்பு மட்டும்</span><div className="alignment-buttons">
            <button type="button" className={selectedHeaderAlignment === "left" ? "active" : ""} onClick={() => setHeaderAlignment(selectedColumn, "left")}>இடது</button>
            <button type="button" className={selectedHeaderAlignment === "center" ? "active" : ""} onClick={() => setHeaderAlignment(selectedColumn, "center")}>நடுவில்</button>
            <button type="button" className={selectedHeaderAlignment === "right" ? "active" : ""} onClick={() => setHeaderAlignment(selectedColumn, "right")}>வலது</button>
          </div></div> : null}
          <div className="table-format-group"><span>நெடுவரிசை {selectedColumn + 1} வரிசைகள் மட்டும்</span><div className="alignment-buttons">
            <button type="button" className={selectedAlignment === "left" ? "active" : ""} onClick={() => setColumnAlignment(selectedColumn, "left")}>இடது</button>
            <button type="button" className={selectedAlignment === "center" ? "active" : ""} onClick={() => setColumnAlignment(selectedColumn, "center")}>நடுவில்</button>
            <button type="button" className={selectedAlignment === "right" ? "active" : ""} onClick={() => setColumnAlignment(selectedColumn, "right")}>வலது</button>
          </div></div>
          <label className="table-width-control"><span>நெடுவரிசை அகலம்</span><div><input type="number" min="10" max="90" step="1" value={Math.round(selectedWidth)} onChange={(event) => setColumnWidth(selectedColumn, Number(event.target.value))} /><b>%</b></div></label>
          <button type="button" className="mini-button" onClick={() => updateEditingTable({ columnWidths: equalColumnWidths(block.cells[0]?.length ?? 1) })}>சம அகலம்</button>
          <label className="table-padding-control"><span>கட்ட இடைவெளி</span><select value={block.cellPadding ?? "normal"} onChange={(event) => updateEditingTable({ cellPadding: event.target.value as "compact" | "normal" | "wide" })}><option value="compact">குறைவு</option><option value="normal">இயல்பு</option><option value="wide">அதிகம்</option></select></label>
        </div>
        <div className="editable-table-wrap inline-editable-table-wrap">
          <table className="editable-content-table">
            <colgroup>{tableColumnWidths(block).map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup>
            <tbody>{block.cells.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, columnIndex) => {
              const isActive = activeCell?.blockId === block.id && activeCell.row === rowIndex && activeCell.column === columnIndex;
              const alignment = block.headerRow && rowIndex === 0
                ? block.headerAlignments?.[columnIndex] ?? "center"
                : block.columnAlignments?.[columnIndex] ?? "left";
              return <td className={`${block.headerRow && rowIndex === 0 ? "header-cell" : ""}${isActive ? " active-cell" : ""}`} style={{ textAlign: alignment }} key={columnIndex}>
                <textarea id={`government-table-${block.id}-${rowIndex}-${columnIndex}`} rows={2} value={cell} aria-label={`அட்டவணை வரி ${rowIndex + 1}, நெடுவரிசை ${columnIndex + 1}`} onFocus={() => setActiveCell({ blockId: block.id, row: rowIndex, column: columnIndex })} onClick={() => setActiveCell({ blockId: block.id, row: rowIndex, column: columnIndex })} onChange={(event) => updateCell({ blockId: block.id, row: rowIndex, column: columnIndex }, event.target.value)} />
              </td>;
            })}</tr>)}</tbody>
          </table>
        </div>
        <div className="active-cell-toolbar">
          <div className="active-cell-label">{activeCell?.blockId === block.id ? `செயலில்: வரி ${activeCell.row + 1} · நெடுவரிசை ${activeCell.column + 1}` : "மாற்ற வேண்டிய கட்டத்தில் கிளிக் செய்யவும்"}</div>
          {activeCell?.blockId === block.id ? <TextTransformActions field="body" currentText={selectedText} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} aiConfigured={aiConfigured} context={{ subject, department }} dictationTargetId={selectedTargetId} onAccept={(text) => updateCell(activeCell, withoutTerminalFullStop(text))} /> : null}
        </div>
      </div> : null}
    </section>)}

    {dialogAfter !== null ? <div className="transform-overlay" role="presentation">
      <div className="transform-dialog table-create-dialog" role="dialog" aria-modal="true" aria-labelledby="table-create-title">
        <h2 id="table-create-title">அட்டவணை சேர்க்க</h2>
        <div className="table-size-fields">
          <label className="field"><span className="field__label">வரிகளின் எண்ணிக்கை</span><input type="number" min="1" max={MAX_TABLE_ROWS} value={rowCount} onChange={(event) => setRowCount(Number(event.target.value))} /></label>
          <label className="field"><span className="field__label">நெடுவரிசைகளின் எண்ணிக்கை</span><input type="number" min="1" max={MAX_TABLE_COLUMNS} value={columnCount} onChange={(event) => setColumnCount(Number(event.target.value))} /></label>
        </div>
        <label className="format-checkbox table-header-option"><input type="checkbox" checked={headerRow} onChange={(event) => setHeaderRow(event.target.checked)} /><span>முதல் வரியைத் தலைப்பாகப் பயன்படுத்தவும்</span></label>
        <div className="transform-dialog-actions">
          <button type="button" className="button button-secondary" onClick={() => setDialogAfter(null)}>வேண்டாம் / Cancel</button>
          <button type="button" className="button button-primary" onClick={addTable}>அட்டவணை உருவாக்கு</button>
        </div>
      </div>
    </div> : null}

  </div>;
}
