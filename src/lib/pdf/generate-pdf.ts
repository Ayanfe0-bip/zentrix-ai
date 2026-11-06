"use client";

import { jsPDF } from "jspdf";

function extractLatexTitle(content: string): string | null {
  const match = content.match(/\\title\s*\{([^}]*)\}/i);
  return match ? cleanText(match[1]) : null;
}

function cleanText(value: string): string {
  return value
    .replace(/\\(?:textbf|textit|emph|mathrm|text|mathbf)\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:section|subsection|subsubsection|chapter)\*?\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:item)\s*/g, "• ")
    .replace(/\\(?:times)/g, " × ")
    .replace(/\\(?:rightarrow|longrightarrow)/g, " → ")
    .replace(/\\(?:alpha)/g, "α")
    .replace(/\\(?:beta)/g, "β")
    .replace(/\\(?:gamma)/g, "γ")
    .replace(/\\(?:cdot)/g, " · ")
    .replace(/\\(?:%)/g, "%")
    .replace(/\\(?:&)/g, "&")
    .replace(/\\(?:#)/g, "#")
    .replace(/\\(?:_)/g, "_")
    .replace(/\\(?:\{| \})/g, "")
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\\[|\\\]|\\\(|\\\)/g, "")
    .replace(/\\(?:begin|end)\s*\{[^}]*\}/g, "")
    .replace(/\\(?:documentclass|usepackage)(?:\[[^\]]*\])?\s*\{[^}]*\}/g, "")
    .replace(/\\(?:maketitle|tableofcontents|newpage|clearpage|centering|small|large|normalsize)/g, "")
    .replace(/\\(?:title|author|date)\s*\{[^}]*\}/g, "")
    .replace(/\\(?:hline|toprule|midrule|bottomrule)/g, "")
    .replace(/\\(?:label|ref|cite)\s*\{[^}]*\}/g, "")
    .replace(/\\(?:vspace|hspace)\s*\{[^}]*\}/g, "")
    .replace(/\\(?:[a-zA-Z]+)\*?/g, "")
    .replace(/[{}]/g, "")
    .replace(/[*_~`]/g, "")
    .replace(/\\+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function safeFilename(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 55) || "document"
  );
}

function prepareContent(content: string): string[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\\begin\{document\}/gi, "")
    .replace(/\\end\{document\}/gi, "")
    .replace(/\\maketitle/gi, "")
    .replace(/\\documentclass[^\n]*/gi, "")
    .replace(/\\usepackage[^\n]*/gi, "")
    .replace(/\\title\{[^}]*\}/gi, "")
    .replace(/\\author\{[^}]*\}/gi, "")
    .replace(/\\date\{[^}]*\}/gi, "")
    .split("\n");

  const output: string[] = [];

  for (const original of lines) {
    let line = original.trim();

    if (!line) {
      output.push("");
      continue;
    }

    // Remove LaTeX document metadata.
    if (
      /^(\\documentclass|\\usepackage|\\begin\{document\}|\\end\{document\}|\\maketitle|\\author|\\date)/i.test(line)
    ) {
      continue;
    }

    // Convert LaTeX section commands into headings.
    const section = line.match(
      /\\(section|subsection|subsubsection)\*?\s*\{([^}]*)\}/i
    );

    if (section) {
      const level =
        section[1].toLowerCase() === "section"
          ? "# "
          : "## ";

      line = level + section[2];
    }

    // Convert LaTeX itemize/enumerate items.
    line = line
      .replace(/\\begin\{(?:itemize|enumerate)\}/g, "")
      .replace(/\\end\{(?:itemize|enumerate)\}/g, "")
      .replace(/\\item\s*/g, "- ");

    line = cleanText(line);

    // Remove unwanted generic branding.
    if (
      /^zentrix ai document$/i.test(line) ||
      /^created with zentrix ai$/i.test(line) ||
      /^generated with zentrix ai$/i.test(line) ||
      /^author:\s*zentrix ai$/i.test(line) ||
      /^zentrix ai$/i.test(line)
    ) {
      continue;
    }

    if (line) output.push(line);
  }

  return output;
}

export function downloadMessageAsPdf(
  title: string,
  content: string
): void {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();

  const margin = 19;
  const usableWidth = width - margin * 2;
  const bottomLimit = height - 22;

  const extractedTitle = extractLatexTitle(content);

  let documentTitle =
    extractedTitle ||
    (title && !/zentrix ai document/i.test(title)
      ? title
      : "Untitled Document");

  documentTitle = cleanText(documentTitle);

  const lines = prepareContent(content);

  let y = 20;

  function drawPageBackground() {
    pdf.setFillColor(246, 245, 252);
    pdf.rect(0, 0, width, height, "F");

    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(
      10,
      10,
      width - 20,
      height - 20,
      3,
      3,
      "F"
    );

    pdf.setFillColor(91, 65, 160);
    pdf.rect(10, 10, width - 20, 2, "F");
  }

  function addPage() {
    pdf.addPage();
    drawPageBackground();
    y = 22;
  }

  function checkPage(required: number) {
    if (y + required > bottomLimit) {
      addPage();
    }
  }

  // First page background.
  drawPageBackground();

  // Premium title panel.
  pdf.setFillColor(238, 234, 249);
  pdf.roundedRect(
    margin - 2,
    20,
    usableWidth + 4,
    43,
    3,
    3,
    "F"
  );

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.setTextColor(42, 36, 75);

  const titleLines = pdf.splitTextToSize(
    documentTitle,
    usableWidth - 8
  );

  pdf.text(titleLines, margin + 3, 35);

  pdf.setDrawColor(130, 105, 190);
  pdf.setLineWidth(0.7);

  pdf.line(
    margin + 3,
    52,
    margin + 32,
    52
  );

  y = 73;

  // Document body.
  for (const line of lines) {
    if (!line) {
      y += 3;
      continue;
    }

    const heading = line.match(/^(#{1,2})\s+(.+)$/);
    const bullet = line.match(/^[-•]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    const quote = line.match(/^>\s?(.*)$/);

    let text = line;
    let fontSize = 10;
    let fontStyle: "normal" | "bold" = "normal";
    let color: [number, number, number] = [65, 65, 82];
    let indent = 0;
    let gap = 4;

    if (heading) {
      text = heading[2];
      fontSize = heading[1].length === 1 ? 15 : 12;
      fontStyle = "bold";
      color = [78, 55, 140];
      gap = 6;
      y += 4;
    } else if (bullet || numbered) {
      text = bullet ? "• " + bullet[1] : numbered![1];
      indent = 5;
    } else if (quote) {
      text = quote[1];
      indent = 6;
      color = [100, 90, 125];
    }

    text = cleanText(text);

    if (!text) continue;

    pdf.setFont("helvetica", fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);

    const wrapped = pdf.splitTextToSize(
      text,
      usableWidth - indent
    );

    const lineHeight = fontSize * 0.5;
    const blockHeight = wrapped.length * lineHeight + gap;

    checkPage(blockHeight);

    if (quote) {
      pdf.setDrawColor(140, 115, 195);
      pdf.setLineWidth(0.8);

      pdf.line(
        margin + 2,
        y - 3,
        margin + 2,
        y + blockHeight - 3
      );
    }

    pdf.text(wrapped, margin + indent, y);

    y += blockHeight;
  }

  // Minimal page numbers.
  const pageCount = pdf.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(135, 130, 150);

    pdf.text(
      `${page} / ${pageCount}`,
      width - margin,
      height - 15,
      { align: "right" }
    );
  }

  pdf.save(`${safeFilename(documentTitle)}.pdf`);
  }
