"use client";

import { jsPDF } from "jspdf";

function cleanText(value: string): string {
  return value
    .replace(/\\\[|\\\]|\\\(|\\\)/g, "")
    .replace(/\$\$?/g, "")
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\mathrm\{([^}]*)\}/g, "$1")
    .replace(/\\times/g, " x ")
    .replace(/\\rightarrow|\\longrightarrow/g, " -> ")
    .replace(/\\,/g, " ")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/[*_~`]/g, "")
    .replace(/\\/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\u0000-\u00FF]/g, "")
    .trim();
}

function safeFilename(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 55) || "zentrix-document"
  );
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

  const margin = 18;
  const usableWidth = width - margin * 2;
  const bottomLimit = height - 22;

  let y = 42;

  function checkPage(required: number) {
    if (y + required > bottomLimit) {
      pdf.addPage();
      y = 22;
    }
  }

  // Header
  pdf.setFillColor(15, 18, 42);
  pdf.rect(0, 0, width, 30, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("ZENTRIX AI", margin, 13);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(190, 195, 220);
  pdf.text("Think Beyond. Build Without Limits.", margin, 20);

  // Document title
  pdf.setTextColor(35, 35, 55);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);

  const titleLines = pdf.splitTextToSize(
    cleanText(title),
    usableWidth
  );

  pdf.text(titleLines, margin, y);
  y += titleLines.length * 8 + 5;

  // Date
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 135);

  pdf.text(
    "Generated " + new Date().toLocaleDateString(),
    margin,
    y
  );

  y += 10;

  // Document content
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  for (const originalLine of lines) {
    const line = originalLine.trim();

    if (!line) {
      y += 3;
      continue;
    }

    // Skip Markdown table separators
    if (/^\|?[\s:|-]+\|?$/.test(line) && line.includes("-")) {
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^[-*+]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    const quote = line.match(/^>\s?(.*)$/);
    const tableRow = line.startsWith("|");

    let text = line;
    let fontSize = 10;
    let fontStyle: "normal" | "bold" = "normal";
    let indent = 0;
    let color: [number, number, number] = [65, 68, 85];
    let gapAfter = 3;

    if (heading) {
      text = heading[2];
      fontSize = heading[1].length === 1 ? 15 : 12;
      fontStyle = "bold";
      color = [82, 55, 170];
      gapAfter = 4;
      y += 3;
    } else if (bullet || numbered) {
      text = bullet
        ? "- " + bullet[1]
        : numbered![1];

      indent = 4;
    } else if (quote) {
      text = quote[1];
      indent = 5;
      color = [95, 95, 120];
    } else if (tableRow) {
      text = line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
        .join("   |   ");

      fontSize = 8;
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

    const lineHeight = fontSize * 0.48;
    const blockHeight = wrapped.length * lineHeight + gapAfter;

    checkPage(blockHeight);

    if (quote) {
      pdf.setDrawColor(130, 95, 220);
      pdf.setLineWidth(0.7);

      pdf.line(
        margin + 1,
        y - 3,
        margin + 1,
        y + blockHeight - 3
      );
    }

    pdf.text(wrapped, margin + indent, y);

    y += blockHeight;
  }

  // Footer and page numbers
  const pageCount = pdf.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);

    pdf.setDrawColor(225, 225, 235);

    pdf.line(
      margin,
      height - 15,
      width - margin,
      height - 15
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(130, 130, 145);

    pdf.text("Created with ZENTRIX AI", margin, height - 9);

    pdf.text(
      `Page ${page} of ${pageCount}`,
      width - margin,
      height - 9,
      { align: "right" }
    );
  }

  // Download PDF
  pdf.save(`${safeFilename(title)}.pdf`);
    }
