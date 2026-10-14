import type { GovernmentContentBlock, GovernmentTableBlock, LetterDocument } from "@/models/letter";
import { contentBlocksOrLegacy } from "@/lib/letters/governmentContent";
import PagedPreview from "@/components/letter-preview/PagedPreview";

interface LetterPreviewProps {
  letter: LetterDocument;
}

function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <div key={`${line}-${index}`}>{line || "\u00A0"}</div>
      ))}
    </>
  );
}

function BodyParagraphs({ text }: { text: string }) {
  const parts = text.split(/(\n{2,})/);
  return <>{parts.map((paragraph, index) => {
    if (index % 2 === 1 || (!paragraph && index === parts.length - 1)) return null;
    const followingBreaks = parts[index + 1]?.length ?? 0;
    const blankLineCount = Math.max(1, followingBreaks - 1);
    const lines = paragraph.split("\n");
    return <p key={`${paragraph}-${index}`} style={followingBreaks ? { marginBottom: `${blankLineCount * 1.42}em` } : undefined}>
      {lines.map((line, lineIndex) => <span key={`${line}-${lineIndex}`}>{line || "\u00A0"}{lineIndex < lines.length - 1 ? <br /> : null}</span>)}
    </p>;
  })}</>;
}

function GovernmentTable({ block }: { block: GovernmentTableBlock }) {
  const header = block.headerRow ? block.cells[0] : undefined;
  const bodyRows = block.headerRow ? block.cells.slice(1) : block.cells;
  const headerClass = block.headerBold === true ? " table-header-bold" : block.headerBold === false ? " table-header-plain" : "";
  const paddingClass = ` table-padding-${block.cellPadding ?? "normal"}`;
  return <table className={`letter-content-table${headerClass}${paddingClass}`}>
    {block.columnWidths?.length ? <colgroup>{block.columnWidths.map((width, index) => <col key={index} style={{ width: `${width}%` }} />)}</colgroup> : null}
    {header ? <thead><tr>{header.map((cell, index) => <th key={index} style={{ textAlign: block.headerAlignments?.[index] ?? "center" }}>{cell || "\u00A0"}</th>)}</tr></thead> : null}
    <tbody>{bodyRows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, columnIndex) => <td key={columnIndex} style={block.columnAlignments?.[columnIndex] ? { textAlign: block.columnAlignments[columnIndex] } : undefined}>{cell || "\u00A0"}</td>)}</tr>)}</tbody>
  </table>;
}

function GovernmentContent({ blocks }: { blocks: GovernmentContentBlock[] }) {
  return <>{blocks.map((block) => block.type === "table"
    ? <GovernmentTable block={block} key={block.id} />
    : <section className="body-text content-text-block" key={block.id}><BodyParagraphs text={block.text} /></section>)}</>;
}

function CopyRegions({ letter }: LetterPreviewProps) {
  const copyLines = letter.typeData.copyToLines ?? [];
  const submittedCopyLines = letter.typeData.submittedCopyToLines ?? [];
  return <>
    {copyLines.some((line) => line.trim()) ? <section className="copy-to"><strong>நகல்:</strong><Lines lines={copyLines} /></section> : null}
    {submittedCopyLines.some((line) => line.trim()) ? <section className="copy-to submitted-copy-to"><strong>நகல் பணிந்து அனுப்பப்படுகிறது:</strong><Lines lines={submittedCopyLines} /></section> : null}
  </>;
}

function FinancialSanctionPreview({ letter }: LetterPreviewProps) {
  const references = letter.references.filter((reference) => reference.trim());
  return <PagedPreview label="A4 financial sanction preview">
    <article className={`letter-page special-letter-page sanction-page letter-font-step-${letter.fontSizeStep}${letter.boldHeaders ? "" : " letter-page-no-bold-headers"}`} id="print-letter">
      <header className="special-document-heading">{letter.departmentHeading}</header>
      {letter.typeData.presidingOfficer ? <div className="sanction-presiding"><span>முன்னிலை :</span> {letter.typeData.presidingOfficer}</div> : null}
      <div className="sanction-meta"><span><b>ந.க.எண் :</b> {letter.fileNumber}</span><span><b>நாள் :</b> {letter.date}</span></div>
      <div className="sanction-detail"><b>பொருள் :</b><span>{letter.subject}</span></div>
      {references.length ? <div className="sanction-detail"><b>பார்வை :</b><span>{references.map((reference, index) => <span className="sanction-reference" key={`${reference}-${index}`}>{references.length > 1 ? `${index + 1}. ` : ""}{reference}</span>)}</span></div> : null}
      <section className="special-body"><BodyParagraphs text={letter.body} /></section>
      {(letter.typeData.accountHeadLines ?? []).some((line) => line.trim()) ? <section className="account-head"><Lines lines={letter.typeData.accountHeadLines ?? []} /></section> : null}
      <section className="special-signature"><Lines lines={letter.signature.lines} /></section>
      <CopyRegions letter={letter} />
    </article>
  </PagedPreview>;
}

