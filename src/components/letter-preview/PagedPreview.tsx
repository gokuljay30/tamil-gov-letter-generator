"use client";

import { type ReactNode, useEffect, useRef } from "react";

function overflows(page: HTMLElement) {
  return page.scrollHeight > page.clientHeight + 1;
}

function paginate(source: HTMLElement, output: HTMLElement) {
  const original = source.firstElementChild as HTMLElement | null;
  if (!original) return;
  output.replaceChildren();

  let page: HTMLElement;
  const addPage = () => {
    page = original.cloneNode(false) as HTMLElement;
    page.removeAttribute("id");
    page.classList.add("preview-a4-page");
    output.appendChild(page);
    return page;
  };
  addPage();

  const appendWhole = (node: Element) => {
    const clone = node.cloneNode(true) as HTMLElement;
    page.appendChild(clone);
    if (overflows(page) && page.children.length > 1) {
      clone.remove();
      const nextPage = addPage();
      nextPage.appendChild(clone);
    }
  };

  const appendParagraphSection = (section: Element) => {
    for (const paragraph of Array.from(section.children)) {
      let sectionClone = section.cloneNode(false) as HTMLElement;
      let paragraphClone = paragraph.cloneNode(true) as HTMLElement;
      sectionClone.appendChild(paragraphClone);
      page.appendChild(sectionClone);
      if (!overflows(page)) continue;
      sectionClone.remove();
      addPage();
      sectionClone = section.cloneNode(false) as HTMLElement;
      paragraphClone = paragraph.cloneNode(true) as HTMLElement;
      sectionClone.appendChild(paragraphClone);
      page.appendChild(sectionClone);
      if (!overflows(page)) continue;

      paragraphClone.textContent = "";
      const tokens = (paragraph.textContent ?? "").split(/(\s+)/).filter(Boolean);
      for (const token of tokens) {
        paragraphClone.append(token);
        if (!overflows(page)) continue;
        paragraphClone.lastChild?.remove();
        addPage();
        sectionClone = section.cloneNode(false) as HTMLElement;
        paragraphClone = paragraph.cloneNode(false) as HTMLElement;
        paragraphClone.append(token.trimStart());
        sectionClone.appendChild(paragraphClone);
        page.appendChild(sectionClone);
      }
    }
  };

  const appendTable = (table: HTMLTableElement) => {
    const rows = Array.from(table.tBodies[0]?.rows ?? []);
    const createTable = () => {
      const clone = table.cloneNode(false) as HTMLTableElement;
      const colgroup = table.querySelector("colgroup")?.cloneNode(true);
      const thead = table.tHead?.cloneNode(true);
      if (colgroup) clone.appendChild(colgroup);
      if (thead) clone.appendChild(thead);
      clone.appendChild(document.createElement("tbody"));
      page.appendChild(clone);
      return clone;
    };
    let tableClone = createTable();
    for (const row of rows) {
      const rowClone = row.cloneNode(true) as HTMLTableRowElement;
      tableClone.tBodies[0].appendChild(rowClone);
      if (!overflows(page)) continue;
      rowClone.remove();
      if (!tableClone.tBodies[0].rows.length) tableClone.remove();
      addPage();
      tableClone = createTable();
      tableClone.tBodies[0].appendChild(rowClone);
    }
  };

  for (const child of Array.from(original.children)) {
    if (child instanceof HTMLTableElement && child.classList.contains("letter-content-table")) appendTable(child);
    else if (child.matches(".body-text, .special-body")) appendParagraphSection(child);
    else appendWhole(child);
  }
}

export default function PagedPreview({ children, label }: { children: ReactNode; label: string }) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (sourceRef.current && outputRef.current) paginate(sourceRef.current, outputRef.current);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [children]);

  return <section className="preview-shell paged-preview" aria-label={label}>
    <div className="paged-preview-source" ref={sourceRef}>{children}</div>
    <div className="paged-preview-output is-ready" ref={outputRef} />
  </section>;
}