function ReceiptPreview({ letter }: LetterPreviewProps) {
  return <PagedPreview label="A4 receipt preview">
    <article className={`letter-page special-letter-page receipt-page letter-font-step-${letter.fontSizeStep}${letter.boldHeaders ? "" : " letter-page-no-bold-headers"}`} id="print-letter">
      <header className="receipt-heading">{letter.typeData.receiptTitle || "இரசீது"}</header>
      <div className="receipt-date"><b>நாள்:</b> {letter.date}</div>
      <section className="special-body receipt-body"><BodyParagraphs text={letter.body} /></section>
      <section className="receipt-acknowledgement">
        <div><b>கையொப்பம் :</b><span>{letter.typeData.receiptSignature}</span></div>
        <div><b>பெயர் :</b><span>{letter.typeData.receiptName}</span></div>
        <div><b>முகவரி :</b><span className="receipt-address-value">{letter.typeData.receiptAddress}</span></div>
      </section>
      <CopyRegions letter={letter} />
    </article>
  </PagedPreview>;
}

function ProceedingsPreview({ letter }: LetterPreviewProps) {
  const references = letter.references.filter((reference) => reference.trim());
  return <PagedPreview label="A4 proceedings preview">
    <article className={`letter-page special-letter-page proceedings-page letter-font-step-${letter.fontSizeStep}${letter.boldHeaders ? "" : " letter-page-no-bold-headers"}`} id="print-letter">
      <div className="proceedings-top">
        <div><b>ந.க.எண்:</b> {letter.fileNumber}</div>
        <div className="proceedings-office"><Lines lines={letter.departmentHeading.split("\n")} /><div><b>நாள்:</b> {letter.date}</div></div>
      </div>
      <div className="sanction-detail"><b>பொருள் :</b><span>{letter.subject}</span></div>
      {references.length ? <div className="sanction-detail"><b>பார்வை :</b><span>{references.map((reference, index) => <span className="sanction-reference" key={`${reference}-${index}`}>{index + 1}. {reference}</span>)}</span></div> : null}
      <section className="special-body"><BodyParagraphs text={letter.body} /></section>
      <section className="special-signature"><Lines lines={letter.signature.lines} /></section>
      {letter.recipient.lines.some((line) => line.trim()) ? <section className="proceedings-recipient"><strong>பெறுநர்:</strong><Lines lines={letter.recipient.lines} /></section> : null}
      <CopyRegions letter={letter} />
    </article>
  </PagedPreview>;
}

export default function LetterPreview({ letter }: LetterPreviewProps) {
  if (letter.letterType === "financial_sanction") return <FinancialSanctionPreview letter={letter} />;
  if (letter.letterType === "receipt") return <ReceiptPreview letter={letter} />;
  if (letter.letterType === "proceedings") return <ProceedingsPreview letter={letter} />;
  const references = letter.references.filter((ref) => ref.trim().length > 0);

  return (
    <PagedPreview label="A4 letter preview">
      <article className={`letter-page letter-font-step-${letter.fontSizeStep}${letter.boldHeaders ? "" : " letter-page-no-bold-headers"}`} id="print-letter">
        <header className="letter-heading">{letter.departmentHeading}</header>

        <div className="address-grid">
          <section>
            <div className="letter-label">அனுப்புநர்</div>
            <Lines lines={letter.sender.lines} />
          </section>

          <section>
            <div className="letter-label">பெறுநர்</div>
            <Lines lines={letter.recipient.lines} />
          </section>
        </div>

        <div className="meta-grid">
          <div>
            <span className="letter-label">ந.க.எண்:</span>
            <span>{letter.fileNumber}</span>
          </div>
          <div>
            <span className="letter-label">நாள்:</span>
            <span>{letter.date}</span>
          </div>
        </div>

        <div className="salutation">{letter.salutation}</div>

        <section className="detail-row">
          <div className="detail-label">பொருள்:</div>
          <div className="detail-value">{letter.subject}</div>
        </section>

        {references.length > 0 ? (
          <section className="detail-row reference-row">
            <div className="detail-label">பார்வை:</div>
            <div className="detail-value">
              {references.length === 1 ? (
                <div>{references[0]}</div>
              ) : (
                references.map((reference, index) => (
                  <div className="reference-line" key={`${reference}-${index}`}>
                    <span>{index + 1}.</span>
                    <span>{reference}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}

        <GovernmentContent blocks={contentBlocksOrLegacy(letter.typeData.governmentContentBlocks, letter.body)} />

        <section className="signature-block">
          <div className="signature-closing">{letter.signature.closing}</div>
          <div className="signature-space" aria-hidden="true" />
          <Lines lines={letter.signature.lines} />
        </section>
        <CopyRegions letter={letter} />
      </article>
    </PagedPreview>
  );
}
